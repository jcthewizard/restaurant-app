import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import LobbiesPage from './pages/LobbiesPage';
import LobbyDetailPage from './pages/LobbyDetailPage';
import useAuthStore from './store/authStore';
import { Loader2 } from 'lucide-react';

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [localLoading, setLocalLoading] = useState(true);
  
  useEffect(() => {
    // Give a little time for auth to initialize
    if (!isLoading) {
      setTimeout(() => setLocalLoading(false), 300);
    }
  }, [isLoading]);
  
  if (localLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-red-600 animate-spin" />
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/lobbies" 
          element={isAuthenticated ? <LobbiesPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/lobbies/create" 
          element={isAuthenticated ? <LobbiesPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/lobbies/:id" 
          element={isAuthenticated ? <LobbyDetailPage /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;