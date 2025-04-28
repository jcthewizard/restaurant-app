import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import SpinWheel from '../components/spin/SpinWheel';
import RestaurantCard from '../components/restaurants/RestaurantCard';
import LobbyCard from '../components/lobby/LobbyCard';
import QRCodeGenerator from '../components/redemption/QRCodeGenerator';
import { Offer } from '../types';
import useAuthStore from '../store/authStore';
import useSpinStore from '../store/spinStore';
import useLobbyStore from '../store/lobbyStore';
import useFriendStore from '../store/friendStore';
import { History, Clock, Bell, Users } from 'lucide-react';
import { restaurants, lobbies } from '../data/mockData';
import FriendManager from '../components/friends/FriendManager';
import LobbyInvitationsCard from '../components/lobby/LobbyInvitationsCard';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentSpin, spinHistory } = useSpinStore();
  const { lobbies } = useLobbyStore();
  const { loadFriendRequests, loadLobbyInvitations, loadFriends, updateOnlineStatus } = useFriendStore();
  const navigate = useNavigate();
  
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showFriendManager, setShowFriendManager] = useState(false);
  
  useEffect(() => {
    if (user) {
      loadFriendRequests();
      loadLobbyInvitations();
      loadFriends();
      updateOnlineStatus('online');
      
      // Set up before unload handler for offline status
      const handleBeforeUnload = () => {
        updateOnlineStatus('offline');
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [user, loadFriendRequests, loadLobbyInvitations, loadFriends, updateOnlineStatus]);
  
  const handleOfferSelected = (offer: Offer) => {
    setSelectedOffer(offer);
  };
  
  const handleShowQRCode = () => {
    setShowQRCode(true);
  };
  
  const handleHideQRCode = () => {
    setShowQRCode(false);
  };
  
  const handleLobbyClick = (lobbyId: string) => {
    navigate(`/lobbies/${lobbyId}`);
  };
  
  const toggleFriendManager = () => {
    setShowFriendManager(!showFriendManager);
  };
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  // Filter for user's lobbies
  const userLobbies = lobbies.filter(lobby => 
    lobby.participants.some(p => p.userId === user.id)
  );
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user.name}!</h1>
          
          <button
            onClick={toggleFriendManager}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <Users className="mr-2 h-5 w-5" />
            {showFriendManager ? 'Close Friend Manager' : 'Manage Friends'}
          </button>
        </div>
        
        {showFriendManager && (
          <div className="mb-8">
            <FriendManager />
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
            {/* Spin Wheel Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Spin the Wheel</h2>
              <SpinWheel onOfferSelected={handleOfferSelected} />
            </div>
            
            {/* Recent Spins */}
            {spinHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <History className="mr-2 h-5 w-5 text-gray-700" />
                  <h2 className="text-xl font-bold">Recent Spins</h2>
                </div>
                
                <div className="space-y-4">
                  {spinHistory.slice(0, 3).map((spin) => (
                    <div key={spin.id} className="flex items-center border-b border-gray-200 pb-3">
                      <img 
                        src={spin.offerResult.restaurant.image} 
                        alt={spin.offerResult.restaurant.name} 
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div className="ml-3 flex-1">
                        <h3 className="font-medium">{spin.offerResult.restaurant.name}</h3>
                        <p className="text-sm text-gray-600">{spin.offerResult.restaurant.priceRange} • {spin.offerResult.restaurant.cuisine}</p>
                      </div>
                      <div className="text-red-600 font-bold">
                        {spin.offerResult.discountPercent}% OFF
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column */}
          <div>
            {/* Selected Restaurant */}
            {selectedOffer && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Your Selected Restaurant</h2>
                
                <RestaurantCard 
                  restaurant={selectedOffer.restaurant} 
                  discountPercent={selectedOffer.discountPercent}
                />
                
                <div className="mt-4 flex space-x-4">
                  {showQRCode ? (
                    <>
                      <button
                        onClick={handleHideQRCode}
                        className="flex-1 py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Hide QR Code
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleShowQRCode}
                        className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        Get QR Code
                      </button>
                    </>
                  )}
                </div>
                
                {showQRCode && user && (
                  <div className="mt-4">
                    <QRCodeGenerator offer={selectedOffer} userId={user.id} />
                  </div>
                )}
              </div>
            )}
            
            {/* Lobby Invitations */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center mb-4">
                <Bell className="mr-2 h-5 w-5 text-gray-700" />
                <h2 className="text-xl font-bold">Lobby Invitations</h2>
              </div>
              
              <LobbyInvitationsCard />
            </div>
            
            {/* Your Lobbies */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-gray-700" />
                  <h2 className="text-xl font-bold">Your Lobbies</h2>
                </div>
                <button
                  onClick={() => navigate('/lobbies/create')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Create Lobby
                </button>
              </div>
              
              {userLobbies.length > 0 ? (
                <div className="space-y-4">
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
                  <button
                    onClick={() => navigate('/lobbies/create')}
                    className="mt-2 text-red-600 hover:text-red-800"
                  >
                    Create your first lobby
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;