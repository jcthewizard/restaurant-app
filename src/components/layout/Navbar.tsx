import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Utensils, User, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <nav className="bg-red-600 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <Utensils className="h-8 w-8 text-white" />
            <span className="text-white font-bold text-xl">EatUp</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-red-200">
                  Dashboard
                </Link>
                <Link to="/lobbies" className="text-white hover:text-red-200">
                  Lobbies
                </Link>
                <div className="flex items-center space-x-2 text-white">
                  <User className="h-5 w-5" />
                  <span>{user?.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-white hover:text-red-200"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-red-200">
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 rounded bg-white text-red-600 hover:bg-red-100"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;