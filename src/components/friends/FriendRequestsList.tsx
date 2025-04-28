import React, { useEffect } from 'react';
import { Check, X, User } from 'lucide-react';
import useFriendStore from '../../store/friendStore';
import { formatDistanceToNow } from 'date-fns';

const FriendRequestsList: React.FC = () => {
  const { 
    friendRequests, 
    loadFriendRequests, 
    acceptFriendRequest, 
    declineFriendRequest,
    isLoadingRequests
  } = useFriendStore();
  
  useEffect(() => {
    loadFriendRequests();
  }, [loadFriendRequests]);
  
  const handleAccept = async (senderId: string) => {
    await acceptFriendRequest(senderId);
  };
  
  const handleDecline = async (senderId: string) => {
    await declineFriendRequest(senderId);
  };
  
  if (isLoadingRequests) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading requests...
      </div>
    );
  }
  
  if (friendRequests.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No pending friend requests.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {friendRequests.map((request) => (
        <div 
          key={request.senderId}
          className="p-3 bg-white rounded-lg shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
              {request.senderAvatar ? (
                <img 
                  src={request.senderAvatar} 
                  alt={request.senderName} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gray-500" />
              )}
            </div>
            
            <div>
              <div className="font-medium">
                {request.senderName}
                {request.senderUsername && (
                  <span className="text-gray-500 text-sm ml-1">@{request.senderUsername}</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(request.createdAt))} ago
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleAccept(request.senderId)}
              className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
              title="Accept"
            >
              <Check className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleDecline(request.senderId)}
              className="p-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
              title="Decline"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequestsList