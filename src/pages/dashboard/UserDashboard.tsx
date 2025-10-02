import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, CreditCard, Clock, Trophy, TrendingUp, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const UserDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's bids
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast({ title: "Unauthorized", description: "Please login", variant: "destructive" });
          return;
        }

        const response = await fetch('http://localhost:5000/api/bids/my', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          toast({ title: "Unauthorized", description: "Invalid or expired token", variant: "destructive" });
          return;
        }

        const data = await response.json();
        if (data) {
          setBids(data);
        }
      } catch (error) {
        console.error('Error fetching bids:', error);
        toast({ title: "Error", description: "Failed to load bidding history", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [toast]);

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

  const handleCompletePayment = (bidId: string) => {
    toast({
      title: "Payment Initiated",
      description: "Redirecting to payment gateway...",
    });
  };

  const totalBids = bids.length;
  const wonBids = bids.filter(bid => bid.result === 'won').length;
  const activeBids = bids.filter(bid => bid.status === 'live').length;

  // Filter bids based on search and status
  const filteredBids = bids.filter(bid => {
    const matchesSearch = bid.artwork.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bid.result === statusFilter || bid.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

      {/* Bidding History */}
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

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading bidding history...</span>
            </div>
          ) : (
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
                  {filteredBids.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No bids found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBids.map((bid) => (
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
                          {bid.finalPrice && bid.finalPrice !== bid.currentPrice && (
                            <div className="text-xs text-muted-foreground">
                              Final: {formatPrice(bid.finalPrice)}
                            </div>
                          )}
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
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
