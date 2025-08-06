// Utility functions for debugging authentication issues

export const debugAuth = {
  // Check if environment variables are set correctly
  checkEnvironment: () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    console.log('🔍 Auth Debug - Environment Variables:');
    console.log('NEXT_PUBLIC_API_BASE_URL:', apiBaseUrl);
    console.log('Full API URL:', `${apiBaseUrl || 'http://localhost:8000'}/api`);
    
    return {
      apiBaseUrl,
      isSet: !!apiBaseUrl,
      fullUrl: `${apiBaseUrl || 'http://localhost:8000'}/api`
    };
  },

  // Check localStorage for stored auth data
  checkLocalStorage: () => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    console.log('🔍 Auth Debug - Local Storage:');
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!user);
    
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token preview:', token.substring(0, 20) + '...');
    }
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log('User data:', userData);
      } catch {
        console.log('Invalid user data in localStorage');
      }
    }
    
    return { token, user };
  },

  // Test API connectivity
  testApiConnection: async () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    
    try {
      console.log('🔍 Auth Debug - Testing API Connection...');
      const response = await fetch(`${apiBaseUrl}/api/hello`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API connection successful:', data);
        return { success: true, data };
      } else {
        console.log('❌ API connection failed:', response.status, response.statusText);
        return { success: false, status: response.status, statusText: response.statusText };
      }
    } catch (error) {
      console.log('❌ API connection error:', error);
      return { success: false, error };
    }
  },

  // Test authentication endpoint
  testAuthEndpoint: async (token?: string) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    
    try {
      console.log('🔍 Auth Debug - Testing Auth Endpoint...');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiBaseUrl}/api/auth/me`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Auth endpoint successful:', data);
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ Auth endpoint failed:', response.status, errorData);
        return { success: false, status: response.status, error: errorData };
      }
    } catch (error) {
      console.log('❌ Auth endpoint error:', error);
      return { success: false, error };
    }
  },

  // Run all debug checks
  runAllChecks: async () => {
    console.log('🚀 Starting Auth Debug Checks...');
    
    const env = debugAuth.checkEnvironment();
    const storage = debugAuth.checkLocalStorage();
    const apiConnection = await debugAuth.testApiConnection();
    const authTest = await debugAuth.testAuthEndpoint(storage.token || undefined);
    
    console.log('📊 Auth Debug Summary:');
    console.log('- Environment configured:', env.isSet);
    console.log('- API connection:', apiConnection.success);
    console.log('- Auth endpoint accessible:', authTest.success);
    console.log('- Stored token:', !!storage.token);
    
    return {
      environment: env,
      storage,
      apiConnection,
      authTest
    };
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).debugAuth = debugAuth;
} 