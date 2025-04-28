import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Users, Gift, Star } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div 
        className="bg-cover bg-center py-24 px-4"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80)',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover Local Restaurants with a Spin
          </h1>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Spin the wheel, get a discount, and explore family-owned restaurants in your area. 
            Perfect for solo adventures or group dining!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/signup" 
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
              Get Started
            </Link>
            <Link 
              to="/login" 
              className="bg-white hover:bg-gray-100 text-red-600 font-bold py-3 px-8 rounded-full transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Spin &amp; Win</h3>
              <p className="text-gray-600">
                Spin the wheel to get random discounts at local family-owned restaurants. 
                Filter by price range to match your budget.
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Create Lobbies</h3>
              <p className="text-gray-600">
                Invite friends to a lobby, chat in real-time, and coordinate your dining plans. 
                One spin decides where the group eats!
              </p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Earn Rewards</h3>
              <p className="text-gray-600">
                Leave reviews after your meal to earn extra spins. 
                Discover new favorite spots while supporting local businesses.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured Restaurants */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Restaurants</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Italian Restaurant" 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg">Mama Mia Italian</h3>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm">4.5</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-sm text-gray-600">Italian</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-700">$$</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Mexican Restaurant" 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg">Taco Fiesta</h3>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm">4.2</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-sm text-gray-600">Mexican</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-700">$</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Sushi Restaurant" 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg">Tokyo Sushi Bar</h3>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 text-sm">4.8</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-sm text-gray-600">Japanese</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-700">$$$</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link 
              to="/signup" 
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
              Discover More Restaurants
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Utensils className="h-8 w-8 text-white mr-2" />
              <span className="text-xl font-bold">EatUp</span>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white">About</a>
              <a href="#" className="text-gray-300 hover:text-white">For Restaurants</a>
              <a href="#" className="text-gray-300 hover:text-white">FAQs</a>
              <a href="#" className="text-gray-300 hover:text-white">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} EatUp. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;