import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import { Artwork } from '@/types';
import { Gavel, Palette, TrendingUp, Users, Clock, Star } from 'lucide-react';

// Import artwork images
import heroArtwork from '@/assets/hero-artwork.jpg';
import artwork1 from '@/assets/artwork-1.jpg';
import artwork2 from '@/assets/artwork-2.jpg';
import artwork3 from '@/assets/artwork-3.jpg';

const Home = () => {
  // Mock data for featured artworks
  const featuredArtworks: Artwork[] = [
    {
      id: '1',
      title: 'Sunset Serenity',
      description: 'A breathtaking landscape painting capturing the golden hour with masterful brushwork and warm tones.',
      category: 'Painting',
      imageUrl: artwork1,
      basePrice: 25000,
      currentBid: 32000,
      artistId: 'artist1',
      artistName: 'Priya Sharma',
      auctionDate: '2024-01-20',
      auctionEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      status: 'live',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      title: 'Modern Essence',
      description: 'Contemporary sculpture blending traditional craftsmanship with modern aesthetics.',
      category: 'Sculpture',
      imageUrl: artwork2,
      basePrice: 45000,
      currentBid: 45000,
      artistId: 'artist2',
      artistName: 'Rahul Mehta',
      auctionDate: '2024-01-25',
      auctionEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      status: 'upcoming',
      createdAt: '2024-01-18',
    },
    {
      id: '3',
      title: 'Floral Dreams',
      description: 'Delicate watercolor masterpiece showcasing the beauty of nature in vibrant, flowing colors.',
      category: 'Watercolor',
      imageUrl: artwork3,
      basePrice: 18000,
      currentBid: 28500,
      artistId: 'artist3',
      artistName: 'Anita Gupta',
      auctionDate: '2024-01-22',
      auctionEndDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
      status: 'live',
      createdAt: '2024-01-20',
    },
  ];

  const liveArtworks = featuredArtworks.filter(artwork => artwork.status === 'live');
  const upcomingArtworks = featuredArtworks.filter(artwork => artwork.status === 'upcoming');

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
              <Link to="/auctions">
                <Button variant="auction" size="lg" className="text-lg px-8 py-6">
                  <Gavel className="mr-2 h-5 w-5" />
                  Explore Live Auctions
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Palette className="mr-2 h-5 w-5" />
                  Join as Artist
                </Button>
              </Link>
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
      {liveArtworks.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground flex items-center space-x-2">
                <Clock className="h-8 w-8 text-success" />
                <span>Live Auctions</span>
              </h2>
              <p className="text-muted-foreground mt-2">Bid now on these exclusive artworks</p>
            </div>
            <Link to="/auctions">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveArtworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Auctions Section */}
      {upcomingArtworks.length > 0 && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground flex items-center space-x-2">
              <Gavel className="h-8 w-8 text-warning" />
              <span>Upcoming Auctions</span>
            </h2>
            <p className="text-muted-foreground mt-2">Get ready for these exciting upcoming events</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingArtworks.map((artwork) => (
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
          <Link to="/signup">
            <Button variant="premium" size="lg">
              Join Now
            </Button>
          </Link>
          <Link to="/auctions">
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