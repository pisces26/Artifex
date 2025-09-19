import React, { useEffect, useState } from "react";
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
import { Upload, Edit, Eye, IndianRupee, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ArtistDashboard = () => {
  const { toast } = useToast();
  const [artworks, setArtworks] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  // Fetch artworks using JWT from localStorage
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return toast({ title: "Unauthorized", description: "Please login", variant: "destructive" });

        const res = await fetch("http://localhost:5000/api/artworks/my-artworks", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          toast({ title: "Unauthorized", description: "Invalid or expired token", variant: "destructive" });
          return;
        }

        const data = await res.json();
        if (data.success) setArtworks(data.artworks);
        else toast({ title: "Error", description: data.message, variant: "destructive" });
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "Failed to fetch artworks", variant: "destructive" });
      }
    };
    fetchArtworks();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "bg-gradient-live text-white";
      case "scheduled": return "bg-gradient-upcoming text-white";
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

      <Tabs defaultValue="my-artworks" className="space-y-6">
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
                        {artwork.status}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{artwork.title}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>Base Price: {formatPrice(artwork.basePrice)}</p>
                        <p>Auction: {new Date(artwork.auctionDate).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        {artwork.status !== "live" && artwork.status !== "sold" && (
                          <Button size="sm" variant="outline"><Edit className="w-4 h-4" /></Button>
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
                      <Label htmlFor="auctionDate">Auction Date & Time *</Label>
                      <Input id="auctionDate" type="datetime-local" required />
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
              <CardDescription>Track your earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistDashboard;
