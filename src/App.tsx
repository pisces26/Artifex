import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";   // ✅ no BrowserRouter
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import LiveAuctions from "./pages/auctions/LiveAuctions";
import LiveAuctionDetails from "./pages/auctions/LiveAuctionDetails";
import UpcomingAuctions from "./pages/auctions/UpcomingAuctions";
import UpcomingAuctionDetails from "./pages/auctions/UpcomingAuctionDetails";
import ArtistDashboard from "./pages/dashboard/ArtistDashboard";
import UserDashboard from "./pages/dashboard/UserDashboard";
import UserProfile from "./pages/dashboard/UserProfile";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Auth routes without layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Public routes with layout */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/auctions/live" element={<Layout><LiveAuctions /></Layout>} />
          <Route path="/auctions/live/:id" element={<Layout><LiveAuctionDetails /></Layout>} />
          <Route path="/auctions/upcoming" element={<Layout><UpcomingAuctions /></Layout>} />
          <Route path="/auctions/upcoming/:id" element={<Layout><UpcomingAuctionDetails /></Layout>} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard/artist" element={
            <Layout>
              <ProtectedRoute requireAuth={true} requiredRole="artist">
                <ArtistDashboard />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/user" element={
            <Layout>
              <ProtectedRoute requireAuth={true} requiredRole="bidder">
                <UserDashboard />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/user/profile" element={
            <Layout>
              <ProtectedRoute requireAuth={true} requiredRole="bidder">
                <UserProfile />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/dashboard/artist/profile" element={
            <Layout>
              <ProtectedRoute requireAuth={true} requiredRole="artist">
                <UserProfile />
              </ProtectedRoute>
            </Layout>
          } />
          

          {/* Catch-all */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
