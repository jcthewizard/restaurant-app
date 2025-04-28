import React, { useState } from 'react';
import { Layout, Users, UserPlus, UserCheck } from 'lucide-react';
import UserSearch from './UserSearch';
import FriendList from './FriendList';
import FriendRequestsList from './FriendRequestsList';

enum Tabs {
  FRIENDS = 'friends',
  REQUESTS = 'requests',
  SEARCH = 'search'
}

const FriendManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.FRIENDS);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold flex items-center">
          <Users className="mr-2 h-5 w-5 text-gray-700" />
          Friend Management
        </h2>
      </div>
      
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === Tabs.FRIENDS
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab(Tabs.FRIENDS)}
        >
          <Users className="inline-block w-4 h-4 mr-1" />
          Friends
        </button>
        
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === Tabs.REQUESTS
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab(Tabs.REQUESTS)}
        >
          <UserCheck className="inline-block w-4 h-4 mr-1" />
          Requests
        </button>
        
        <button
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === Tabs.SEARCH
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab(Tabs.SEARCH)}
        >
          <UserPlus className="inline-block w-4 h-4 mr-1" />
          Add Friends
        </button>
      </div>
      
      <div className="p-4">
        {activeTab === Tabs.FRIENDS && <FriendList />}
        {activeTab === Tabs.REQUESTS && <FriendRequestsList />}
        {activeTab === Tabs.SEARCH && <UserSearch />}
      </div>
    </div>
  );
};

export default FriendManager;