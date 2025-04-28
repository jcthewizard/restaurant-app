import React, { useEffect } from 'react';
import { User, X } from 'lucide-react';
import useFriendStore from '../../store/friendStore';
import { formatDistanceToNow } from 'date-fns';

interface FriendListProps {
  onInviteClick?: (friendId: string) => void;
  showInviteButtons?: boolean;
}

const FriendList: React.FC<FriendListProps> = ({ onInviteClick, showInviteButtons = false }) => {
  const { friends, loadFriends, removeFriend, isLoadingFriends } = useFriendStore();
  
  useEffect(() => {
    loadFriends();
  }, [loadFriends]);
  
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'online':
        return <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-2"></span>;
      case 'away':
        return <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block mr-2"></span>;
      default:
        return <span className="w-3 h-3 bg-gray-400 rounded-full inline-block mr-2"></span>;
    }
  };
  
  const handleRemoveFriend = async (friendId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this friend?')) {
      await removeFriend(friendId);
    }
  };
  
  const handleInviteClick = (friendId: string) => {
    if (onInviteClick) {
      onInviteClick(friendId);
    }
  };
  
  if (isLoadingFriends) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading friends...
      </div>
    );
  }
  
  if (friends.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>You don't have any friends yet.</p>
        <p className="mt-1 text-sm">Search for users to add friends.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {friends.map((friend) => (
        <div 
          key={friend.friendId}
          className="p-3 bg-white rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
              {friend.friendAvatar ? (
                <img 
                  src={friend.friendAvatar} 
                  alt={friend.friendName} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gray-500" />
              )}
            </div>
            
            <div>
              <div className="flex items-center">
                {getStatusIndicator(friend.onlineStatus)}
                <span className="font-medium">{friend.friendName}</span>
                {friend.friendUsername && (
                  <span className="text-gray-500 text-sm ml-1">@{friend.friendUsername}</span>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                {friend.onlineStatus === 'online'
                  ? 'Online now'
                  : friend.lastSeen
                    ? `Last seen ${formatDistanceToNow(new Date(friend.lastSeen))} ago`
                    : 'Offline'
                }
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {showInviteButtons && (
              <button
                onClick={() => handleInviteClick(friend.friendId)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Invite
              </button>
            )}
            
            <button
              onClick={(e) => handleRemoveFriend(friend.friendId, e)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
              title="Remove friend"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendList