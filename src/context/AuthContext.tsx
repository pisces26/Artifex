import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  name: string;
  email: string;
  role: "artist" | "bidder";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role: "artist" | "bidder") => Promise<boolean>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role: "artist" | "bidder";
    portfolioLink?: string;
  }) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // helper to store session + redirect
  const handleAuthSuccess = (data: any) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    if (data.user.role === "artist") {
      navigate("/dashboard/artist");
    } else {
      navigate("/dashboard/bidder");
    }
  };

  // 🔑 Login function
  const login = async (email: string, password: string, role: "artist" | "bidder") => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      handleAuthSuccess(data);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // 📝 Signup function (auto login)
  const signup = async (formData: {
    name: string;
    email: string;
    password: string;
    role: "artist" | "bidder";
    portfolioLink?: string;
  }) => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) return false;

      const data = await res.json();
      handleAuthSuccess(data); // auto login after signup
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  // 🚪 Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
