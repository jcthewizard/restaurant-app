import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLobbyStore from '../../store/lobbyStore';
import useAuthStore from '../../store/authStore';

const CreateLobbyForm: React.FC = () => {
  const { user } = useAuthStore();
  const { createLobby } = useLobbyStore();
  const navigate = useNavigate();
  
  const [lobbyName, setLobbyName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(4);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    const newLobby = createLobby(lobbyName, user.id, user.name, maxParticipants);
    navigate(`/lobbies/${newLobby.id}`);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create a Dining Lobby</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="lobbyName" className="block text-sm font-medium text-gray-700 mb-1">
            Lobby Name
          </label>
          <input
            id="lobbyName"
            type="text"
            value={lobbyName}
            onChange={(e) => setLobbyName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="e.g., Friday Night Dinner"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Participants
          </label>
          <select
            id="maxParticipants"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            {[2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                {num} people
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
        >
          Create Lobby
        </button>
      </form>
    </div>
  );
};

export default CreateLobbyForm;