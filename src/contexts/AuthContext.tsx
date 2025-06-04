
"use client";
import type { User } from '@/lib/types';
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // Ensure jwt-decode is installed: npm install jwt-decode

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface DecodedToken {
  sub: string; // Typically username or user ID
  roles?: string; // Assuming roles are comma-separated string like "ROLE_ADMIN,ROLE_USER" or just "ADMIN"
  iat: number;
  exp: number;
  // Add other claims if present in your JWT
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // Decode token to check expiry and potentially pre-fill user info if needed
      // For now, just setting token, user will be fetched
    }
    setIsLoading(false); 
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null); // Clear user if token is removed
    }
  }, [token]);


  const login = async (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    // User will be fetched by the useEffect listening to token changes
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };
  
  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      return;
    }
    setIsLoading(true);
    try {
      // First, try to decode the token to get basic info like role
      const decoded = jwtDecode<DecodedToken>(token);
      
      // Check token expiry
      if (decoded.exp * 1000 < Date.now()) {
        logout(); // Token expired
        return;
      }

      // Then fetch more complete user details from /me endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const userData: { username: string, email: string } = await res.json();
        // Combine decoded role with fetched user data
        // The backend /me endpoint doesn't provide role, so we rely on token decode.
        // This might need adjustment based on how roles are structured in your JWT and if /me returns role.
        const userRole = decoded.roles?.includes('ADMIN') || decoded.roles?.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER';
        
        setUser({
          id: decoded.sub, // Assuming 'sub' is user ID or unique identifier
          username: userData.username,
          email: userData.email,
          role: userRole,
          verified: true, // Assume verified if logged in, or fetch this status if /me provides it
        });
      } else {
        // If /me fails (e.g., token valid but user deleted, or other server error), log out
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user or decode token:', error);
      logout(); // Error during fetch or decode, treat as unauthenticated
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
