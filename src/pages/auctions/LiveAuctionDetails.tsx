import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {useAuth} from '@/context/AuthContext';
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

  const [artwork, setArtwork] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [currentBid, setCurrentBid] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock bid history - in a real app, this would come from backend
  const [bidHistory] = useState<BidHistory[]>([
    { id: '1', bidder: 'User***23', amount: 22000, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { id: '2', bidder: 'Art***er', amount: 20000, timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { id: '3', bidder: 'Bid***99', amount: 18000, timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { id: '4', bidder: 'Col***tor', amount: 15000, timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  ]);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/artworks/${id}`);
        const data = await res.json();

        if (data.success) {
          const artworkData = data.artwork;
          const now = new Date();
          const auctionStart = new Date(artworkData.auctionDate);
          const auctionEnd = new Date(artworkData.auctionEndDate);

          const isAuctionLive = now >= auctionStart && now <= auctionEnd;
          const isAuctionEnded = now > auctionEnd;

          setArtwork({
            id: artworkData._id,
            title: artworkData.title,
            description: artworkData.description,
            imageUrl: `http://localhost:5000${artworkData.imageUrl}`,
            basePrice: artworkData.basePrice,
            artistName: artworkData.artist?.name || 'Unknown Artist',
            status: isAuctionEnded ? 'ended' : isAuctionLive ? 'live' : 'scheduled',
            auctionDate: artworkData.auctionDate,
            auctionEndDate: artworkData.auctionEndDate,
          });
          setCurrentBid(artworkData.currentBid || artworkData.basePrice);
          setIsLive(isAuctionLive && !isAuctionEnded);
        } else {
          toast({ title: "Error", description: "Artwork not found", variant: "destructive" });
          navigate('/auctions/live');
        }
      } catch (error) {
        console.error('Error fetching artwork:', error);
        toast({ title: "Error", description: "Failed to load artwork", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtwork();
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    if (artwork?.auctionEndDate) {
      const auctionEndTime = new Date(artwork.auctionEndDate).getTime();
      const now = Date.now();
      const initialTimeRemaining = Math.max(0, auctionEndTime - now);
      setTimeRemaining(initialTimeRemaining);

      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [artwork]);

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

  const handlePlaceBid = async () => {
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

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          artworkId: artwork.id,
          amount: bid,
        }),
      });

      if (response.ok) {
        setCurrentBid(bid);
        setBidAmount('');
        toast({
          title: "Bid Placed Successfully!",
          description: `Your bid of ${formatPrice(bid)} has been placed.`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Bid Failed",
          description: errorData.message || "Failed to place bid",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Bid error:', error);
      toast({
        title: "Bid Failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    }
  };

  const minBidAmount = currentBid + 1000;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h3 className="text-2xl font-semibold text-muted-foreground mb-4">
            Artwork Not Found
          </h3>
          <Button onClick={() => navigate('/auctions/live')}>
            Back to Live Auctions
          </Button>
        </div>
      </div>
    );
  }

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
              <Badge className={
                artwork?.status === 'ended'
                  ? "bg-muted text-muted-foreground"
                  : artwork?.status === 'live'
                  ? "bg-success text-success-foreground"
                  : "bg-warning text-warning-foreground"
              }>
                {artwork?.status === 'ended' ? 'AUCTION ENDED' :
                 artwork?.status === 'live' ? 'LIVE AUCTION' :
                 'UPCOMING'}
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
            {isLive ? (
              user ? (
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
              )
            ) : (
              <div className="text-center space-y-4">
                <h3 className="font-semibold text-foreground">
                  {artwork?.status === 'ended' ? 'Auction Ended' : 'Auction Not Live'}
                </h3>
                <p className="text-muted-foreground">
                  {artwork?.status === 'ended'
                    ? 'This auction has ended. Check back for future auctions.'
                    : 'This auction is not currently live. You can view details but cannot place bids.'}
                </p>
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