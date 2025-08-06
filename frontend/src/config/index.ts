// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    ME_COOKIE: '/api/auth/me-cookie',
    OAUTH: {
      GOOGLE: '/api/auth/google',
      CALLBACK: '/api/auth/google/callback',
      HEALTH: '/api/auth/oauth-health'
    },
    ADMIN: {
      USERS: '/api/auth/admin/users',
      PENDING_USERS: '/api/auth/admin/users/pending',
      APPROVE_USER: (userId: number) => `/api/auth/admin/users/${userId}/approve`,
      UPDATE_USER_ROLE: (userId: number) => `/api/auth/admin/users/${userId}/role`,
      UPDATE_USER_STATUS: (userId: number) => `/api/auth/admin/users/${userId}/status`,
      DELETE_USER: (userId: number) => `/api/auth/admin/users/${userId}`
    }
  },
  
  // Core entities
  COMPONENTS: '/api/components',
  LOCATIONS: '/api/locations',
  PROJECTS: '/api/projects',
  STAFF: '/api/staff',
  BILLS: '/api/bills',
  TRAINING: '/api/training',
  
  // File operations
  FILES: '/api/files',
  
  // Dashboard and monitoring
  DASHBOARD: '/api/dashboard',
  MONITORING: '/api/monitoring',
  EXPORT: '/api/export'
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

// Environment configuration
export const ENV_CONFIG = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_OAUTH: process.env.NEXT_PUBLIC_ENABLE_OAUTH === 'true',
  ENABLE_MONITORING: process.env.NEXT_PUBLIC_ENABLE_MONITORING === 'true',
  ENABLE_EXPORT: process.env.NEXT_PUBLIC_ENABLE_EXPORT === 'true',
} as const; 