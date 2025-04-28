import { Lobby, Offer, Restaurant, User } from '../types';
import { format } from 'date-fns';

// Mock Users
export const currentUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  spinsRemaining: 3,
};

// Mock Restaurants
export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Mama Mia Italian',
    address: '123 Main St, Anytown, USA',
    priceRange: '$$',
    description: 'Family-owned Italian restaurant serving authentic pasta and pizza since 1985.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'Italian',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Tokyo Sushi Bar',
    address: '456 Oak Ave, Anytown, USA',
    priceRange: '$$$',
    description: 'Premium sushi experience with fresh ingredients imported daily from Japan.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'Japanese',
    rating: 4.8,
  },
  {
    id: '3',
    name: 'Taco Fiesta',
    address: '789 Elm Blvd, Anytown, USA',
    priceRange: '$',
    description: 'Authentic Mexican street food in a vibrant, casual setting.',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'Mexican',
    rating: 4.2,
  },
  {
    id: '4',
    name: 'The Burger Joint',
    address: '101 Pine St, Anytown, USA',
    priceRange: '$',
    description: 'Juicy, handcrafted burgers made with locally sourced beef.',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'American',
    rating: 4.3,
  },
  {
    id: '5',
    name: 'Golden Dragon',
    address: '202 Maple Rd, Anytown, USA',
    priceRange: '$$',
    description: 'Family-run Chinese restaurant known for its dim sum and Peking duck.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'Chinese',
    rating: 4.1,
  },
  {
    id: '6',
    name: 'Le Petit Bistro',
    address: '303 Walnut Dr, Anytown, USA',
    priceRange: '$$$',
    description: 'Elegant French cuisine with an emphasis on seasonal ingredients.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'French',
    rating: 4.7,
  },
];

// Mock Offers
export const offers: Offer[] = restaurants.map((restaurant) => ({
  id: `offer-${restaurant.id}`,
  restaurantId: restaurant.id,
  restaurant,
  discountPercent: Math.floor(Math.random() * (30 - 10 + 1) + 10), // Random discount between 10-30%
  validFrom: format(new Date(), 'yyyy-MM-dd'),
  validTo: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days from now
  maxRedemptions: 100,
  currentRedemptions: Math.floor(Math.random() * 20),
}));

// Mock Lobbies
export const lobbies: Lobby[] = [
  {
    id: '1',
    name: 'Friday Night Dinner',
    hostUserId: '2',
    hostName: 'Sarah Smith',
    maxParticipants: 6,
    participants: [
      { userId: '2', name: 'Sarah Smith', joinedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'), status: 'ready' },
      { userId: '3', name: 'Mike Johnson', joinedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'), status: 'not-ready' },
    ],
    status: 'pending',
    createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
  },
  {
    id: '2',
    name: 'Team Lunch',
    hostUserId: '4',
    hostName: 'Alex Brown',
    maxParticipants: 4,
    participants: [
      { userId: '4', name: 'Alex Brown', joinedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'), status: 'ready' },
      { userId: '5', name: 'Emma Davis', joinedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'), status: 'ready' },
      { userId: '6', name: 'Tom Wilson', joinedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'), status: 'not-ready' },
    ],
    status: 'spinning',
    createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
  },
];

// Helper function to get filtered offers by price range
export const getOffersByPriceRange = (priceRange: string): Offer[] => {
  return offers.filter(offer => offer.restaurant.priceRange === priceRange);
};

// Helper function to get a random offer by price range
export const getRandomOffer = (priceRange: string): Offer => {
  const filteredOffers = getOffersByPriceRange(priceRange);
  return filteredOffers[Math.floor(Math.random() * filteredOffers.length)];
};