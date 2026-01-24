import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../context/AuthContext";
import { apiService } from "../../services/api";
import { API_ENDPOINTS, SUPABASE_CONFIG } from "../../config";
import { supabase, supabaseEnabled } from "../../lib/supabaseClient";
import { toast } from "sonner";
import { 
  fadeInUpVariants, 
  scaleVariants
} from "@/utils/animations";

interface LoginForm {
  username: string;
  password: string;
}

// Helper function to load profile with fallback for missing RBAC columns
async function loadProfile(authUserEmail: string) {
  if (!supabase) return null;
  
  // Try with RBAC fields first
  let { data, error } = await supabase
    .from("profiles")
    .select("id,email,username,full_name,role,is_superuser,is_active,segment_code,center_id,access_level")
    .eq("email", authUserEmail)
    .single();
  
  // If RBAC fields don't exist (column not found error), try without them
  if (error && error.code === '42703') {
    console.log('RBAC columns not found, falling back to basic profile');
    const result = await supabase
      .from("profiles")
      .select("id,email,username,full_name,role,is_superuser,is_active")
      .eq("email", authUserEmail)
      .single();
    data = result.data;
    error = result.error;
  }
  
  if (error || !data) {
    console.error('Failed to load profile:', error);
    return null;
  }
  
  return {
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
  } as User;
}

const Login: React.FC = () => {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<LoginForm>({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const useSupabase = SUPABASE_CONFIG.USE_SUPABASE && supabaseEnabled && supabase;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

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
      if (useSupabase && supabase) {
        // Supabase Auth login
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.username.includes('@') ? formData.username : `${formData.username}@example.com`,
          password: formData.password,
        });

        if (authError) {
          // Try with email directly if username doesn't work
          const { data: retryAuth, error: retryError } = await supabase.auth.signInWithPassword({
            email: formData.username,
            password: formData.password,
          });

          if (retryError) {
            setError(retryError.message || "Invalid credentials");
            setLoading(false);
            return;
          }

          if (retryAuth.user) {
            const profile = await loadProfile(retryAuth.user.email || '');

            if (!profile) {
              setError("Failed to load user profile");
              setLoading(false);
              return;
            }

            login(undefined, profile);

            toast.success("Login successful!");
            if (profile.role === 'pending') {
              await router.push('/pending');
            } else {
              await router.push('/dashboard');
            }
          }
        } else if (authData.user) {
          // Load profile from profiles table
          const profile = await loadProfile(authData.user.email || '');

          if (!profile) {
            setError("Failed to load user profile");
            setLoading(false);
            return;
          }

          login(undefined, profile);

          toast.success("Login successful!");
          if (profile.role === 'pending') {
            await router.push('/pending');
          } else {
            await router.push('/dashboard');
          }
        }
      } else {
        // API-based login (fallback)
        const data = await apiService.post<{ user: User; access_token: string }>(API_ENDPOINTS.AUTH.LOGIN, formData);
        if (data && data.access_token && data.user) {
          login(data.access_token, data.user);
          if (data.user.role === 'pending') {
            await router.push('/pending');
          } else {
            await router.push('/dashboard');
          }
        } else {
          setError("Invalid response from server.");
          setLoading(false);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
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
                {useSupabase ? "Email" : "Username"}
              </label>
              <input
                type={useSupabase ? "email" : "text"}
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="text-black w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={useSupabase ? "Enter your email" : "Enter your username"}
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
