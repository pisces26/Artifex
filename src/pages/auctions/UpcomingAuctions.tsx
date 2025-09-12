import React from 'react';
import { Link } from 'react-router-dom';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import { Artwork } from '@/types';

// Mock data for upcoming auctions
const mockUpcomingAuctions: Artwork[] = [
  {
    id: '4',
    title: 'Mystic Landscapes',
    description: 'Oil painting capturing the mystical beauty of mountain ranges',
    imageUrl: '/src/assets/artwork-1.jpg',
    basePrice: 20000,
    currentBid: 20000,
    artistName: 'Arjun Kumar',
    status: 'upcoming',
    auctionEndDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
  },
  {
    id: '5',
    title: 'Digital Renaissance',
    description: 'Modern digital art blending classical techniques with contemporary themes',
    imageUrl: '/src/assets/artwork-2.jpg',
    basePrice: 12000,
    currentBid: 12000,
    artistName: 'Sofia Iyer',
    status: 'upcoming',
    auctionEndDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 2 days from now
  },
  {
    id: '6',
    title: 'Cultural Mosaic',
    description: 'Mixed media artwork celebrating Indian cultural diversity',
    imageUrl: '/src/assets/artwork-3.jpg',
    basePrice: 30000,
    currentBid: 30000,
    artistName: 'Vikram Singh',
    status: 'upcoming',
    auctionEndDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 3 days from now
  },
];

const UpcomingAuctions = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Upcoming Auctions</h1>
        <p className="text-xl text-muted-foreground">
          Get ready for these exciting upcoming art auctions!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockUpcomingAuctions.map((artwork) => (
          <div key={artwork.id} className="group">
            <ArtworkCard artwork={artwork} showBidButton={false} />
            <div className="mt-4">
              <Link to={`/auctions/upcoming/${artwork.id}`}>
                <div className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold text-center hover:bg-primary/90 transition-all duration-300 hover:scale-105">
                  View Details
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {mockUpcomingAuctions.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-2xl font-semibold text-muted-foreground mb-4">
            No Upcoming Auctions Scheduled
          </h3>
          <p className="text-muted-foreground mb-8">
            Check back soon for new auction announcements
          </p>
          <Link to="/auctions/live">
            <div className="inline-block bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Browse Live Auctions
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingAuctions;