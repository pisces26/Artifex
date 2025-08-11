import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { Clock, Gavel, User, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BidHistory {
  id: string;
  bidder: string;
  amount: number;
  timestamp: string;
}

const LiveAuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [bidAmount, setBidAmount] = useState('');
  const [currentBid, setCurrentBid] = useState(22000);
  const [timeRemaining, setTimeRemaining] = useState(2 * 60 * 60 * 1000); // 2 hours in ms
  
  // Mock artwork data
  const artwork = {
    id: '1',
    title: 'Abstract Dreams',
    description: 'A vibrant abstract painting exploring the depths of imagination. This piece represents the artist\'s journey through colors and emotions, creating a symphony of visual elements that speak to the soul.',
    imageUrl: '/src/assets/artwork-1.jpg',
    basePrice: 15000,
    artistName: 'Priya Sharma',
    status: 'live',
  };

  // Mock bid history
  const [bidHistory] = useState<BidHistory[]>([
    { id: '1', bidder: 'User***23', amount: 22000, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { id: '2', bidder: 'Art***er', amount: 20000, timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { id: '3', bidder: 'Bid***99', amount: 18000, timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { id: '4', bidder: 'Col***tor', amount: 15000, timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handlePlaceBid = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const bid = parseInt(bidAmount);
    if (bid <= currentBid) {
      toast({
        title: "Invalid Bid",
        description: `Bid must be higher than current bid of ${formatPrice(currentBid)}`,
        variant: "destructive",
      });
      return;
    }

    setCurrentBid(bid);
    setBidAmount('');
    toast({
      title: "Bid Placed Successfully!",
      description: `Your bid of ${formatPrice(bid)} has been placed.`,
    });
  };

  const minBidAmount = currentBid + 1000;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/auctions/live')}
        className="mb-6 flex items-center space-x-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Live Auctions</span>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Artwork Display */}
        <div className="space-y-6">
          <div className="relative">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full h-96 object-cover rounded-lg shadow-elegant"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-success text-success-foreground">
                LIVE AUCTION
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">{artwork.title}</h1>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>by {artwork.artistName}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {artwork.description}
            </p>
          </div>
        </div>

        {/* Bidding Section */}
        <div className="space-y-6">
          {/* Timer */}
          <div className="bg-card rounded-lg p-6 border shadow-card">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-warning" />
              <span className="font-semibold text-foreground">Time Remaining</span>
            </div>
            <div className="text-4xl font-bold text-center text-warning">
              {formatTime(timeRemaining)}
            </div>
          </div>

          {/* Current Bid */}
          <div className="bg-card rounded-lg p-6 border shadow-card">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Current Highest Bid</h3>
              <div className="text-3xl font-bold text-primary">
                {formatPrice(currentBid)}
              </div>
              <div className="text-sm text-muted-foreground">
                Base Price: {formatPrice(artwork.basePrice)}
              </div>
            </div>
          </div>

          {/* Bidding Interface */}
          <div className="bg-card rounded-lg p-6 border shadow-card">
            {user ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center space-x-2">
                  <Gavel className="h-4 w-4" />
                  <span>Place Your Bid</span>
                </h3>
                <div className="space-y-3">
                  <Input
                    type="number"
                    placeholder={`Minimum: ${formatPrice(minBidAmount)}`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min={minBidAmount}
                  />
                  <Button 
                    onClick={handlePlaceBid}
                    className="w-full bg-gradient-auction text-white hover:shadow-glow"
                    disabled={!bidAmount || parseInt(bidAmount) <= currentBid}
                  >
                    Place Bid
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <h3 className="font-semibold text-foreground">Login to Bid</h3>
                <p className="text-muted-foreground">
                  You need to be logged in to participate in this auction
                </p>
                <Button 
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Login to Bid
                </Button>
              </div>
            )}
          </div>

          {/* Bid History */}
          <div className="bg-card rounded-lg p-6 border shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Bid History</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {bidHistory.map((bid) => (
                <div key={bid.id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                  <div className="flex items-center space-x-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{bid.bidder}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      {formatPrice(bid.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimestamp(bid.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAuctionDetails;