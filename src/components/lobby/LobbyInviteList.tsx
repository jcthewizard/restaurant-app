import React, { useState } from 'react';
import { UserPlus, X, Check, ChevronRight, Users } from 'lucide-react';
import useFriendStore from '../../store/friendStore';
import useLobbyStore from '../../store/lobbyStore';

interface LobbyInviteListProps {
  lobbyId: string;
  onClose: () => void;
}

const LobbyInviteList: React.FC<LobbyInviteListProps> = ({ lobbyId, onClose }) => {
  const { friends, loadFriends } = useFriendStore();
  const { inviteFriendsToLobby } = useLobbyStore();
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  
  // We now allow inviting all friends regardless of online status
  
  const handleToggleSelection = (friendId: string) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };
  
  const handleInvite = async () => {
    if (selectedFriends.length === 0) return;
    
    setIsInviting(true);
    
    try {
      const success = await inviteFriendsToLobby(lobbyId, selectedFriends);
      
      if (success) {
        setInviteSuccess(true);
        setSelectedFriends([]);
        
        // Close modal after 1.5 seconds
        setTimeout(() => {
          onClose();
          setInviteSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Error inviting friends:', err);
    } finally {
      setIsInviting(false);
    }
  };
  
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'online':
        return <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>;
      case 'away':
        return <span className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></span>;
      default:
        return <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></span>;
    }
  };
  
  const formatLastSeen = (lastSeen: string) => {
    if (!lastSeen) return 'Unknown';
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Invite Friends to Lobby
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="px-4 py-2 border-b">
          <p className="text-sm text-gray-600">
            Select friends to invite to your lobby:
          </p>
          <div className="flex items-center justify-between mt-1 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1"></span>
                <span>Online</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-gray-400 rounded-full inline-block mr-1"></span>
                <span>Offline</span>
              </div>
            </div>
            <span className="text-gray-500">{friends.length} friends</span>
          </div>
        </div>
        
        {inviteSuccess ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6" />
            </div>
            <p className="text-green-600 font-medium">Invitations sent successfully!</p>
          </div>
        ) : (
          <>
            <div className="p-2 max-h-60 overflow-y-auto">
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <div 
                    key={friend.friendId}
                    className={`p-2 rounded flex items-center justify-between cursor-pointer ${
                      selectedFriends.includes(friend.friendId)
                        ? 'bg-red-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleToggleSelection(friend.friendId)}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {friend.friendAvatar ? (
                            <img 
                              src={friend.friendAvatar} 
                              alt={friend.friendName} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        {getStatusIndicator(friend.onlineStatus)}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-sm">
                          {friend.friendName}
                          {friend.friendUsername && (
                            <span className="text-gray-500 ml-1">@{friend.friendUsername}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {friend.onlineStatus === 'online' 
                            ? 'Online now' 
                            : `Last seen ${formatLastSeen(friend.lastSeen)}`}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {selectedFriends.includes(friend.friendId) ? (
                        <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>You don't have any friends yet.</p>
                  <p className="text-sm mt-1">Add friends to invite them to your lobby.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t">
              <button
                onClick={handleInvite}
                disabled={selectedFriends.length === 0 || isInviting}
                className={`w-full py-2 rounded-md flex items-center justify-center ${
                  selectedFriends.length > 0 && !isInviting
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isInviting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending Invites...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite {selectedFriends.length > 0 ? `(${selectedFriends.length})` : ''}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LobbyInviteList