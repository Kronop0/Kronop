import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: any;
  [key: string]: any;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Simple mock user for development
      const mockUser = {
        id: 'mock_user_id',
        email: 'mock@example.com',
        user_metadata: { name: 'Mock User' }
      };
      setUser(mockUser);
    } catch (error) {
      console.error('Auth load error', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Simple mock login
      const mockUser = {
        id: 'mock_user_id',
        email: email,
        user_metadata: { name: 'Mock User' }
      };
      setUser(mockUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email: string, password: string, displayName?: string) => {
    try {
      // Simple mock signup
      const mockUser = {
        id: 'mock_user_id',
        email: email,
        user_metadata: { name: displayName || 'Mock User' }
      };
      setUser(mockUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      setUser(null);
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
