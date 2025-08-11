import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, Download, CreditCard, User, Clock, Trophy, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const UserDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data
  const bids = [
    {
      id: '1',
      artwork: {
        title: 'Abstract Harmony',
        image: '/src/assets/artwork-1.jpg'
      },
      myHighestBid: 32000,
      currentPrice: 35000,
      status: 'live',
      result: 'outbid',
      bidTime: '2024-02-15T10:30:00',
      auctionEndTime: '2024-02-15T18:00:00'
    },
    {
      id: '2',
      artwork: {
        title: 'Digital Dreams',
        image: '/src/assets/artwork-2.jpg'
      },
      myHighestBid: 28000,
      currentPrice: 28000,
      status: 'ended',
      result: 'won',
      bidTime: '2024-02-10T16:45:00',
      finalPrice: 28000
    },
    {
      id: '3',
      artwork: {
        title: 'Nature\'s Canvas',
        image: '/src/assets/artwork-3.jpg'
      },
      myHighestBid: 22000,
      currentPrice: 25000,
      status: 'ended',
      result: 'lost',
      bidTime: '2024-02-08T14:20:00',
      finalPrice: 25000
    }
  ];

  const getResultColor = (result: string) => {
    switch (result) {
      case 'won': return 'bg-gradient-sold text-white';
      case 'winning': return 'bg-gradient-live text-white';
      case 'outbid': return 'bg-gradient-warning text-white';
      case 'lost': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-gradient-live text-white';
      case 'ended': return 'bg-gradient-ended text-white';
      case 'upcoming': return 'bg-gradient-upcoming text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCompletePayment = (bidId: string) => {
    toast({
      title: "Payment Initiated",
      description: "Redirecting to payment gateway...",
    });
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    });
  };

  const totalBids = bids.length;
  const wonBids = bids.filter(bid => bid.result === 'won').length;
  const activeBids = bids.filter(bid => bid.status === 'live').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          User Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Track your bids, manage your auction activity
        </p>
      </div>

      <Tabs defaultValue="my-bids" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="my-bids" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            My Bids
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-bids" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Bids</p>
                    <p className="text-2xl font-bold">{totalBids}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Won Auctions</p>
                    <p className="text-2xl font-bold">{wonBids}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Bids</p>
                    <p className="text-2xl font-bold">{activeBids}</p>
                  </div>
                  <Clock className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bidding History</CardTitle>
              <CardDescription>
                View all your auction participation and bid status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search artworks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                    <SelectItem value="outbid">Outbid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artwork</TableHead>
                      <TableHead>My Highest Bid</TableHead>
                      <TableHead>Current/Final Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Bid Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bids.map((bid) => (
                      <TableRow key={bid.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={bid.artwork.image}
                              alt={bid.artwork.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium">{bid.artwork.title}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(bid.myHighestBid)}
                        </TableCell>
                        <TableCell>
                          {formatPrice(bid.currentPrice)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(bid.status)}>
                            {bid.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getResultColor(bid.result)}>
                            {bid.result}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(bid.bidTime)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {bid.result === 'won' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleCompletePayment(bid.id)}
                                  className="bg-gradient-primary"
                                >
                                  <CreditCard className="w-4 h-4 mr-1" />
                                  Pay Now
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            {bid.result === 'outbid' && bid.status === 'live' && (
                              <Button size="sm" variant="outline">
                                Place New Bid
                              </Button>
                            )}
                            {bid.status === 'upcoming' && (
                              <Button size="sm" variant="outline" disabled>
                                Remind Me
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information and account preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>US</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button type="button" variant="outline">
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground mt-1">
                      JPG, PNG up to 2MB
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" defaultValue="User Name" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="user@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input id="mobile" type="tel" defaultValue="+91 9876543210" />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="City, State" />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Saved Artworks</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your wishlist and favorite artworks
                  </p>
                  <Button type="button" variant="outline" className="mt-2">
                    View Saved Artworks
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your payment methods for faster checkout
                  </p>
                  <Button type="button" variant="outline">
                    Manage Payment Methods
                  </Button>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button type="submit" className="bg-gradient-primary">
                    Save Changes
                  </Button>
                  <Button type="button" variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;