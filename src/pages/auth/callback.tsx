import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../context/AuthContext";
import { apiService } from "../../services/api";
import { API_ENDPOINTS } from "../../config";

const AuthCallback: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams.toString());
    const userId = urlParams.get("user_id");
    const oauthError = urlParams.get("error");

    if (oauthError) {
      setError("Google authentication failed. Please try again.");
      return;
    }

    if (userId) {
      console.log('🔍 OAuth Callback: Got user_id:', userId);
      // Get user info from backend using cookie-based authentication
      apiService.get(API_ENDPOINTS.AUTH.ME_COOKIE)
        .then((userData: unknown) => {
          console.log('🔍 OAuth Callback: Got user data:', userData);
          // Type guard for userData
          function isUser(data: unknown): data is User {
            return (
              typeof data === 'object' &&
              data !== null &&
              typeof (data as { id?: unknown }).id === 'number' &&
              typeof (data as { email?: unknown }).email === 'string' &&
              typeof (data as { username?: unknown }).username === 'string' &&
              typeof (data as { full_name?: unknown }).full_name === 'string' &&
              typeof (data as { is_active?: unknown }).is_active === 'boolean' &&
              typeof (data as { is_superuser?: unknown }).is_superuser === 'boolean' &&
              typeof (data as { role?: unknown }).role === 'string'
            );
          }

          let userWithRole: User;
          if (isUser(userData)) {
            userWithRole = userData;
          } else if (typeof userData === 'object' && userData !== null) {
            const u = userData as Record<string, unknown>;
            userWithRole = {
              id: typeof u.id === 'number' ? u.id : 0,
              email: typeof u.email === 'string' ? u.email : '',
              username: typeof u.username === 'string' ? u.username : '',
              full_name: typeof u.full_name === 'string' ? u.full_name : '',
              is_active: typeof u.is_active === 'boolean' ? u.is_active : true,
              is_superuser: typeof u.is_superuser === 'boolean' ? u.is_superuser : false,
              role: typeof u.role === 'string' ? u.role : 'pending',
            };
          } else {
            userWithRole = {
              id: 0,
              email: '',
              username: '',
              full_name: '',
              is_active: true,
              is_superuser: false,
              role: 'pending',
            };
          }
          
          console.log('🔍 OAuth Callback: Logging in user with role:', userWithRole.role);
          login(undefined, userWithRole);
          
          // Redirect based on user role
          if (userWithRole.role === 'pending') {
            console.log('🔍 OAuth Callback: Redirecting to pending page');
            router.push('/pending');
          } else {
            console.log('🔍 OAuth Callback: Redirecting to dashboard');
            router.push('/dashboard');
          }
        })
        .catch((error) => {
          console.error('Error during OAuth callback:', error);
          setError("Failed to complete authentication. Please try again.");
        });
    } else {
      setError("Missing user information in callback.");
    }
  }, [searchParams, login, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Show a loading spinner while processing
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Signing you in...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback; 