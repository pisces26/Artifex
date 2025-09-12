import React from 'react';
import { Link } from 'react-router-dom';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import { Artwork } from '@/types';

// Mock data for live auctions
const mockLiveAuctions: Artwork[] = [
  {
    id: '1',
    title: 'Abstract Dreams',
    description: 'A vibrant abstract painting exploring the depths of imagination',
    imageUrl: '/src/assets/artwork-1.jpg',
    basePrice: 15000,
    currentBid: 22000,
    artistName: 'Priya Sharma',
    status: 'live',
    auctionEndDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
  },
  {
    id: '2',
    title: 'Urban Symphony',
    description: 'Contemporary cityscape with bold geometric patterns',
    imageUrl: '/src/assets/artwork-2.jpg',
    basePrice: 25000,
    currentBid: 31000,
    artistName: 'Rahul Verma',
    status: 'live',
    auctionEndDate: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
  },
  {
    id: '3',
    title: 'Nature\'s Whisper',
    description: 'Delicate watercolor showcasing the beauty of natural landscapes',
    imageUrl: '/src/assets/artwork-3.jpg',
    basePrice: 18000,
    currentBid: 18000,
    artistName: 'Meera Patel',
    status: 'live',
    auctionEndDate: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(), // 1 hour from now
  },
];

const LiveAuctions = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Live Auctions</h1>
        <p className="text-xl text-muted-foreground">
          Bid now on these amazing artworks before time runs out!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockLiveAuctions.map((artwork) => (
          <div key={artwork.id} className="group">
            <ArtworkCard artwork={artwork} showBidButton={true} />
            <div className="mt-4">
              <Link to={`/auctions/live/${artwork.id}`}>
                <div className="w-full bg-gradient-auction text-white py-3 px-6 rounded-lg font-semibold text-center hover:shadow-glow transition-all duration-300 hover:scale-105">
                  Join Auction
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {mockLiveAuctions.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-2xl font-semibold text-muted-foreground mb-4">
            No Live Auctions Right Now
          </h3>
          <p className="text-muted-foreground mb-8">
            Check back soon or browse upcoming auctions
          </p>
          <Link to="/auctions/upcoming">
            <div className="inline-block bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              View Upcoming Auctions
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default LiveAuctions;