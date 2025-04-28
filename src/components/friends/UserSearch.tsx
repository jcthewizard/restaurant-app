import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, User } from 'lucide-react';
import useFriendStore from '../../store/friendStore';

const UserSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const { 
    searchUsers, 
    searchResults, 
    isSearching, 
    clearSearchResults,
    sendFriendRequest,
    sentFriendRequests,
    friends
  } = useFriendStore();
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (query.length < 3) {
      clearSearchResults();
      return;
    }
    
    // Set a new timeout for the search
    const timeout = setTimeout(() => {
      searchUsers(query);
    }, 500); // Debounce for 500ms
    
    setSearchTimeout(timeout);
  };
  
  const handleSendRequest = async (userId: string) => {
    await sendFriendRequest(userId);
  };
  
  const isRequestSent = (userId: string) => {
    return sentFriendRequests.some(req => req.receiverId === userId);
  };
  
  const isFriend = (userId: string) => {
    return friends.some(friend => friend.friendId === userId);
  };
  
  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, email, or username"
          value={searchQuery}
          onChange={handleSearch}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
        />
      </div>
      
      {isSearching && (
        <div className="mt-2 p-2 text-gray-500 text-center text-sm">
          Searching...
        </div>
      )}
      
      {searchResults.length > 0 && (
        <div className="mt-2 border border-gray-200 rounded-md bg-white max-h-60 overflow-y-auto shadow-sm">
          {searchResults.map((user) => (
            <div 
              key={user.id}
              className="p-3 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">{user.name}</div>
                  <div className="text-gray-500 text-xs flex items-center">
                    {user.username && (
                      <span className="mr-2">@{user.username}</span>
                    )}
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>
              
              {isFriend(user.id) ? (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  Friends
                </span>
              ) : isRequestSent(user.id) ? (
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center">
                  Request Sent
                </span>
              ) : (
                <button
                  onClick={() => handleSendRequest(user.id)}
                  className="text-sm flex items-center bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Add Friend
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {searchQuery.length >= 3 && searchResults.length === 0 && !isSearching && (
        <div className="mt-2 p-2 text-gray-500 text-center text-sm">
          No users found. Try a different search term.
        </div>
      )}
    </div>
  );
};

export default UserSearch