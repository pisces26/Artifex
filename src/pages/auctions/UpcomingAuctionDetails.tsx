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
  
  const [timeToStart, setTimeToStart] = useState(24 * 60 * 60 * 1000); // 24 hours in ms
  const [isReminded, setIsReminded] = useState(false);

  // Mock artwork data
  const artwork = {
    id: '4',
    title: 'Mystic Landscapes',
    description: 'Oil painting capturing the mystical beauty of mountain ranges. This masterpiece showcases the artist\'s exceptional ability to blend traditional techniques with contemporary vision. The painting features dramatic lighting effects and rich textures that bring the landscape to life. Each brushstroke tells a story of nature\'s grandeur and the artist\'s deep connection with the natural world.',
    imageUrl: '/src/assets/artwork-1.jpg',
    basePrice: 20000,
    artistName: 'Arjun Kumar',
    status: 'upcoming',
    auctionStartDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeToStart(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
              className="w-full h-96 object-cover rounded-lg shadow-elegant"
            />
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
                <span className="font-medium text-foreground">Oil Painting</span>
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