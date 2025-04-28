import { create } from 'zustand';
import { Friend, FriendRequest, LobbyInvitation, OnlineStatus, User } from '../types';
import { supabase } from '../lib/supabase';
import useAuthStore from './authStore';

interface FriendState {
  // Friends
  friends: Friend[];
  isLoadingFriends: boolean;
  loadFriends: () => Promise<void>;
  addFriend: (friendId: string) => Promise<boolean>;
  removeFriend: (friendId: string) => Promise<boolean>;
  updateOnlineStatus: (status: OnlineStatus) => Promise<void>;
  
  // Friend Requests
  friendRequests: FriendRequest[];
  sentFriendRequests: FriendRequest[];
  isLoadingRequests: boolean;
  loadFriendRequests: () => Promise<void>;
  sendFriendRequest: (receiverId: string) => Promise<boolean>;
  acceptFriendRequest: (senderId: string) => Promise<boolean>;
  declineFriendRequest: (senderId: string) => Promise<boolean>;
  
  // User Search
  searchResults: User[];
  isSearching: boolean;
  searchUsers: (query: string) => Promise<void>;
  clearSearchResults: () => void;
  
  // Lobby Invitations
  lobbyInvitations: LobbyInvitation[];
  sentLobbyInvitations: LobbyInvitation[];
  isLoadingInvitations: boolean;
  loadLobbyInvitations: () => Promise<void>;
  sendLobbyInvitation: (lobbyId: string, receiverId: string, lobbyName: string) => Promise<boolean>;
  acceptLobbyInvitation: (invitationId: string) => Promise<boolean>;
  declineLobbyInvitation: (invitationId: string) => Promise<boolean>;
}

const useFriendStore = create<FriendState>((set, get) => ({
  // Friends state
  friends: [],
  isLoadingFriends: false,
  
  // Friend Requests state
  friendRequests: [],
  sentFriendRequests: [],
  isLoadingRequests: false,
  
  // User Search state
  searchResults: [],
  isSearching: false,
  
  // Lobby Invitations state
  lobbyInvitations: [],
  sentLobbyInvitations: [],
  isLoadingInvitations: false,
  
  // Friends methods
  loadFriends: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    set({ isLoadingFriends: true });
    
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          user_id,
          friend_id,
          created_at,
          profiles:friend_id (
            name,
            email,
            username,
            avatar_url,
            online_status,
            last_seen
          )
        `)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error loading friends:', error.message);
        return;
      }
      
      const friends: Friend[] = data.map(item => ({
        userId: item.user_id,
        friendId: item.friend_id,
        friendName: item.profiles.name,
        friendEmail: item.profiles.email,
        friendUsername: item.profiles.username,
        friendAvatar: item.profiles.avatar_url,
        onlineStatus: item.profiles.online_status,
        lastSeen: item.profiles.last_seen,
        createdAt: item.created_at
      }));
      
      set({ friends, isLoadingFriends: false });
    } catch (err) {
      console.error('Error loading friends:', err);
      set({ isLoadingFriends: false });
    }
  },
  
  addFriend: async (friendId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return false;
    
    try {
      // Check if we're already friends
      const { data: existingFriend } = await supabase
        .from('friends')
        .select('user_id, friend_id')
        .eq('user_id', user.id)
        .eq('friend_id', friendId)
        .maybeSingle();
      
      if (existingFriend) {
        return true; // Already friends
      }
      
      // Add friend
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: friendId
        });
      
      if (error) {
        console.error('Error adding friend:', error.message);
        return false;
      }
      
      await get().loadFriends();
      await get().loadFriendRequests();
      return true;
    } catch (err) {
      console.error('Error adding friend:', err);
      return false;
    }
  },
  
  removeFriend: async (friendId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return false;
    
    try {
      // Remove both directions of the friendship
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`user_id.eq.${user.id},user_id.eq.${friendId}`)
        .or(`friend_id.eq.${friendId},friend_id.eq.${user.id}`);
      
      if (error) {
        console.error('Error removing friend:', error.message);
        return false;
      }
      
      // Update local state
      set(state => ({
        friends: state.friends.filter(f => f.friendId !== friendId)
      }));
      
      return true;
    } catch (err) {
      console.error('Error removing friend:', err);
      return false;
    }
  },
  
  updateOnlineStatus: async (status: OnlineStatus) => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          online_status: status,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating online status:', error.message);
      }
    } catch (err) {
      console.error('Error updating online status:', err);
    }
  },
  
  // Friend Requests methods
  loadFriendRequests: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    set({ isLoadingRequests: true });
    
    try {
      // Load received requests
      const { data: receivedData, error: receivedError } = await supabase
        .from('friend_requests')
        .select(`
          sender_id,
          receiver_id,
          status,
          created_at,
          updated_at,
          sender:sender_id (
            name,
            email,
            username,
            avatar_url
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');
      
      if (receivedError) {
        console.error('Error loading friend requests:', receivedError.message);
        return;
      }
      
      // Load sent requests
      const { data: sentData, error: sentError } = await supabase
        .from('friend_requests')
        .select(`
          sender_id,
          receiver_id,
          status,
          created_at,
          updated_at,
          receiver:receiver_id (
            name,
            email,
            username,
            avatar_url
          )
        `)
        .eq('sender_id', user.id)
        .eq('status', 'pending');
      
      if (sentError) {
        console.error('Error loading sent friend requests:', sentError.message);
        return;
      }
      
      const friendRequests: FriendRequest[] = receivedData.map(item => ({
        senderId: item.sender_id,
        senderName: item.sender.name,
        senderEmail: item.sender.email,
        senderUsername: item.sender.username,
        senderAvatar: item.sender.avatar_url,
        receiverId: item.receiver_id,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      const sentFriendRequests: FriendRequest[] = sentData.map(item => ({
        senderId: item.sender_id,
        senderName: user.name,
        senderEmail: user.email,
        senderUsername: user.username,
        receiverId: item.receiver_id,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      set({ 
        friendRequests, 
        sentFriendRequests, 
        isLoadingRequests: false 
      });
    } catch (err) {
      console.error('Error loading friend requests:', err);
      set({ isLoadingRequests: false });
    }
  },
  
  sendFriendRequest: async (receiverId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return false;
    
    // Don't send request to yourself
    if (user.id === receiverId) return false;
    
    try {
      // Check if a request already exists
      const { data: existingRequest } = await supabase
        .from('friend_requests')
        .select('*')
        .or(`sender_id.eq.${user.id},sender_id.eq.${receiverId}`)
        .or(`receiver_id.eq.${receiverId},receiver_id.eq.${user.id}`)
        .maybeSingle();
      
      if (existingRequest) {
        // If there's a pending request from the receiver to the sender, accept it
        if (existingRequest.sender_id === receiverId && 
            existingRequest.receiver_id === user.id && 
            existingRequest.status === 'pending') {
          return get().acceptFriendRequest(receiverId);
        }
        
        console.log('Friend request already exists');
        return false;
      }
      
      // Check if already friends
      const { data: existingFriend } = await supabase
        .from('friends')
        .select('*')
        .eq('user_id', user.id)
        .eq('friend_id', receiverId)
        .maybeSingle();
      
      if (existingFriend) {
        console.log('Already friends');
        return true;
      }
      
      // Send the request
      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });
      
      if (error) {
        console.error('Error sending friend request:', error.message);
        return false;
      }
      
      await get().loadFriendRequests();
      return true;
    } catch (err) {
      console.error('Error sending friend request:', err);
      return false;
    }
  },
  
  acceptFriendRequest: async (senderId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return false;
    
    try {
      // Update the request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id);
      
      if (updateError) {
        console.error('Error accepting friend request:', updateError.message);
        return false;
      }
      
      // Add friend relationship
      const { error: friendError } = await supabase
        .from('friends')
        .insert({
          user_id: user.id,
          friend_id: senderId
        });
      
      if (friendError) {
        console.error('Error adding friend relationship:', friendError.message);
        return false;
      }
      
      await get().loadFriends();
      await get().loadFriendRequests();
      return true;
    } catch (err) {
      console.error('Error accepting friend request:', err);
      return false;
    }
  },
  
  declineFriendRequest: async (senderId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'declined', updated_at: new Date().toISOString() })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id);
      
      if (error) {
        console.error('Error declining friend request:', error.message);
        return false;
      }
      
      // Update local state
      set(state => ({
        friendRequests: state.friendRequests.filter(req => 
          req.senderId !== senderId || req.receiverId !== user.id
        )
      }));
      
      return true;
    } catch (err) {
      console.error('Error declining friend request:', err);
      return false;
    }
  },
  
  // User Search methods
  searchUsers: async (query: string) => {
    const { user } = useAuthStore.getState();
    if (!user || query.length < 3) {
      set({ searchResults: [] });
      return;
    }
    
    set({ isSearching: true });
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, username, avatar_url, online_status')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,username.ilike.%${query}%`)
        .neq('id', user.id) // Exclude current user
        .limit(10);
      
      if (error) {
        console.error('Error searching users:', error.message);
        set({ isSearching: false, searchResults: [] });
        return;
      }
      
      const searchResults: User[] = data.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        username: profile.username,
        role: 'user',
        spinsRemaining: 0, // Not relevant for search results
        onlineStatus: profile.online_status,
        avatarUrl: profile.avatar_url
      }));
      
      set({ searchResults, isSearching: false });
    } catch (err) {
      console.error('Error searching users:', err);
      set({ isSearching: false, searchResults: [] });
    }
  },
  
  clearSearchResults: () => {
    set({ searchResults: [] });
  },
  
  // Lobby Invitations methods
  loadLobbyInvitations: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    set({ isLoadingInvitations: true });
    
    try {
      // Load received invitations
      const { data: receivedData, error: receivedError } = await supabase
        .from('lobby_invitations')
        .select(`
          id,
          lobby_id,
          sender_id,
          receiver_id,
          status,
          created_at,
          updated_at,
          sender:sender_id (name),
          lobby:lobby_id (name)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending');
      
      if (receivedError) {
        console.error('Error loading lobby invitations:', receivedError.message);
        return;
      }
      
      // Load sent invitations
      const { data: sentData, error: sentError } = await supabase
        .from('lobby_invitations')
        .select(`
          id,
          lobby_id,
          sender_id,
          receiver_id,
          status,
          created_at,
          updated_at,
          receiver:receiver_id (name),
          lobby:lobby_id (name)
        `)
        .eq('sender_id', user.id)
        .eq('status', 'pending');
      
      if (sentError) {
        console.error('Error loading sent lobby invitations:', sentError.message);
        return;
      }
      
      const lobbyInvitations: LobbyInvitation[] = receivedData.map(item => ({
        id: item.id,
        lobbyId: item.lobby_id,
        lobbyName: item.lobby.name,
        senderId: item.sender_id,
        senderName: item.sender.name,
        receiverId: item.receiver_id,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      const sentLobbyInvitations: LobbyInvitation[] = sentData.map(item => ({
        id: item.id,
        lobbyId: item.lobby_id,
        lobbyName: item.lobby.name,
        senderId: item.sender_id,
        senderName: user.name,
        receiverId: item.receiver_id,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      set({ 
        lobbyInvitations, 
        sentLobbyInvitations, 
        isLoadingInvitations: false 
      });
    } catch (err) {
      console.error('Error loading lobby invitations:', err);
      set({ isLoadingInvitations: false });
    }
  },
  
  sendLobbyInvitation: async (lobbyId: string, receiverId: string, lobbyName: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return false;
    
    try {
      // Check if invitation already exists
      const { data: existingInvitation } = await supabase
        .from('lobby_invitations')
        .select('*')
        .eq('lobby_id', lobbyId)
        .eq('receiver_id', receiverId)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (existingInvitation) {
        console.log('Invitation already sent');
        return true;
      }
      
      // Send invitation
      const { error } = await supabase
        .from('lobby_invitations')
        .insert({
          lobby_id: lobbyId,
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });
      
      if (error) {
        console.error('Error sending lobby invitation:', error.message);
        return false;
      }
      
      // Update local state
      const newInvitation: LobbyInvitation = {
        id: `temp-${Date.now()}`, // Temporary ID until we reload
        lobbyId,
        lobbyName,
        senderId: user.id,
        senderName: user.name,
        receiverId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      set(state => ({
        sentLobbyInvitations: [...state.sentLobbyInvitations, newInvitation]
      }));
      
      return true;
    } catch (err) {
      console.error('Error sending lobby invitation:', err);
      return false;
    }
  },
  
  acceptLobbyInvitation: async (invitationId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return false;
    
    try {
      // Get the invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from('lobby_invitations')
        .select('lobby_id')
        .eq('id', invitationId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .single();
      
      if (fetchError || !invitation) {
        console.error('Error fetching invitation:', fetchError?.message || 'Invitation not found');
        return false;
      }
      
      // Update invitation status
      const { error: updateError } = await supabase
        .from('lobby_invitations')
        .update({ 
          status: 'accepted', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', invitationId);
      
      if (updateError) {
        console.error('Error accepting invitation:', updateError.message);
        return false;
      }
      
      // Update local state
      set(state => ({
        lobbyInvitations: state.lobbyInvitations.filter(inv => inv.id !== invitationId)
      }));
      
      return true;
    } catch (err) {
      console.error('Error accepting lobby invitation:', err);
      return false;
    }
  },
  
  declineLobbyInvitation: async (invitationId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('lobby_invitations')
        .update({ 
          status: 'declined', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', invitationId)
        .eq('receiver_id', user.id);
      
      if (error) {
        console.error('Error declining invitation:', error.message);
        return false;
      }
      
      // Update local state
      set(state => ({
        lobbyInvitations: state.lobbyInvitations.filter(inv => inv.id !== invitationId)
      }));
      
      return true;
    } catch (err) {
      console.error('Error declining lobby invitation:', err);
      return false;
    }
  }
}));

// Initialize status when the app loads
const initStatus = async () => {
  const { isAuthenticated, user } = useAuthStore.getState();
  
  if (isAuthenticated && user) {
    await useFriendStore.getState().updateOnlineStatus('online');
    
    // Set up an event listener for when the page is about to unload
    window.addEventListener('beforeunload', async () => {
      await useFriendStore.getState().updateOnlineStatus('offline');
    });
  }
};

// Initialize friendship system
const initFriendship = async () => {
  const { isAuthenticated } = useAuthStore.getState();
  
  if (isAuthenticated) {
    await useFriendStore.getState().loadFriends();
    await useFriendStore.getState().loadFriendRequests();
    await useFriendStore.getState().loadLobbyInvitations();
  }
};

// Setup auth state change listener to update status and load data
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN') {
    initStatus();
    initFriendship();
  } else if (event === 'SIGNED_OUT') {
    // Clear friendship data on sign out
    useFriendStore.setState({
      friends: [],
      friendRequests: [],
      sentFriendRequests: [],
      lobbyInvitations: [],
      sentLobbyInvitations: [],
      searchResults: []
    });
  }
});

export default useFriendStore;