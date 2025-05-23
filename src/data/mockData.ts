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
  // $ - Budget
  {
    id: '1',
    name: 'Taco Bell Cantina',
    address: '4229 University Way NE, Seattle, WA 98105',
    priceRange: '$',
    description: 'Fast-food Mexican-inspired chain offering tacos, burritos, and a casual vibe with a college crowd.',
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'Mexican',
    rating: 4.0,
  },
  {
    id: '2',
    name: 'Shree’s Indo-Chinese',
    address: '4201 University Way NE, Seattle, WA 98105',
    priceRange: '$',
    description: 'Popular spot serving spicy Indo-Chinese fusion food like Hakka noodles and chili paneer.',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'Indo-Chinese',
    rating: 4.1,
  },
  {
    id: '3',
    name: 'Sizzle & Crunch',
    address: '1313 NE 42nd St, Seattle, WA 98105',
    priceRange: '$',
    description: 'Build-your-own Vietnamese rice bowls and banh mi with fresh, fast ingredients.',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'Vietnamese',
    rating: 4.3,
  },

  // $$ - Midrange
  {
    id: '4',
    name: 'Xi’an Noodles',
    address: '5259 University Way NE, Seattle, WA 98105',
    priceRange: '$$',
    description: 'Famous for hand-pulled noodles and spicy Chinese-style lamb dishes in a cozy eatery.',
    image: 'https://images.unsplash.com/photo-1601050690597-cd0400eb65c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'Chinese',
    rating: 4.6,
  },
  {
    id: '5',
    name: 'Thai Tom',
    address: '4543 University Way NE, Seattle, WA 98105',
    priceRange: '$$',
    description: 'Legendary hole-in-the-wall serving fiery Thai classics with an open kitchen show.',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'Thai',
    rating: 4.7,
  },
  {
    id: '6',
    name: 'Samurai Noodle',
    address: '4138 University Way NE, Seattle, WA 98105',
    priceRange: '$$',
    description: 'Authentic Japanese ramen with rich tonkotsu broth and housemade noodles.',
    image: 'https://images.unsplash.com/photo-1598137265283-157d9646c42b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'Japanese',
    rating: 4.4,
  },

  // $$$ - Premium
  {
    id: '7',
    name: 'Mamma Melina',
    address: '5101 25th Ave NE, Seattle, WA 98105',
    priceRange: '$$$',
    description: 'Upscale Italian dining with classic pasta, wood-fired pizzas, and a sleek modern setting.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'Italian',
    rating: 4.6,
  },
  {
    id: '8',
    name: 'Din Tai Fung',
    address: '2621 NE 46th St, Seattle, WA 98105',
    priceRange: '$$$',
    description: 'Globally acclaimed Taiwanese restaurant famous for soup dumplings and wok dishes.',
    image: 'https://images.unsplash.com/photo-1606788075761-5a62cd5fd7c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'Taiwanese',
    rating: 4.8,
  },
  {
    id: '9',
    name: 'Ba Bar University Village',
    address: '2685 NE 46th St, Seattle, WA 98105',
    priceRange: '$$$',
    description: 'Trendy Vietnamese bistro with pho, rotisserie meats, and creative cocktails.',
    image: 'https://images.unsplash.com/photo-1617196038437-805ff0f7556f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    cuisine: 'Vietnamese',
    rating: 4.5,
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