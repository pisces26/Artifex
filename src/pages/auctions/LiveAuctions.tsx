import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import { Artwork } from '@/types';

const LiveAuctions = () => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveAuctions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/artworks/live');
        const data = await res.json();
        if (data.success) {
          // Transform backend data to match Artwork interface
          const transformedAuctions = data.auctions.map((auction: any) => ({
            id: auction._id,
            title: auction.title,
            description: auction.description,
            imageUrl: `http://localhost:5000${auction.imageUrl}`,
            basePrice: auction.basePrice,
            currentBid: auction.basePrice, // Default to base price if no bids
            artistName: auction.artist?.name || 'Unknown Artist',
            status: auction.status, // Use actual status from backend
            auctionEndDate: auction.auctionDate,
          }));
          setAuctions(transformedAuctions);
        }
      } catch (error) {
        console.error('Error fetching live auctions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveAuctions();
  }, []);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Live Auctions</h1>
        <p className="text-xl text-muted-foreground">
          Bid now on these amazing artworks before time runs out!
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading live auctions...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions.map((artwork) => (
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
      )}

      {!loading && auctions.length === 0 && (
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