export interface User {
  id: string;
  email: string;
  name: string;
  role: 'artist' | 'bidder';
  portfolioLink?: string;
  avatar?: string;
  createdAt: Date;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  category?: string;
  imageUrl: string;
  basePrice: number;
  currentBid: number;
  artistId?: string;
  artistName: string;
  auctionDate?: string;
  auctionEndDate: string;
  status: 'upcoming' | 'live' | 'sold' | 'ended';
  createdAt?: string;
}

export interface Bid {
  id: string;
  artworkId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: Date;
}

export interface AuctionDetails {
  artwork: Artwork;
  bids: Bid[];
  isActive: boolean;
  timeRemaining: number;
}

export interface UserBid {
  id: string;
  artwork: Artwork;
  bidAmount: number;
  status: 'winning' | 'outbid' | 'won' | 'lost';
  timestamp: Date;
}

export interface Payment {
  id: string;
  artworkId: string;
  buyerId: string;
  artistId: string;
  amount: number;
  status: 'pending' | 'paid' | 'completed';
  paymentDate?: Date;
  deliveryConfirmed: boolean;
}