import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../context/AuthContext";
import { apiService } from "../../services/api";
import { API_ENDPOINTS } from "../../config";
import { 
  fadeInUpVariants, 
  scaleVariants, 
  buttonVariants 
} from "@/utils/animations";

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginForm>({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams.toString());
    const userId = urlParams.get('user_id');
    const oauthErrorParam = urlParams.get('error');

    if (oauthErrorParam) {
      setOauthError('Google authentication failed. Please try again.');
      return;
    }

    if (userId) {
      setLoading(true);
      apiService.get(API_ENDPOINTS.AUTH.ME_COOKIE)
        .then(async (userData: unknown) => {
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
          login(undefined, userWithRole); // undefined token, cookie-based
          // Keep loading state active during navigation
          if (userWithRole.role === 'pending') {
            await router.push('/pending');
          } else {
            await router.push('/dashboard');
          }
          // Loading state will be cleared when component unmounts
        })
        .catch((error) => {
          setOauthError('Failed to complete authentication. Please try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [searchParams, login, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.post<{ user: User; access_token: string }>(API_ENDPOINTS.AUTH.LOGIN, formData);
      if (data && data.access_token && data.user) {
        login(data.access_token, data.user);
        // Keep loading state active during navigation
        if (data.user.role === 'pending') {
          await router.push('/pending');
        } else {
          await router.push('/dashboard');
        }
        // Loading state will be cleared when component unmounts
      } else {
        setError("Invalid response from server.");
        setLoading(false);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setOauthError(null);
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    window.location.href = `${base}${API_ENDPOINTS.AUTH.OAUTH.GOOGLE}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <motion.div
        className="w-full max-w-md"
        variants={scaleVariants}
        initial="initial"
        animate="in"
      >
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          variants={fadeInUpVariants}
        >
          <div className="text-center mb-8">
            <motion.h1
              className="text-3xl font-bold text-gray-900 mb-2"
              variants={fadeInUpVariants}
            >
              Welcome Back
            </motion.h1>
            <motion.p
              className="text-gray-600"
              variants={fadeInUpVariants}
            >
              Sign in to your account to continue
            </motion.p>
          </div>

          {/* Username/Password Login */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6 mb-6"
            variants={fadeInUpVariants}
          >
            {error && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">{error}</div>
            )}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </motion.form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google OAuth Login */}
          {oauthError && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">{oauthError}</div>
          )}
          <motion.div variants={fadeInUpVariants}>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          </motion.div>

          <motion.div
            className="mt-6 text-center"
            variants={fadeInUpVariants}
          >
            <p className="text-sm text-gray-600">
              By signing in, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login; 