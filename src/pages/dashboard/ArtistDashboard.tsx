import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Edit, Eye, IndianRupee, Package, Save, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const ArtistDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("my-artworks");
  const [editingArtwork, setEditingArtwork] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    basePrice: '',
    auctionDate: '',
    auctionEndDate: ''
  });

  // Fetch artworks and payments using JWT from localStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return toast({ title: "Unauthorized", description: "Please login", variant: "destructive" });

        // Fetch artworks
        const artworksRes = await fetch("http://localhost:5000/api/artworks/my-artworks", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (artworksRes.status === 401) {
          toast({ title: "Unauthorized", description: "Invalid or expired token", variant: "destructive" });
          return;
        }

        const artworksData = await artworksRes.json();
        if (artworksData.success) {
          setArtworks(artworksData.artworks);
        }

        // Fetch payments
        const paymentsRes = await fetch("http://localhost:5000/api/payments/artist", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const paymentsData = await paymentsRes.json();
        if (paymentsData.success) {
          // Fetch delivery addresses for physical artworks
          const paymentsWithDelivery = await Promise.all(
            paymentsData.payments.map(async (payment: any) => {
              if (!payment.artwork.isDigital && payment.status === 'completed') {
                try {
                  const userRes = await fetch(`http://localhost:5000/api/users/${payment.bidder._id}/delivery-address`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  const userData = await userRes.json();
                  if (userData.success) {
                    payment.deliveryAddress = userData.deliveryAddress;
                  }
                } catch (error) {
                  console.error('Error fetching delivery address:', error);
                }
              }
              return payment;
            })
          );
          setPayments(paymentsWithDelivery);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleEditArtwork = (artwork: any) => {
    setEditingArtwork(artwork);
    setEditForm({
      title: artwork.title,
      description: artwork.description,
      category: artwork.category,
      basePrice: artwork.basePrice.toString(),
      auctionDate: new Date(artwork.auctionDate).toISOString().slice(0, 16),
      auctionEndDate: new Date(artwork.auctionEndDate).toISOString().slice(0, 16)
    });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/artworks/${editingArtwork._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Artwork updated successfully" });
        setEditingArtwork(null);
        // Refresh artworks
        const fetchRes = await fetch("http://localhost:5000/api/artworks/my-artworks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await fetchRes.json();
        if (data.success) setArtworks(data.artworks);
      } else {
        toast({ title: "Error", description: "Failed to update artwork", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    }
  };

  const canEditArtwork = (artwork: any) => {
    const now = new Date();
    const auctionStart = new Date(artwork.auctionDate);
    return now < auctionStart && artwork.status === 'scheduled';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-gradient-live text-white";
      case "scheduled": return "bg-gradient-upcoming text-white";
      case "ended": return "bg-gradient-sold text-white";
      case "sold": return "bg-gradient-sold text-white";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);

  // Upload artwork
  const handleUploadArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return toast({ title: "Unauthorized", description: "Please login", variant: "destructive" });

    const formData = new FormData();
    formData.append("title", (document.getElementById("title") as HTMLInputElement).value);
    formData.append("description", (document.getElementById("description") as HTMLTextAreaElement).value);
    formData.append("category", (document.querySelector("[name=category]") as HTMLSelectElement)?.value || "");
    formData.append("basePrice", (document.getElementById("basePrice") as HTMLInputElement).value);
    formData.append("auctionDate", (document.getElementById("auctionDate") as HTMLInputElement).value);
    formData.append("auctionEndDate", (document.getElementById("auctionEndDate") as HTMLInputElement).value);
    if (file) formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/api/artworks/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // send JWT in header
        body: formData,
      });

      if (res.status === 401) {
        return toast({ title: "Unauthorized", description: "Invalid or expired token", variant: "destructive" });
      }

      if (!res.ok) throw new Error("Failed to upload");

      const data = await res.json();
      if (data.success) {
        toast({ title: "Artwork Uploaded", description: "Successfully uploaded." });
        setArtworks([data.artwork, ...artworks]);
        setActiveTab("my-artworks"); // Switch to my artworks tab after upload
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err: any) {
      console.error(err);
      toast({ title: "Error", description: err.message || "Upload failed", variant: "destructive" });
    }
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl">
          <TabsTrigger value="my-artworks" className="flex items-center gap-2">
            <Package className="w-4 h-4" /> My Artworks
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4" /> Payments
          </TabsTrigger>
        </TabsList>

        {/* My Artworks */}
        <TabsContent value="my-artworks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Artworks</CardTitle>
              <CardDescription>Manage all your uploaded artworks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((artwork) => (
                  <Card key={artwork._id} className="group hover:shadow-elegant transition-all duration-300">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={`http://localhost:5000${artwork.imageUrl}`}
                        alt={artwork.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge className={`absolute top-3 right-3 ${getStatusColor(artwork.status)}`}>
                        {artwork.status === 'ended' ? 'ENDED' :
                         artwork.status === 'scheduled' ? 'UPCOMING' :
                         artwork.status.toUpperCase()}
                      </Badge>
                      {artwork.status === 'ended' && artwork.winningBidder && (
                        <div className="absolute bottom-3 left-3 right-3 bg-background/90 backdrop-blur-sm rounded-lg px-2 py-1">
                          <div className="text-xs text-foreground">
                            Winner: {artwork.winningBidder.name}
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{artwork.title}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>Base Price: {formatPrice(artwork.basePrice)}</p>
                        <p>Auction: {new Date(artwork.auctionDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate(`/dashboard/artist/artwork/${artwork._id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        {canEditArtwork(artwork) && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => handleEditArtwork(artwork)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Edit Artwork</DialogTitle>
                                <DialogDescription>Update your artwork details before the auction starts</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-title">Title</Label>
                                  <Input
                                    id="edit-title"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-description">Description</Label>
                                  <Textarea
                                    id="edit-description"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-category">Category</Label>
                                  <Select value={editForm.category} onValueChange={(value) => setEditForm({...editForm, category: value})}>
                                    <SelectTrigger>
                                      <SelectValue />
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
                                  <Label htmlFor="edit-basePrice">Base Price (₹)</Label>
                                  <Input
                                    id="edit-basePrice"
                                    type="number"
                                    value={editForm.basePrice}
                                    onChange={(e) => setEditForm({...editForm, basePrice: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-auctionDate">Auction Start Date & Time</Label>
                                  <Input
                                    id="edit-auctionDate"
                                    type="datetime-local"
                                    value={editForm.auctionDate}
                                    onChange={(e) => setEditForm({...editForm, auctionDate: e.target.value})}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-auctionEndDate">Auction End Date & Time</Label>
                                  <Input
                                    id="edit-auctionEndDate"
                                    type="datetime-local"
                                    value={editForm.auctionEndDate}
                                    onChange={(e) => setEditForm({...editForm, auctionEndDate: e.target.value})}
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button variant="outline" onClick={() => setEditingArtwork(null)}>
                                    <X className="w-4 h-4 mr-1" /> Cancel
                                  </Button>
                                  <Button onClick={handleSaveEdit}>
                                    <Save className="w-4 h-4 mr-1" /> Save Changes
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Artwork */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Artwork</CardTitle>
              <CardDescription>Add a new artwork for auction</CardDescription>
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
                      <Textarea id="description" placeholder="Describe your artwork..." required />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select name="category">
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
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
                      <Input id="basePrice" type="number" min="1000" required />
                    </div>
                    <div>
                      <Label htmlFor="auctionDate">Auction Start Date & Time *</Label>
                      <Input id="auctionDate" type="datetime-local" required />
                    </div>
                    <div>
                      <Label htmlFor="auctionEndDate">Auction End Date & Time *</Label>
                      <Input id="auctionEndDate" type="datetime-local" required />
                    </div>
                  </div>
                  <div>
                    <Label>Artwork Image *</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      id="image-upload"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="submit" className="bg-gradient-primary">Upload Artwork</Button>
                  <Button type="reset" variant="outline">Reset Form</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Track your earnings from completed auctions</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-muted-foreground">No payments yet</p>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <Card key={payment._id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={`http://localhost:5000${payment.artwork.imageUrl}`}
                              alt={payment.artwork.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <h4 className="font-medium">{payment.artwork.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                Sold to {payment.bidder.name}
                              </p>
                              {!payment.artwork.isDigital && payment.deliveryAddress && (
                                <div className="text-xs text-muted-foreground mt-2">
                                  <p><strong>Delivery Address:</strong></p>
                                  <p>{payment.deliveryAddress.street}</p>
                                  <p>{payment.deliveryAddress.city}, {payment.deliveryAddress.state} {payment.deliveryAddress.pincode}</p>
                                  <p>{payment.deliveryAddress.country}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {formatPrice(payment.amount)}
                          </div>
                          <Badge
                            className={
                              payment.status === 'completed'
                                ? 'bg-gradient-sold text-white'
                                : payment.status === 'pending'
                                ? 'bg-gradient-warning text-white'
                                : 'bg-secondary text-secondary-foreground'
                            }
                          >
                            {payment.status}
                          </Badge>
                          {payment.status === 'completed' && (
                            <Button size="sm" variant="outline" className="mt-2">
                              Bill
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistDashboard;
