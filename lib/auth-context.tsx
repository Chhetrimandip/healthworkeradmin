"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      console.log("Auth Context: Refreshing user data...");
      const res = await fetch('/api/auth/me', {
        credentials: 'include', // Important - include cookies in request
      });
      console.log("Auth Context: Response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Auth Context: User data received");
        setUser(data.user);
      } else {
        console.log("Auth Context: Failed to fetch user data:", res.status);
        setUser(null);
        if (res.status === 401) {
          // Token expired or invalid - redirect to login
          router.push('/login');
        }
      }
    } catch (error) {
      console.error("Auth Context: Error refreshing user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error("Auth Context: Error during logout:", error);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}