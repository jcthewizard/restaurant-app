import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import LobbyCard from '../components/lobby/LobbyCard';
import CreateLobbyForm from '../components/lobby/CreateLobbyForm';
import useLobbyStore from '../store/lobbyStore';
import useAuthStore from '../store/authStore';
import useFriendStore from '../store/friendStore';
import { Plus, Users, Bell } from 'lucide-react';
import LobbyInvitationsCard from '../components/lobby/LobbyInvitationsCard';

const LobbiesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { lobbies } = useLobbyStore();
  const { lobbyInvitations } = useFriendStore();
  const navigate = useNavigate();
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  // Filter for lobbies the user is part of
  const userLobbies = lobbies.filter(lobby => 
    lobby.participants.some(p => p.userId === user.id)
  );
  
  // Filter for public lobbies the user is not part of
  const availableLobbies = lobbies.filter(lobby => 
    !lobby.participants.some(p => p.userId === user.id) &&
    lobby.participants.length < lobby.maxParticipants &&
    lobby.status === 'pending'
  );
  
  const handleLobbyClick = (lobbyId: string) => {
    navigate(`/lobbies/${lobbyId}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dining Lobbies</h1>
          <p className="text-gray-600">Join or create a lobby to dine with friends and get group discounts</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Create Lobby Form */}
          <div>
            <CreateLobbyForm />
            
            {/* Lobby Invitations */}
            {lobbyInvitations.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                <div className="flex items-center mb-4">
                  <Bell className="mr-2 h-5 w-5 text-gray-700" />
                  <h2 className="text-xl font-bold">Lobby Invitations</h2>
                </div>
                <LobbyInvitationsCard />
              </div>
            )}
          </div>
          
          {/* Your Lobbies */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center mb-4">
                <Users className="h-5 w-5 mr-2 text-gray-700" />
                <h2 className="text-xl font-bold">Your Lobbies</h2>
              </div>
              
              {userLobbies.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {userLobbies.map((lobby) => (
                    <LobbyCard 
                      key={lobby.id} 
                      lobby={lobby} 
                      onClick={() => handleLobbyClick(lobby.id)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>You're not part of any lobbies yet.</p>
                  <p className="mt-1">Create one or join an available lobby below.</p>
                </div>
              )}
            </div>
            
            {/* Available Lobbies */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Plus className="h-5 w-5 mr-2 text-gray-700" />
                <h2 className="text-xl font-bold">Available Lobbies</h2>
              </div>
              
              {availableLobbies.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {availableLobbies.map((lobby) => (
                    <LobbyCard 
                      key={lobby.id} 
                      lobby={lobby} 
                      onClick={() => handleLobbyClick(lobby.id)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No available lobbies at the moment.</p>
                  <p className="mt-1">Create one to start inviting friends!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbiesPage;