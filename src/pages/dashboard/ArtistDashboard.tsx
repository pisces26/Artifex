import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Search, Filter, Edit, Trash2, Eye, Calendar, IndianRupee, Package, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const ArtistDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data
  const artworks = [
    {
      id: '1',
      title: 'Abstract Harmony',
      image: '/src/assets/artwork-1.jpg',
      basePrice: 25000,
      currentBid: 32000,
      auctionDate: '2024-02-15T14:00:00',
      status: 'live'
    },
    {
      id: '2',
      title: 'Digital Dreams',
      image: '/src/assets/artwork-2.jpg',
      basePrice: 15000,
      currentBid: null,
      auctionDate: '2024-02-20T16:00:00',
      status: 'scheduled'
    },
    {
      id: '3',
      title: 'Nature\'s Canvas',
      image: '/src/assets/artwork-3.jpg',
      basePrice: 20000,
      currentBid: 28000,
      auctionDate: '2024-02-10T10:00:00',
      status: 'sold'
    }
  ];

  const payments = [
    {
      id: '1',
      artworkTitle: 'Nature\'s Canvas',
      soldPrice: 28000,
      saleDate: '2024-02-10',
      buyer: 'John D.',
      status: 'completed',
      deliveryConfirmed: true
    },
    {
      id: '2',
      artworkTitle: 'Sunset Valley',
      soldPrice: 35000,
      saleDate: '2024-02-08',
      buyer: 'Sarah M.',
      status: 'pending',
      deliveryConfirmed: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-gradient-live text-white';
      case 'scheduled': return 'bg-gradient-upcoming text-white';
      case 'sold': return 'bg-gradient-sold text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleUploadArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Artwork Uploaded",
      description: "Your artwork has been successfully uploaded and scheduled for auction.",
    });
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Artist Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your artworks, auctions, and earnings
        </p>
      </div>

      <Tabs defaultValue="my-artworks" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl">
          <TabsTrigger value="my-artworks" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            My Artworks
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4" />
            Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-artworks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Artworks</CardTitle>
              <CardDescription>
                Manage all your uploaded artworks and track their auction status
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
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((artwork) => (
                  <Card key={artwork.id} className="group hover:shadow-elegant transition-all duration-300">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={artwork.image}
                        alt={artwork.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge
                        className={`absolute top-3 right-3 ${getStatusColor(artwork.status)}`}
                      >
                        {artwork.status}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{artwork.title}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>Base Price: {formatPrice(artwork.basePrice)}</p>
                        {artwork.currentBid && (
                          <p className="text-primary font-medium">
                            Current Bid: {formatPrice(artwork.currentBid)}
                          </p>
                        )}
                        <p>Auction: {new Date(artwork.auctionDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {artwork.status !== 'live' && artwork.status !== 'sold' && (
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Artwork</CardTitle>
              <CardDescription>
                Add a new artwork to be featured in upcoming auctions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadArtwork} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Artwork Title *</Label>
                      <Input id="title" placeholder="Enter artwork title" required />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your artwork..."
                        className="min-h-24"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="abstract">Abstract</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="digital">Digital Art</SelectItem>
                          <SelectItem value="mixed">Mixed Media</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="basePrice">Base Price (₹) *</Label>
                      <Input
                        id="basePrice"
                        type="number"
                        placeholder="25000"
                        min="1000"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="auctionDate">Auction Date & Time *</Label>
                      <Input
                        id="auctionDate"
                        type="datetime-local"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Artwork Image *</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your image here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG up to 10MB
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                      />
                      <Label
                        htmlFor="image-upload"
                        className="inline-block mt-4 cursor-pointer"
                      >
                        <Button type="button" variant="outline">Choose File</Button>
                      </Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button type="submit" className="bg-gradient-primary">
                    Upload Artwork
                  </Button>
                  <Button type="button" variant="outline">
                    Reset Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    Track your earnings and payment status from sold artworks
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Total Earnings</div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(63000)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artwork</TableHead>
                    <TableHead>Sold Price</TableHead>
                    <TableHead>Sale Date</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delivery</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.artworkTitle}
                      </TableCell>
                      <TableCell>{formatPrice(payment.soldPrice)}</TableCell>
                      <TableCell>{payment.saleDate}</TableCell>
                      <TableCell>{payment.buyer}</TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.deliveryConfirmed ? (
                          <Badge variant="outline" className="text-green-600">
                            Confirmed
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline">
                            Confirm Delivery
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        
      </Tabs>
    </div>
  );
};

export default ArtistDashboard;