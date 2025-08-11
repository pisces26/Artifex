import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { 
  Palette, 
  User, 
  LogOut, 
  Gavel, 
  Home, 
  Upload,
  Wallet,
  Activity,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Palette className="h-8 w-8 text-saffron" />
            <span className="text-xl font-bold font-serif bg-gradient-to-r from-saffron to-clay bg-clip-text text-transparent">Artifex</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="premium">Join Auction</Button>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Palette className="h-8 w-8 text-saffron" />
          <span className="text-xl font-bold font-serif bg-gradient-to-r from-saffron to-clay bg-clip-text text-transparent">Artifex</span>
        </Link>
        
          <div className="flex items-center space-x-6">
            {user.role === 'artist' ? (
              <>
                <Link to="/dashboard/artist" className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/auctions/live" className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors">
                  <Gavel className="h-4 w-4" />
                  <span>Live Auctions</span>
                </Link>
                <Link to="/auctions/upcoming" className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors">
                  <Clock className="h-4 w-4" />
                  <span>Upcoming</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link to="/auctions/live" className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors">
                  <Gavel className="h-4 w-4" />
                  <span>Live Auctions</span>
                </Link>
                <Link to="/auctions/upcoming" className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors">
                  <Clock className="h-4 w-4" />
                  <span>Upcoming</span>
                </Link>
                <Link to="/dashboard/user" className="flex items-center space-x-1 text-foreground hover:text-primary transition-colors">
                  <Activity className="h-4 w-4" />
                  <span>My Bids</span>
                </Link>
              </>
            )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to={user.role === 'artist' ? "/dashboard/artist" : "/dashboard/user"} className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-destructive">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;