import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '@/services/api';
import { API_ENDPOINTS, SUPABASE_CONFIG } from '@/config';
import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/services/logger';

export interface User {
  id: number;  // Integer ID in profiles table
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  role: string;
  segment_code?: string;
  center_id?: number;
  access_level?: string;
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
  isCenterManager: () => boolean;
  isSegmentManager: () => boolean;
  isHQManager: () => boolean;
  isStaff: () => boolean;
  isPending: () => boolean;
  isApproved: () => boolean;
  getUserSegment: () => string | null;
  getUserCenter: () => number | null;
  getUserAccessLevel: () => string | null;
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
  const useSupabaseAuth = SUPABASE_CONFIG.USE_SUPABASE && Boolean(supabase);

  const loadSupabaseProfile = useCallback(async () => {
    if (!supabase) return;
    
    // Get the auth user's email first
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user?.email) {
      logger.error('No email found for auth user');
      setLoading(false);
      return;
    }
    
    // Try with RBAC fields first
    let { data, error } = await supabase
      .from('profiles')
      .select('id,email,username,full_name,role,is_superuser,is_active,segment_code,center_id,access_level')
      .eq('email', authUser.user.email)
      .single();
    
    // If RBAC fields don't exist (column not found error), try without them
    if (error && error.code === '42703') {
      logger.info('RBAC columns not found, falling back to basic profile');
      const result = await supabase
        .from('profiles')
        .select('id,email,username,full_name,role,is_superuser,is_active')
        .eq('email', authUser.user.email)
        .single();
      data = result.data as typeof data || null;
      error = result.error;
    }
    
    if (error) {
      logger.error('Failed to load Supabase profile', error);
      setLoading(false);
      return;
    }
    if (!data) {
      logger.error('No profile data found');
      setLoading(false);
      return;
    }
    setUser({
      id: data.id,
      email: data.email,
      username: data.username,
      full_name: data.full_name,
      role: data.role,
      is_superuser: data.is_superuser,
      is_active: data.is_active,
      segment_code: data.segment_code || undefined,
      center_id: data.center_id || undefined,
      access_level: data.access_level || undefined,
    });
    setLoading(false);
  }, []);

  // Initialize authentication state on mount
  useEffect(() => {
    if (useSupabaseAuth && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const session = data.session;
        if (session?.user?.id) {
          loadSupabaseProfile();
        } else {
          setLoading(false);
        }
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.id) {
          loadSupabaseProfile();
        } else {
          setUser(null);
          setToken(null);
          setLoading(false);
        }
      });
      return () => {
        listener?.subscription?.unsubscribe();
      };
    }

    // Try to restore token from localStorage first (persists across sessions)
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          logger.error('Error parsing stored user data', error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false); // <-- ensure loading is set to false
    } else {
      // No token found, set loading to false
      setLoading(false);
    }
  }, [loadSupabaseProfile, useSupabaseAuth]);

  const hasRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isAdmin = (): boolean => {
    return hasRole(['admin']);
  };

  const isManager = (): boolean => {
    return hasRole(['center_manager', 'segment_manager', 'hq_manager', 'manager', 'admin']);
  };

  const isCenterManager = (): boolean => {
    return hasRole(['center_manager', 'segment_manager', 'hq_manager', 'manager', 'admin']);
  };

  const isSegmentManager = (): boolean => {
    return hasRole(['segment_manager', 'hq_manager', 'manager', 'admin']);
  };

  const isHQManager = (): boolean => {
    return hasRole(['hq_manager', 'admin']);
  };

  const isStaff = (): boolean => {
    return hasRole(['user', 'center_manager', 'segment_manager', 'hq_manager', 'manager', 'admin']);
  };

  const getUserSegment = (): string | null => {
    return user?.segment_code || null;
  };

  const getUserCenter = (): number | null => {
    return user?.center_id || null;
  };

  const getUserAccessLevel = (): string | null => {
    return user?.access_level || null;
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
    if (useSupabaseAuth && supabase) {
      supabase.auth.signOut().catch((error) => logger.error('Supabase signout failed', error));
    } else {
      // Call logout endpoint to clear httpOnly cookies
      apiService.post(API_ENDPOINTS.AUTH.LOGOUT, {}).catch((error) => logger.error('Logout failed', error));
    }
    // Redirect to login page
    window.location.href = '/login';
  }, [useSupabaseAuth]);

  // Try JWT first, fallback to cookie-based
  const verifyAuth = useCallback(async () => {
    if (!token || useSupabaseAuth) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const userData = await apiService.get(API_ENDPOINTS.AUTH.ME, token) as User;
      setUser(userData);
    } catch (error) {
      logger.error('Token verification failed', error);
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  }, [token, useSupabaseAuth]);

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
    logger.debug('AuthContext: Login called', { hasJwt: !!jwt, userId: userData.id });
    if (useSupabaseAuth) {
      // Supabase listener will set user; keep local copy for components
      setUser(userData);
    } else {
      setUser(userData);
      if (jwt) {
        // For JWT authentication, store token securely in localStorage (persists across sessions)
        setToken(jwt);
        // Store user data in localStorage (non-sensitive)
        localStorage.setItem('user', JSON.stringify(userData));
        // Store token in localStorage so it persists across browser restarts
        localStorage.setItem('access_token', jwt);
      } else {
        // For OAuth, rely on httpOnly cookies set by backend
        setToken(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('access_token');
      }
    }
    logger.debug('AuthContext: User state updated', { userId: userData.id, role: userData.role });
    // Set user context in Sentry for error tracking
    logger.setUser({ id: userData.id, email: userData.email, username: userData.username });
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
      isCenterManager,
      isSegmentManager,
      isHQManager,
      isStaff,
      isPending,
      isApproved,
      getUserSegment,
      getUserCenter,
      getUserAccessLevel,
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 