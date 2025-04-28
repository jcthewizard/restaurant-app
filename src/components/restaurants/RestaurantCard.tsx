import React from 'react';
import { Restaurant } from '../../types';
import { Star } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  discountPercent?: number;
  onClick?: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ 
  restaurant, 
  discountPercent,
  onClick
}) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-48 object-cover"
        />
        {discountPercent && (
          <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 font-bold">
            {discountPercent}% OFF
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">{restaurant.name}</h3>
          <span className="text-gray-700">{restaurant.priceRange}</span>
        </div>
        <div className="flex items-center mt-1">
          <Star className="h-4 w-4 text-yellow-500 fill-current" />
          <span className="ml-1 text-sm">{restaurant.rating}</span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-sm text-gray-600">{restaurant.cuisine}</span>
        </div>
        <p className="text-sm text-gray-600 mt-2 truncate">{restaurant.address}</p>
        <p className="text-sm text-gray-700 mt-2 line-clamp-2">{restaurant.description}</p>
      </div>
    </div>
  );
};

export default RestaurantCard;