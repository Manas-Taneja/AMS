import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '@/services/api';
import { API_ENDPOINTS } from '@/config';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string | undefined, user: User) => void;
  logout: () => void;
  loading: boolean;
  hasRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  isStaff: () => boolean;
  isPending: () => boolean;
  isApproved: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state on mount
  useEffect(() => {
    // Try to restore token from sessionStorage first
    const storedToken = sessionStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false); // <-- ensure loading is set to false
    } else {
      // No token found, set loading to false
      setLoading(false);
    }
  }, []);

  const hasRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isAdmin = (): boolean => {
    return hasRole(['admin']);
  };

  const isManager = (): boolean => {
    return hasRole(['manager', 'admin']);
  };

  const isStaff = (): boolean => {
    return hasRole(['user', 'manager', 'admin']);
  };

  const isPending = (): boolean => {
    return user?.role === 'pending';
  };

  const isApproved = (): boolean => {
    return user?.role !== 'pending';
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    // Clear any stored tokens (for JWT users)
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('access_token');
    // Call logout endpoint to clear httpOnly cookies
    apiService.post(API_ENDPOINTS.AUTH.LOGOUT, {}).catch(console.error);
  }, []);

  // Try JWT first, fallback to cookie-based
  const verifyAuth = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const userData = await apiService.get(API_ENDPOINTS.AUTH.ME, token) as User;
      setUser(userData);
    } catch (error) {
      console.error('Token verification failed:', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Verify auth when token changes
  useEffect(() => {
    if (token) {
      verifyAuth();
    } else {
      setLoading(false);
    }
  }, [token, verifyAuth]);

  // Accepts both JWT and cookie-based login
  const login = (jwt: string | undefined, userData: User) => {
    console.log('🔍 AuthContext: Login called with:', { jwt: !!jwt, userData });
    setUser(userData);
    if (jwt) {
      // For JWT authentication, store token securely
      setToken(jwt);
      // Store user data in localStorage (non-sensitive)
      localStorage.setItem('user', JSON.stringify(userData));
      // Store token in sessionStorage (cleared when browser closes)
      sessionStorage.setItem('access_token', jwt);
    } else {
      // For OAuth, rely on httpOnly cookies set by backend
      setToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('access_token');
    }
    console.log('🔍 AuthContext: User state updated:', userData);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated,
      loading,
      hasRole,
      isAdmin,
      isManager,
      isStaff,
      isPending,
      isApproved,
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 