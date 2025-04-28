import React, { useState, useEffect, useRef } from 'react';
import { Offer, PriceRange } from '../../types';
import useSpinStore from '../../store/spinStore';
import useAuthStore from '../../store/authStore';
import PriceRangeFilter from '../common/PriceRangeFilter';
import { RefreshCw } from 'lucide-react';

interface SpinWheelProps {
  onOfferSelected?: (offer: Offer) => void;
  isLobby?: boolean;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ onOfferSelected, isLobby = false }) => {
  const [priceRange, setPriceRange] = useState<PriceRange>('$$');
  const { user, decreaseSpins } = useAuthStore();
  const { spinWheel, isSpinning, currentSpin } = useSpinStore();
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  const handleSpin = async () => {
    if (!user || isSpinning) return;
    
    // Reset state for new spin
    setShowResult(false);
    
    // Animate wheel (random spin between 720 and 1440 degrees)
    const newRotation = rotation + 720 + Math.floor(Math.random() * 720);
    setRotation(newRotation);
    
    // Decrease user's remaining spins
    decreaseSpins();
    
    // Perform the actual spin
    await spinWheel(user.id, priceRange);
    
    // Show result after wheel finishes spinning
    setTimeout(() => {
      setShowResult(true);
      if (currentSpin && onOfferSelected) {
        onOfferSelected(currentSpin.offerResult);
      }
    }, 3000); // This should match the CSS transition time
  };
  
  // Helper to render wheel segments
  const renderWheelSegments = () => {
    // In a real implementation, we would use actual restaurant data
    // For the MVP, we'll just create placeholders
    const segments = 8;
    const segmentAngle = 360 / segments;
    
    return Array(segments).fill(0).map((_, idx) => {
      const startAngle = idx * segmentAngle;
      const backgroundColor = idx % 2 === 0 ? 'bg-red-500' : 'bg-red-600';
      
      return (
        <div
          key={idx}
          className={`absolute w-full h-full ${backgroundColor}`}
          style={{
            clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((startAngle + segmentAngle) * Math.PI / 180)}% ${50 - 50 * Math.sin((startAngle + segmentAngle) * Math.PI / 180)}%, ${50 + 50 * Math.cos(startAngle * Math.PI / 180)}% ${50 - 50 * Math.sin(startAngle * Math.PI / 180)}%)`,
          }}
        >
          <span className="absolute font-bold text-white text-sm"
                style={{
                  left: `${50 + 30 * Math.cos((startAngle + segmentAngle/2) * Math.PI / 180)}%`,
                  top: `${50 - 30 * Math.sin((startAngle + segmentAngle/2) * Math.PI / 180)}%`,
                  transform: 'translate(-50%, -50%)'
                }}>
            {idx + 1}
          </span>
        </div>
      );
    });
  };
  
  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-6">
        <PriceRangeFilter selectedRange={priceRange} onChange={setPriceRange} />
      </div>
      
      <div className="relative mb-8">
        {/* Spin wheel */}
        <div className="relative w-64 h-64 mb-6">
          <div
            ref={wheelRef}
            className="absolute w-full h-full rounded-full border-4 border-red-700 overflow-hidden transition-transform duration-3000 ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {renderWheelSegments()}
          </div>
          
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-6 h-6 bg-yellow-500 transform rotate-45"></div>
          </div>
        </div>
        
        {/* Spin button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || (user?.spinsRemaining === 0 && !isLobby)}
          className={`px-6 py-3 rounded-full shadow-lg text-white font-bold flex items-center ${
            isSpinning || (user?.spinsRemaining === 0 && !isLobby)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isSpinning ? (
            <>
              <RefreshCw className="animate-spin mr-2 h-5 w-5" />
              Spinning...
            </>
          ) : (
            'Spin the Wheel!'
          )}
        </button>
        
        {!isLobby && (
          <p className="mt-2 text-sm text-gray-600">
            {user?.spinsRemaining} spins remaining
          </p>
        )}
      </div>
      
      {/* Result section */}
      {showResult && currentSpin && (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-md w-full max-w-md">
          <h3 className="text-xl font-bold text-center mb-2">
            You got {currentSpin.offerResult.discountPercent}% off!
          </h3>
          <div className="flex items-center mt-4">
            <img
              src={currentSpin.offerResult.restaurant.image}
              alt={currentSpin.offerResult.restaurant.name}
              className="w-20 h-20 object-cover rounded-md"
            />
            <div className="ml-4">
              <h4 className="font-semibold">{currentSpin.offerResult.restaurant.name}</h4>
              <p className="text-sm text-gray-600">{currentSpin.offerResult.restaurant.cuisine} • {currentSpin.offerResult.restaurant.priceRange}</p>
              <p className="text-sm text-gray-600">{currentSpin.offerResult.restaurant.address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinWheel;