import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Loader2, Gavel, Brush } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"artist" | "bidder">("bidder");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token); // ✅ Save token
      toast({ title: "Login successful" });

      if (role === "artist") navigate("/dashboard/artist");
      else navigate("/dashboard/bidder");
    } else {
      toast({ title: "Login failed", description: data.message, variant: "destructive" });
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-4">
            <Palette className="h-10 w-10 text-saffron" />
            <span className="text-2xl font-bold font-serif bg-gradient-to-r from-saffron to-clay bg-clip-text text-transparent">
              Artifex
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Choose your account type to continue</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-center">Login to Your Account</CardTitle>
            <CardDescription className="text-center">
              Access your personalized art auction experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={(value) => setRole(value as "artist" | "bidder")} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bidder" className="flex items-center space-x-2">
                  <Gavel className="h-4 w-4" />
                  <span>Bidder</span>
                </TabsTrigger>
                <TabsTrigger value="artist" className="flex items-center space-x-2">
                  <Brush className="h-4 w-4" />
                  <span>Artist</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bidder" className="mt-4">
                <div className="text-center text-sm text-muted-foreground">
                  Discover and bid on amazing artworks from talented artists
                </div>
              </TabsContent>

              <TabsContent value="artist" className="mt-4">
                <div className="text-center text-sm text-muted-foreground">
                  Showcase your art and connect with collectors worldwide
                </div>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="transition-all duration-300 focus:shadow-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="transition-all duration-300 focus:shadow-md"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                variant={role === "artist" ? "premium" : "auction"}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  `Login as ${role === "artist" ? "Artist" : "Bidder"}`
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot your password?
              </Link>
              <div className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
