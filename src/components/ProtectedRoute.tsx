import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
  requireAuth?: boolean;
  requiredRole?: "artist" | "bidder"; // same roles you are storing
}

const ProtectedRoute = ({
  children,
  requireAuth = true,
  requiredRole,
}: ProtectedRouteProps) => {
  const { user } = useAuth();

  // If authentication is required and no user found → redirect
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  // If a role is required but user role doesn’t match → redirect
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
