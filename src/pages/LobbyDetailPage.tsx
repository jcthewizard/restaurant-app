import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import SpinWheel from '../components/spin/SpinWheel';
import QRCodeGenerator from '../components/redemption/QRCodeGenerator';
import useAuthStore from '../store/authStore';
import useLobbyStore from '../store/lobbyStore';
import useFriendStore from '../store/friendStore';
import { Offer } from '../types';
import { Clock, MessageSquare, User, X, Check, UserPlus } from 'lucide-react';
import LobbyInviteList from '../components/lobby/LobbyInviteList';

const LobbyDetailPage: React.FC = () => {
  const { id: lobbyId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    lobbies, 
    setLobby, 
    currentLobby, 
    joinLobby, 
    leaveLobby, 
    toggleReadyStatus, 
    updateLobbyStatus, 
    setSelectedOffer, 
    setMeetingTime
  } = useLobbyStore();
  const { friends } = useFriendStore();
  
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{id: string, userId: string, userName: string, message: string, timestamp: string}>>(
    [
      {
        id: '1',
        userId: '2',
        userName: 'Sarah Smith',
        message: 'Hey everyone! Where should we eat tonight?',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        userId: '3',
        userName: 'Mike Johnson',
        message: 'I\'m craving Italian food',
        timestamp: new Date().toISOString()
      }
    ]
  );
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTimeLocal] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  useEffect(() => {
    if (lobbyId) {
      setLobby(lobbyId);
    }
  }, [lobbyId, setLobby, lobbies]);
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  if (!currentLobby) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Lobby not found or no longer available</p>
          <button
            onClick={() => navigate('/lobbies')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Lobbies
          </button>
        </div>
      </div>
    );
  }
  
  const isUserInLobby = currentLobby.participants.some(p => p.userId === user.id);
  const isUserHost = currentLobby.hostUserId === user.id;
  const isUserReady = currentLobby.participants.find(p => p.userId === user.id)?.status === 'ready';
  const allUsersReady = currentLobby.participants.every(p => p.status === 'ready');
  
  const handleJoinLobby = () => {
    if (user) {
      joinLobby(currentLobby.id, user.id, user.name);
    }
  };
  
  const handleLeaveLobby = () => {
    if (user) {
      leaveLobby(currentLobby.id, user.id);
      navigate('/lobbies');
    }
  };
  
  const handleToggleReady = () => {
    if (user) {
      toggleReadyStatus(currentLobby.id, user.id);
    }
  };
  
  const handleStartSpin = () => {
    updateLobbyStatus(currentLobby.id, 'spinning');
  };
  
  const handleOfferSelected = (offer: Offer) => {
    setSelectedOffer(currentLobby.id, offer);
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!chatMessage.trim() || !user) return;
    
    const newMessage = {
      id: `msg-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      message: chatMessage.trim(),
      timestamp: new Date().toISOString()
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatMessage('');
  };
  
  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingDate || !meetingTime) return;
    
    const meetingDateTime = new Date(`${meetingDate}T${meetingTime}`);
    setMeetingTime(currentLobby.id, meetingDateTime.toISOString());
  };
  
  const handleShowQRCode = () => {
    setShowQRCode(true);
  };
  
  const handleHideQRCode = () => {
    setShowQRCode(false);
  };
  
  const toggleInviteModal = () => {
    setShowInviteModal(!showInviteModal);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{currentLobby.name}</h1>
            <p className="text-gray-600">
              Hosted by {currentLobby.hostName} • {currentLobby.participants.length}/{currentLobby.maxParticipants} participants
            </p>
            {currentLobby.meetingTime && (
              <div className="flex items-center mt-2 text-sm text-gray-700">
                <Clock className="h-4 w-4 mr-1" />
                <span>Meeting at {new Date(currentLobby.meetingTime).toLocaleString()}</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            {isUserInLobby && isUserHost && (
              <button
                onClick={toggleInviteModal}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Invite Friends
              </button>
            )}
            
            {isUserInLobby ? (
              <button
                onClick={handleLeaveLobby}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Leave Lobby
              </button>
            ) : (
              <button
                onClick={handleJoinLobby}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={currentLobby.participants.length >= currentLobby.maxParticipants}
              >
                {currentLobby.participants.length >= currentLobby.maxParticipants 
                  ? 'Lobby Full' 
                  : 'Join Lobby'}
              </button>
            )}
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column - Participants */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Participants</h2>
              
              <div className="space-y-3">
                {currentLobby.participants.map((participant) => (
                  <div key={participant.userId} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-gray-600" />
                      <span>
                        {participant.name}
                        {participant.userId === currentLobby.hostUserId && (
                          <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Host</span>
                        )}
                      </span>
                    </div>
                    <div>
                      {participant.status === 'ready' ? (
                        <span className="flex items-center text-green-600">
                          <Check className="h-4 w-4 mr-1" />
                          Ready
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-500">
                          <X className="h-4 w-4 mr-1" />
                          Not ready
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {isUserInLobby && (
                <div className="mt-6">
                  <button
                    onClick={handleToggleReady}
                    className={`w-full py-2 px-4 rounded-md ${
                      isUserReady 
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isUserReady ? 'I\'m Not Ready' : 'I\'m Ready'}
                  </button>
                  
                  {isUserHost && currentLobby.status === 'pending' && (
                    <button
                      onClick={handleStartSpin}
                      disabled={!allUsersReady}
                      className={`w-full mt-2 py-2 px-4 rounded-md ${
                        allUsersReady 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Start Group Spin
                    </button>
                  )}
                  
                  {currentLobby.selectedOffer && (
                    <button
                      onClick={handleShowQRCode}
                      className="w-full mt-2 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      View Group QR Code
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {isUserInLobby && !currentLobby.meetingTime && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-xl font-bold mb-4">Schedule Meeting</h2>
                
                <form onSubmit={handleScheduleMeeting}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTimeLocal(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Schedule
                  </button>
                </form>
              </div>
            )}
          </div>
          
          {/* Middle Column - Spin Wheel or QR Code */}
          <div>
            {showQRCode && currentLobby.selectedOffer ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Group QR Code</h2>
                  <button
                    onClick={handleHideQRCode}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <QRCodeGenerator 
                  offer={currentLobby.selectedOffer} 
                  lobby={currentLobby}
                  userId={user.id}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">
                  {currentLobby.status === 'spinning' ? 'Spinning for the Group' : 'Group Selection'}
                </h2>
                
                {currentLobby.status === 'spinning' ? (
                  <SpinWheel onOfferSelected={handleOfferSelected} isLobby={true} />
                ) : currentLobby.selectedOffer ? (
                  <div className="text-center">
                    <p className="text-lg mb-4">
                      Your group has selected:
                    </p>
                    <div className="mb-4">
                      <img 
                        src={currentLobby.selectedOffer.restaurant.image} 
                        alt={currentLobby.selectedOffer.restaurant.name} 
                        className="w-full h-48 object-cover rounded-md mb-2"
                      />
                      <h3 className="font-bold text-xl mt-2">{currentLobby.selectedOffer.restaurant.name}</h3>
                      <p className="text-sm text-gray-600">{currentLobby.selectedOffer.restaurant.cuisine} • {currentLobby.selectedOffer.restaurant.priceRange}</p>
                      <p className="text-sm text-gray-600 mt-1">{currentLobby.selectedOffer.restaurant.address}</p>
                      <p className="text-red-600 font-bold text-lg mt-2">
                        {currentLobby.selectedOffer.discountPercent}% OFF for your group!
                      </p>
                    </div>
                    
                    <button
                      onClick={handleShowQRCode}
                      className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Show Group QR Code
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {currentLobby.status === 'pending' ? (
                      <>
                        <p>Waiting for all participants to be ready</p>
                        <p className="mt-1">The host will start the spin when everyone is ready</p>
                      </>
                    ) : (
                      <p>No restaurant selected yet</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Right Column - Chat */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 h-[500px] flex flex-col">
              <div className="flex items-center mb-4">
                <MessageSquare className="h-5 w-5 mr-2 text-gray-700" />
                <h2 className="text-xl font-bold">Group Chat</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto mb-4">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`mb-3 ${msg.userId === user?.id ? 'text-right' : ''}`}
                  >
                    <div 
                      className={`inline-block px-3 py-2 rounded-lg ${
                        msg.userId === user?.id 
                          ? 'bg-red-100 text-red-900' 
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.userId !== user?.id && (
                        <p className="text-xs font-medium text-gray-700">{msg.userName}</p>
                      )}
                      <p>{msg.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleSendMessage} className="mt-auto">
                <div className="flex">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Type a message..."
                    disabled={!isUserInLobby}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-r-md hover:bg-red-700"
                    disabled={!isUserInLobby}
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      {showInviteModal && (
        <LobbyInviteList
          lobbyId={currentLobby.id}
          onClose={toggleInviteModal}
        />
      )}
    </div>
  );
};

export default LobbyDetailPage;