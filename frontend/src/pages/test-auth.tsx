import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS, API_BASE_URL } from '../config';

const TestAuth: React.FC = () => {
  const { user, token, isAuthenticated, loading, login } = useAuth();
  const router = useRouter();

  const testLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });
      
      const data = await response.json();
      console.log('Test login result:', data);
      
      if (data.access_token) {
        login(data.access_token, data.user);
        console.log('Login successful, redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('Test login failed:', error);
    }
  };

  const checkAuth = async () => {
    if (token) {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('Auth check successful:', userData);
        } else {
          console.log('Auth check failed:', response.status);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    }
  };

  useEffect(() => {
    console.log('TestAuth: Component mounted');
    console.log('Current auth state:', { user, token, isAuthenticated, loading });
  }, [user, token, isAuthenticated, loading]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold">Current State:</h2>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>Token: {token ? 'Present' : 'Missing'}</p>
          <p>User: {user ? user.username : 'None'}</p>
        </div>

        <div className="space-y-2">
          <button
            onClick={testLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Test Login
          </button>
          
          <button
            onClick={checkAuth}
            className="bg-green-500 text-white px-4 py-2 rounded ml-2"
          >
            Check Auth
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-purple-500 text-white px-4 py-2 rounded ml-2"
          >
            Go to Dashboard
          </button>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="font-bold">Debug Info:</h3>
          <p>Check browser console for detailed logs</p>
          <p>Use the debug panel in the bottom right corner</p>
        </div>
      </div>
    </div>
  );
};

export default TestAuth; 