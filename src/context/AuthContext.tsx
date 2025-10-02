import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "artist" | "bidder";
  portfolioLink?: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: "artist" | "bidder";
  portfolioLink?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: "artist" | "bidder") => Promise<boolean>;
  signup: (data: SignupData) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Invalid user in localStorage:", err);
      localStorage.removeItem("user");
    }
  }, []);

  // ✅ LOGIN
  const login = async (
    email: string,
    password: string,
    role: "artist" | "bidder"
  ): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      if (!res.ok) return false;
      const result = await res.json();

      const loggedUser: User = {
        id: result.user?.id ?? "",
        name: result.user?.name ?? "User",
        email: result.user?.email ?? email,
        role: result.user?.role ?? role,
        portfolioLink: result.user?.portfolioLink,
      };

      setUser(loggedUser);
      localStorage.setItem("user", JSON.stringify(loggedUser));
      localStorage.setItem("token", result.token);

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  // ✅ SIGNUP
  const signup = async (data: SignupData): Promise<boolean> => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) return false;
      await res.json(); // Just consume the response, no user data returned

      return true;
    } catch (err) {
      console.error("Signup error:", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
