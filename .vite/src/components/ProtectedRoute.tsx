import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'artist' | 'bidder';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requiredRole 
}) => {
  const { user } = useAuth();
  const location = useLocation();

  if (requireAuth && !user) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user.role === 'artist' ? '/dashboard/artist' : '/dashboard/user';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;