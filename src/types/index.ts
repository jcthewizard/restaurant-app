export type PriceRange = '$' | '$$' | '$$$';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'restaurant';
  spinsRemaining: number;
  username?: string;
  onlineStatus?: OnlineStatus;
  lastSeen?: string;
  avatarUrl?: string;
}

export type OnlineStatus = 'online' | 'offline' | 'away';

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  priceRange: PriceRange;
  description: string;
  image: string;
  cuisine: string;
  rating: number;
}

export interface Offer {
  id: string;
  restaurantId: string;
  restaurant: Restaurant;
  discountPercent: number;
  validFrom: string;
  validTo: string;
  maxRedemptions: number;
  currentRedemptions: number;
}

export interface Lobby {
  id: string;
  name: string;
  hostUserId: string;
  hostName: string;
  maxParticipants: number;
  participants: LobbyMember[];
  status: 'pending' | 'spinning' | 'selected' | 'completed';
  selectedOffer?: Offer;
  meetingTime?: string;
  createdAt: string;
}

export interface LobbyMember {
  userId: string;
  name: string;
  joinedAt: string;
  status: 'ready' | 'not-ready';
}

export interface Spin {
  id: string;
  userId: string;
  priceRange: PriceRange;
  offerResult: Offer;
  createdAt: string;
}

export interface Redemption {
  id: string;
  offerId: string;
  lobbyId?: string;
  qrCode: string;
  redeemedAt?: string;
}

export interface Review {
  id: string;
  userId: string;
  offerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Friend {
  userId: string;
  friendId: string;
  friendName: string;
  friendEmail: string;
  friendUsername?: string;
  friendAvatar?: string;
  onlineStatus: OnlineStatus;
  lastSeen: string;
  createdAt: string;
}

export interface FriendRequest {
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderUsername?: string;
  senderAvatar?: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export interface LobbyInvitation {
  id: string;
  lobbyId: string;
  lobbyName: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}