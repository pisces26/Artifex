import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const ArtistProfile = () => {
  const { toast } = useToast();

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
        My Profile
      </h1>
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
                            <AvatarFallback>AR</AvatarFallback>
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
                            <Input id="fullName" defaultValue="Artist Name" />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue="artist@example.com" />
                          </div>
                          <div>
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input id="mobile" type="tel" defaultValue="+91 9876543210" />
                          </div>
                          <div>
                            <Label htmlFor="portfolio">Portfolio Website</Label>
                            <Input id="portfolio" type="url" placeholder="https://yourportfolio.com" />
                          </div>
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
    </div>
  );
};

export default ArtistProfile;
