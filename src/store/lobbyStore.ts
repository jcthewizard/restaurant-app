import { create } from 'zustand';
import { Lobby, LobbyMember, Offer } from '../types';
import { lobbies } from '../data/mockData';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import useFriendStore from './friendStore';

interface LobbyState {
  lobbies: Lobby[];
  currentLobby: Lobby | null;
  createLobby: (name: string, hostUserId: string, hostName: string, maxParticipants: number) => Lobby;
  joinLobby: (lobbyId: string, userId: string, userName: string) => boolean;
  leaveLobby: (lobbyId: string, userId: string) => boolean;
  setLobby: (lobbyId: string) => void;
  updateLobbyStatus: (lobbyId: string, status: Lobby['status']) => void;
  setSelectedOffer: (lobbyId: string, offer: Offer) => void;
  setMeetingTime: (lobbyId: string, meetingTime: string) => void;
  toggleReadyStatus: (lobbyId: string, userId: string) => void;
  inviteFriendsToLobby: (lobbyId: string, friendIds: string[]) => Promise<boolean>;
}

const useLobbyStore = create<LobbyState>((set, get) => ({
  lobbies: [...lobbies],
  currentLobby: null,
  createLobby: (name, hostUserId, hostName, maxParticipants) => {
    const newLobby: Lobby = {
      id: `lobby-${Date.now()}`,
      name,
      hostUserId,
      hostName,
      maxParticipants,
      participants: [
        {
          userId: hostUserId,
          name: hostName,
          joinedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          status: 'ready'
        }
      ],
      status: 'pending',
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    };
    
    set(state => ({
      lobbies: [newLobby, ...state.lobbies],
      currentLobby: newLobby
    }));
    
    return newLobby;
  },
  joinLobby: (lobbyId, userId, userName) => {
    const lobby = get().lobbies.find(l => l.id === lobbyId);
    
    if (!lobby) return false;
    if (lobby.participants.length >= lobby.maxParticipants) return false;
    if (lobby.participants.some(p => p.userId === userId)) return false;
    
    const newMember: LobbyMember = {
      userId,
      name: userName,
      joinedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      status: 'not-ready'
    };
    
    set(state => ({
      lobbies: state.lobbies.map(l => 
        l.id === lobbyId 
          ? { ...l, participants: [...l.participants, newMember] }
          : l
      ),
      currentLobby: state.currentLobby?.id === lobbyId 
        ? { ...state.currentLobby, participants: [...state.currentLobby.participants, newMember] }
        : state.currentLobby
    }));
    
    return true;
  },
  leaveLobby: (lobbyId, userId) => {
    const lobby = get().lobbies.find(l => l.id === lobbyId);
    
    if (!lobby) return false;
    
    // If the host is leaving, the lobby should be removed
    if (lobby.hostUserId === userId) {
      set(state => ({
        lobbies: state.lobbies.filter(l => l.id !== lobbyId),
        currentLobby: state.currentLobby?.id === lobbyId ? null : state.currentLobby
      }));
      return true;
    }
    
    // Otherwise, just remove the participant
    set(state => ({
      lobbies: state.lobbies.map(l => 
        l.id === lobbyId 
          ? { ...l, participants: l.participants.filter(p => p.userId !== userId) }
          : l
      ),
      currentLobby: state.currentLobby?.id === lobbyId 
        ? { ...state.currentLobby, participants: state.currentLobby.participants.filter(p => p.userId !== userId) }
        : state.currentLobby
    }));
    
    return true;
  },
  setLobby: (lobbyId) => {
    const lobby = get().lobbies.find(l => l.id === lobbyId) || null;
    set({ currentLobby: lobby });
  },
  updateLobbyStatus: (lobbyId, status) => {
    set(state => ({
      lobbies: state.lobbies.map(l => 
        l.id === lobbyId ? { ...l, status } : l
      ),
      currentLobby: state.currentLobby?.id === lobbyId 
        ? { ...state.currentLobby, status }
        : state.currentLobby
    }));
  },
  setSelectedOffer: (lobbyId, offer) => {
    set(state => ({
      lobbies: state.lobbies.map(l => 
        l.id === lobbyId ? { ...l, selectedOffer: offer, status: 'selected' } : l
      ),
      currentLobby: state.currentLobby?.id === lobbyId 
        ? { ...state.currentLobby, selectedOffer: offer, status: 'selected' }
        : state.currentLobby
    }));
  },
  setMeetingTime: (lobbyId, meetingTime) => {
    set(state => ({
      lobbies: state.lobbies.map(l => 
        l.id === lobbyId ? { ...l, meetingTime } : l
      ),
      currentLobby: state.currentLobby?.id === lobbyId 
        ? { ...state.currentLobby, meetingTime }
        : state.currentLobby
    }));
  },
  toggleReadyStatus: (lobbyId, userId) => {
    set(state => {
      // Update the lobby in the list
      const updatedLobbies = state.lobbies.map(lobby => {
        if (lobby.id !== lobbyId) return lobby;
        
        return {
          ...lobby,
          participants: lobby.participants.map(participant => {
            if (participant.userId !== userId) return participant;
            
            return {
              ...participant,
              status: participant.status === 'ready' ? 'not-ready' : 'ready'
            };
          })
        };
      });
      
      // Update the current lobby if it's the one we're modifying
      let updatedCurrentLobby = state.currentLobby;
      if (updatedCurrentLobby && updatedCurrentLobby.id === lobbyId) {
        updatedCurrentLobby = {
          ...updatedCurrentLobby,
          participants: updatedCurrentLobby.participants.map(participant => {
            if (participant.userId !== userId) return participant;
            
            return {
              ...participant,
              status: participant.status === 'ready' ? 'not-ready' : 'ready'
            };
          })
        };
      }
      
      return {
        lobbies: updatedLobbies,
        currentLobby: updatedCurrentLobby
      };
    });
  },
  
  inviteFriendsToLobby: async (lobbyId: string, friendIds: string[]) => {
    const lobby = get().lobbies.find(l => l.id === lobbyId);
    if (!lobby) return false;
    
    const { sendLobbyInvitation } = useFriendStore.getState();
    
    try {
      const results = await Promise.all(
        friendIds.map(friendId => sendLobbyInvitation(lobbyId, friendId, lobby.name))
      );
      
      return results.every(result => result === true);
    } catch (err) {
      console.error('Error inviting friends to lobby:', err);
      return false;
    }
  }
}));

export default useLobbyStore;