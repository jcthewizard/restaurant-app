import React from 'react';
import { Lobby } from '../../types';
import { Users, Clock } from 'lucide-react';

interface LobbyCardProps {
  lobby: Lobby;
  onClick: () => void;
}

const LobbyCard: React.FC<LobbyCardProps> = ({ lobby, onClick }) => {
  const getStatusLabel = () => {
    switch (lobby.status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Pending</span>;
      case 'spinning':
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Spinning</span>;
      case 'selected':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Restaurant Selected</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">Completed</span>;
      default:
        return null;
    }
  };
  
  return (
    <div 
      className="bg-white rounded-lg shadow hover:shadow-md p-4 cursor-pointer transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg">{lobby.name}</h3>
        {getStatusLabel()}
      </div>
      
      <p className="text-sm text-gray-600 mt-1">Hosted by {lobby.hostName}</p>
      
      <div className="flex items-center mt-3 text-sm text-gray-700">
        <Users className="h-4 w-4 mr-1" />
        <span>{lobby.participants.length} / {lobby.maxParticipants} participants</span>
      </div>
      
      {lobby.meetingTime && (
        <div className="flex items-center mt-2 text-sm text-gray-700">
          <Clock className="h-4 w-4 mr-1" />
          <span>Meeting at {new Date(lobby.meetingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )}
      
      {lobby.selectedOffer && (
        <div className="mt-3 text-sm">
          <p className="font-medium">Selected: {lobby.selectedOffer.restaurant.name}</p>
          <p className="text-red-600 font-medium">{lobby.selectedOffer.discountPercent}% discount</p>
        </div>
      )}
    </div>
  );
};

export default LobbyCard;