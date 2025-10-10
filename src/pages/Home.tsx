import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import { Artwork } from '@/types';
import { Gavel, Palette, TrendingUp, Users, Clock, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// Import artwork images
import heroArtwork from '@/assets/hero-artwork.jpg';
import artwork1 from '@/assets/artwork-1.jpg';
import artwork2 from '@/assets/artwork-2.jpg';
import artwork3 from '@/assets/artwork-3.jpg';

const Home = () => {
  const { user } = useAuth();
  const [liveArtworks, setLiveArtworks] = useState<Artwork[]>([]);
  const [upcomingArtworks, setUpcomingArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        // Fetch live auctions
        const liveRes = await fetch('http://localhost:5000/api/artworks/live');
        const liveData = await liveRes.json();
        if (liveData.success) {
          const liveMapped = liveData.auctions.map((auction: any) => ({
            id: auction._id,
            title: auction.title,
            description: auction.description,
            category: auction.category,
            imageUrl: `http://localhost:5000${auction.imageUrl}`,
            basePrice: auction.basePrice,
            currentBid: auction.currentBid,
            artistId: auction.artist._id,
            artistName: auction.artist.name,
            auctionDate: auction.auctionDate,
            auctionEndDate: auction.auctionEndDate,
            status: auction.status,
            createdAt: auction.createdAt,
          }));
          setLiveArtworks(liveMapped);
        }

        // Fetch upcoming auctions
        const upcomingRes = await fetch('http://localhost:5000/api/artworks/upcoming');
        const upcomingData = await upcomingRes.json();
        if (upcomingData.success) {
          const upcomingMapped = upcomingData.auctions.map((auction: any) => ({
            id: auction._id,
            title: auction.title,
            description: auction.description,
            category: auction.category,
            imageUrl: `http://localhost:5000${auction.imageUrl}`,
            basePrice: auction.basePrice,
            currentBid: auction.currentBid,
            artistId: auction.artist._id,
            artistName: auction.artist.name,
            auctionDate: auction.auctionDate,
            auctionEndDate: auction.auctionEndDate,
            status: auction.status,
            createdAt: auction.createdAt,
          }));
          setUpcomingArtworks(upcomingMapped);
        }
      } catch (error) {
        console.error('Error fetching auctions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-primary text-primary-foreground">
        <div className="absolute inset-0">
          <img
            src={heroArtwork}
            alt="Featured artwork"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 px-8 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold font-serif leading-tight">
              Discover Extraordinary
              <span className="block text-yellow-300">Art Online</span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
              Where artists showcase their masterpieces and collectors discover their next treasure
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link to="/auctions/live">
                <Button variant="auction" size="lg" className="text-lg px-8 py-6">
                  <Gavel className="mr-2 h-5 w-5" />
                  Explore Live Auctions
                </Button>
              </Link>
              {!user && (
                <Link to="/signup">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Palette className="mr-2 h-5 w-5" />
                    Join as Artist
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Gavel, label: 'Active Auctions', value: '24', color: 'text-accent' },
          { icon: Users, label: 'Artists', value: '150+', color: 'text-primary' },
          { icon: TrendingUp, label: 'Artworks Sold', value: '1,200+', color: 'text-success' },
          { icon: Star, label: 'Satisfaction Rate', value: '98%', color: 'text-warning' },
        ].map((stat, index) => (
          <Card key={index} className="text-center p-6 shadow-card hover:shadow-elegant transition-all duration-300">
            <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </section>

      {/* Live Auctions Section */}
      {loading ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground flex items-center space-x-2">
                <Clock className="h-8 w-8 text-success" />
                <span>Live Auctions</span>
              </h2>
              <p className="text-muted-foreground mt-2">Loading live auctions...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : liveArtworks.length > 0 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground flex items-center space-x-2">
                <Clock className="h-8 w-8 text-success" />
                <span>Live Auctions</span>
              </h2>
              <p className="text-muted-foreground mt-2">Bid now on these exclusive artworks</p>
            </div>
            <Link to="/auctions/live">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveArtworks.slice(0, 3).map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Upcoming Auctions Section */}
      {!loading && upcomingArtworks.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground flex items-center space-x-2">
              <Gavel className="h-8 w-8 text-warning" />
              <span>Upcoming Auctions</span>
            </h2>
            <p className="text-muted-foreground mt-2">Get ready for these exciting upcoming events</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingArtworks.slice(0, 3).map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="bg-secondary/50 rounded-2xl p-8 md:p-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-serif text-foreground">How Artifex Works</h2>
          <p className="text-muted-foreground mt-2">Simple steps to start your art journey</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Discover',
              description: 'Browse our curated collection of artworks from talented artists worldwide',
              icon: Palette,
            },
            {
              step: '2',
              title: 'Bid',
              description: 'Place competitive bids on artworks that speak to you during live auctions',
              icon: Gavel,
            },
            {
              step: '3',
              title: 'Own',
              description: 'Win auctions and add unique masterpieces to your personal collection',
              icon: Star,
            },
          ].map((item, index) => (
            <Card key={index} className="text-center p-6 shadow-card">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                {item.step}
              </div>
              <item.icon className="h-8 w-8 mx-auto mb-3 text-accent" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center bg-gradient-warm rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Start Your Art Journey?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of art enthusiasts and collectors who have found their perfect masterpiece on Artifex
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!user && (
            <Link to="/signup">
              <Button variant="premium" size="lg">
                Join Now
              </Button>
            </Link>
          )}
          <Link to="/auctions/live">
            <Button variant="outline" size="lg">
              Browse Auctions
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;