import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Artwork } from '@/types';
import { Clock, Gavel, User } from 'lucide-react';

interface ArtworkCardProps {
  artwork: Artwork;
  showBidButton?: boolean;
}

const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, showBidButton = true }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-success text-success-foreground';
      case 'upcoming':
      case 'scheduled':
        return 'bg-warning text-warning-foreground';
      case 'ended':
      case 'sold':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    let targetDate: Date;
    let isUpcoming = false;

    if (artwork.status === 'live') {
      targetDate = new Date(artwork.auctionEndDate);
    } else if (artwork.status === 'upcoming' || artwork.status === 'scheduled') {
      targetDate = new Date(artwork.auctionDate);
      isUpcoming = true;
    } else {
      return '';
    }

    if (isUpcoming) {
      // For upcoming auctions, show the start time instead of countdown
      return new Date(artwork.auctionDate).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
      return 'Ended';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <Card className="group overflow-hidden shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-105">
      <div className="relative overflow-hidden">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className={`w-full object-cover transition-transform duration-300 group-hover:scale-110 ${
            artwork.status === 'upcoming' || artwork.status === 'scheduled'
              ? 'h-32 blur-sm scale-110'
              : 'h-64'
          }`}
        />
        {(artwork.status === 'upcoming' || artwork.status === 'scheduled') && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-sm font-medium">Artwork Preview</div>
              <div className="text-xs opacity-80">Available when auction starts</div>
            </div>
          </div>
        )}
        <div className="absolute top-4 left-4">
           <Badge className={getStatusColor(artwork.status)}>
             {artwork.status === 'scheduled' ? 'UPCOMING' :
              artwork.status === 'live' ? 'LIVE' :
              artwork.status.toUpperCase()}
           </Badge>
         </div>
        {(artwork.status === 'upcoming' || artwork.status === 'scheduled') && (
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1">
            <div className="flex items-center space-x-1 text-xs text-foreground">
              <Clock className="h-3 w-3" />
              <span>{getTimeRemaining()}</span>
            </div>
          </div>
        )}
      </div>
      
      <CardContent className="p-6">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {artwork.title}
            </h3>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span>{artwork.artistName}</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {artwork.description}
          </p>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-muted-foreground">
                {artwork.currentBid > artwork.basePrice ? 'Current Bid' : 'Base Price'}
              </div>
              <div className="font-bold text-lg text-foreground">
                {formatPrice(artwork.currentBid)}
              </div>
            </div>

            <div className="text-center">
              <Link to={artwork.status === 'live' ? `/auctions/live/${artwork.id}` : `/auctions/upcoming/${artwork.id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtworkCard;