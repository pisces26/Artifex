import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Clock, IndianRupee, Trophy, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ArtistArtworkDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [artwork, setArtwork] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworkDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast({ title: "Unauthorized", description: "Please login", variant: "destructive" });
          return;
        }

        // Fetch artwork details
        const artworkRes = await fetch(`http://localhost:5000/api/artworks/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (artworkRes.status === 401) {
          toast({ title: "Unauthorized", description: "Invalid or expired token", variant: "destructive" });
          return;
        }

        const artworkData = await artworkRes.json();
        if (artworkData.success) {
          setArtwork(artworkData.artwork);
        }

        // Fetch all bids for this artwork
        const bidsRes = await fetch(`http://localhost:5000/api/bids/artwork/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (bidsRes.ok) {
          const bidsData = await bidsRes.json();
          if (bidsData.success) {
            setBids(bidsData.bids);
          }
        }

      } catch (error) {
        console.error('Error fetching artwork details:', error);
        toast({ title: "Error", description: "Failed to load artwork details", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtworkDetails();
    }
  }, [id, toast]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-gradient-live text-white";
      case "scheduled": return "bg-gradient-upcoming text-white";
      case "ended": return "bg-gradient-sold text-white";
      case "sold": return "bg-gradient-sold text-white";
      default: return "bg-secondary text-secondary-foreground";
    }
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
          <Button onClick={() => navigate('/dashboard/artist')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard/artist')}
        className="mb-6 flex items-center space-x-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to My Artworks</span>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Artwork Display */}
        <div className="space-y-6">
          <div className="relative">
            <img
              src={`http://localhost:5000${artwork.imageUrl}`}
              alt={artwork.title}
              className="w-full h-96 object-cover rounded-lg shadow-elegant"
            />
            <Badge className={`absolute top-4 left-4 ${getStatusColor(artwork.status)}`}>
              {artwork.status === 'ended' ? 'AUCTION ENDED' :
               artwork.status === 'scheduled' ? 'SCHEDULED' :
               artwork.status === 'live' ? 'LIVE AUCTION' :
               artwork.status.toUpperCase()}
            </Badge>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">{artwork.title}</h1>
            <p className="text-muted-foreground leading-relaxed">
              {artwork.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Category:</span>
                <p className="text-foreground">{artwork.category || 'Not specified'}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Base Price:</span>
                <p className="text-foreground">{formatPrice(artwork.basePrice)}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Current Bid:</span>
                <p className="text-foreground">{formatPrice(artwork.currentBid || artwork.basePrice)}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Auction Start:</span>
                <p className="text-foreground">{formatDateTime(artwork.auctionDate)}</p>
              </div>
              <div className="col-span-2">
                <span className="font-medium text-muted-foreground">Auction End:</span>
                <p className="text-foreground">{formatDateTime(artwork.auctionEndDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auction Details & Winner Info */}
        <div className="space-y-6">
          {/* Winner Information */}
          {artwork.status === 'ended' && artwork.winningBidder && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Auction Winner</span>
                </CardTitle>
                <CardDescription>
                  Congratulations to the winning bidder!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{artwork.winningBidder.name}</p>
                    <p className="text-sm text-muted-foreground">{artwork.winningBidder.email}</p>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Final Sale Price:</span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(artwork.currentBid)}
                    </span>
                  </div>
                </div>
                <Button className="w-full" variant="outline">
                  <IndianRupee className="w-4 h-4 mr-2" />
                  Process Payment
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Auction Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Auction Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{bids.length}</div>
                  <div className="text-sm text-muted-foreground">Total Bids</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : artwork.basePrice}
                  </div>
                  <div className="text-sm text-muted-foreground">Highest Bid</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bid History */}
          <Card>
            <CardHeader>
              <CardTitle>Bid History</CardTitle>
              <CardDescription>All bids placed on this artwork</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bids.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No bids yet</p>
                ) : (
                  bids
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((bid) => (
                      <div key={bid._id} className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{bid.bidder.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(bid.createdAt).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">
                            {formatPrice(bid.amount)}
                          </div>
                          {artwork.winningBidder && bid.bidder._id === artwork.winningBidder._id && bid.amount === artwork.currentBid && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Winner
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArtistArtworkDetails;