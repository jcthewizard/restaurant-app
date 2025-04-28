import React, { useEffect } from 'react';
import { Bell, ArrowRight, Check, X } from 'lucide-react';
import useFriendStore from '../../store/friendStore';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const LobbyInvitationsCard: React.FC = () => {
  const { 
    lobbyInvitations, 
    loadLobbyInvitations, 
    acceptLobbyInvitation, 
    declineLobbyInvitation,
    isLoadingInvitations
  } = useFriendStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    loadLobbyInvitations();
  }, [loadLobbyInvitations]);
  
  const handleAccept = async (invitationId: string, lobbyId: string) => {
    const success = await acceptLobbyInvitation(invitationId);
    if (success) {
      navigate(`/lobbies/${lobbyId}`);
    }
  };
  
  const handleDecline = async (invitationId: string) => {
    await declineLobbyInvitation(invitationId);
  };
  
  if (isLoadingInvitations) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading invitations...
      </div>
    );
  }
  
  if (lobbyInvitations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No pending lobby invitations.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {lobbyInvitations.map((invitation) => (
        <div 
          key={invitation.id}
          className="p-3 bg-white rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{invitation.lobbyName}</h4>
              <p className="text-sm text-gray-500">
                Invited by {invitation.senderName} • {formatDistanceToNow(new Date(invitation.createdAt))} ago
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleAccept(invitation.id, invitation.lobbyId)}
                className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                title="Accept"
              >
                <Check className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleDecline(invitation.id)}
                className="p-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                title="Decline"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => handleAccept(invitation.id, invitation.lobbyId)}
              className="text-xs flex items-center text-red-600 hover:text-red-800"
            >
              View Lobby
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LobbyInvitationsCard;