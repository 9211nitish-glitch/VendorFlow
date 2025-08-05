import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthResponse } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface AuthContextType {
  user: Omit<User, 'password'> | null;
  token: string | null;
  login: (user: Omit<User, 'password'>, token: string) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
  isVendor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser && storedUser !== 'undefined') {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (user: Omit<User, 'password'>, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const loginWithCredentials = async (email: string, password: string) => {
    try {
      const response = await apiRequest('/api/auth/login', { email, password });
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      const { user, token } = response.data;
      login(user, token);
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, referralCode?: string) => {
    try {
      const response = await apiRequest('/api/auth/register', {
        name,
        email,
        password,
        referralCode
      });
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      const { user, token } = response.data;
      
      login(user, token);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === UserRole.ADMIN;
  const isVendor = user?.role === UserRole.VENDOR;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      loginWithCredentials,
      register,
      logout,
      isLoading,
      isAdmin,
      isVendor
    }}>
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
