import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, ArrowLeft, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UpcomingAuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [artwork, setArtwork] = useState<any>(null);
  const [timeToStart, setTimeToStart] = useState(0);
  const [isReminded, setIsReminded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/artworks/${id}`);
        const data = await res.json();

        if (data.success) {
          const artworkData = data.artwork;
          setArtwork({
            id: artworkData._id,
            title: artworkData.title,
            description: artworkData.description,
            imageUrl: `http://localhost:5000${artworkData.imageUrl}`,
            basePrice: artworkData.basePrice,
            artistName: artworkData.artist?.name || 'Unknown Artist',
            status: 'upcoming',
            auctionStartDate: artworkData.auctionDate,
            category: artworkData.category || 'Uncategorized',
          });
        } else {
          toast({ title: "Error", description: "Artwork not found", variant: "destructive" });
          navigate('/auctions/upcoming');
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
    if (artwork?.auctionStartDate) {
      const auctionStartTime = new Date(artwork.auctionStartDate).getTime();
      const now = Date.now();
      const initialTimeToStart = Math.max(0, auctionStartTime - now);
      setTimeToStart(initialTimeToStart);

      const timer = setInterval(() => {
        setTimeToStart(prev => Math.max(0, prev - 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [artwork]);

  const formatTime = (ms: number) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRemindMe = () => {
    setIsReminded(true);
    toast({
      title: "Reminder Set!",
      description: "We'll notify you when this auction goes live.",
    });
  };

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
          <Button onClick={() => navigate('/auctions/upcoming')}>
            Back to Upcoming Auctions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/auctions/upcoming')}
        className="mb-6 flex items-center space-x-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Upcoming Auctions</span>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Artwork Display */}
        <div className="space-y-6">
          <div className="relative">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="w-full h-96 object-cover rounded-lg shadow-elegant filter blur-sm"
            />
            <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-lg font-semibold mb-2">Artwork Preview</div>
                <div className="text-sm opacity-90">Full image available when auction starts</div>
              </div>
            </div>
            <div className="absolute top-4 left-4">
              <Badge className="bg-warning text-warning-foreground">
                UPCOMING
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

        {/* Auction Info Section */}
        <div className="space-y-6">
          {/* Countdown Timer */}
          <div className="bg-card rounded-lg p-6 border shadow-card">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">Auction Starts In</span>
            </div>
            <div className="text-4xl font-bold text-center text-primary">
              {formatTime(timeToStart)}
            </div>
          </div>

          {/* Base Price */}
          <div className="bg-card rounded-lg p-6 border shadow-card">
            <div className="text-center space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Starting Base Price</h3>
              <div className="text-3xl font-bold text-foreground">
                {formatPrice(artwork.basePrice)}
              </div>
              <div className="text-sm text-muted-foreground">
                Bidding will start from this amount
              </div>
            </div>
          </div>

          {/* Auction Details */}
          <div className="bg-card rounded-lg p-6 border shadow-card">
            <h3 className="font-semibold text-foreground mb-4">Auction Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium text-foreground">
                  {formatDate(artwork.auctionStartDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge className="bg-warning text-warning-foreground">
                  Upcoming
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium text-foreground">{artwork.category}</span>
              </div>
            </div>
          </div>

          {/* Remind Me Button */}
          <div className="bg-card rounded-lg p-6 border shadow-card">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-foreground flex items-center justify-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Get Notified</span>
              </h3>
              <p className="text-sm text-muted-foreground">
                Don't miss this auction! Get reminded when it goes live.
              </p>
              <Button 
                onClick={handleRemindMe}
                disabled={isReminded}
                className="w-full"
                variant={isReminded ? "outline" : "default"}
              >
                {isReminded ? "Reminder Set!" : "Remind Me"}
              </Button>
            </div>
          </div>

          {/* Interest Note */}
          <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-l-primary">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This auction is scheduled to go live soon. 
              You'll be able to place bids once the auction starts. 
              Make sure you're logged in and ready!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingAuctionDetails;