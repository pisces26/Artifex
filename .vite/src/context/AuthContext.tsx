import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'artist' | 'bidder') => Promise<boolean>;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
    role: 'artist' | 'bidder';
    portfolioLink?: string;
  }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('chitrakosh_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'artist' | 'bidder') => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in real app, this would validate against backend
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name: role === 'artist' ? 'Artist User' : 'Bidder User',
      role,
      createdAt: new Date(),
    };
    
    setUser(mockUser);
    localStorage.setItem('chitrakosh_user', JSON.stringify(mockUser));
    setIsLoading(false);
    return true;
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'artist' | 'bidder';
    portfolioLink?: string;
  }) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date(),
    };
    
    setUser(newUser);
    localStorage.setItem('chitrakosh_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chitrakosh_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};