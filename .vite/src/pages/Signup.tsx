import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Loader2, Gavel, Brush, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    portfolioLink: '',
  });
  const [role, setRole] = useState<'artist' | 'bidder'>('bidder');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    
    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const success = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        portfolioLink: role === 'artist' ? formData.portfolioLink : undefined,
      });
      
      if (success) {
        toast({
          title: "Welcome to Artifex!",
          description: "Your account has been created successfully.",
        });
        
        // Redirect based on role
        if (role === 'artist') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
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
            <span className="text-2xl font-bold font-serif bg-gradient-to-r from-saffron to-clay bg-clip-text text-transparent">Artifex</span>
          </Link>
          <h1 className="text-3xl font-bold font-serif text-foreground">Join Artifex</h1>
          <p className="text-muted-foreground mt-2">Create your account and start your art journey</p>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-center">Create Your Account</CardTitle>
            <CardDescription className="text-center">
              Join the most exclusive art auction platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={(value) => setRole(value as 'artist' | 'bidder')} className="mb-6">
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
                  Start bidding on unique artworks and build your collection
                </div>
              </TabsContent>
              
              <TabsContent value="artist" className="mt-4">
                <div className="text-center text-sm text-muted-foreground">
                  Showcase your creativity and monetize your artistic talent
                </div>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="transition-all duration-300 focus:shadow-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="transition-all duration-300 focus:shadow-md"
                />
              </div>
              
              {role === 'artist' && (
                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio Link (Optional)</Label>
                  <Input
                    id="portfolio"
                    type="url"
                    value={formData.portfolioLink}
                    onChange={(e) => handleInputChange('portfolioLink', e.target.value)}
                    placeholder="https://your-portfolio.com"
                    className="transition-all duration-300 focus:shadow-md"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a password"
                    required
                    className="transition-all duration-300 focus:shadow-md pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="transition-all duration-300 focus:shadow-md pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                variant={role === 'artist' ? 'premium' : 'auction'}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  `Create ${role === 'artist' ? 'Artist' : 'Bidder'} Account`
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <div className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Login here
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;