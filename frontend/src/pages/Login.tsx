import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";
import { 
  fadeInUpVariants, 
  scaleVariants, 
  buttonVariants 
} from "@/utils/animations";
// import { GoogleLogin } from '@react-oauth/google';
// import { useAuth } from '../context/AuthContext';
// import { Alert } from '../components/Alert';

interface LoginForm {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    username: string;
    full_name: string;
    is_active: boolean;
    is_superuser: boolean;
    role: string;
  };
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginForm>({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || "/dashboard";

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const userId = urlParams.get('user_id');
    const oauthError = urlParams.get('error');

    if (oauthError) {
      setError('Google authentication failed. Please try again.');
      return;
    }

    if (token && userId) {
      // Get user info from backend
      apiService.get('/auth/me', token)
        .then((userData: any) => {
          // Ensure userData has the role field
          const userWithRole = {
            ...userData,
            role: userData.role || 'pending'  // Fallback to 'pending' if role is missing
          };
          login(token, userWithRole);
          navigate(from, { replace: true });
        })
        .catch(err => {
          setError('Failed to get user information.');
        });
    }
  }, [location.search, login, navigate, from]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data: LoginResponse = await apiService.post("/auth/login", formData);
      
      // Use the auth context to login
      login(data.access_token, data.user);
      
      // Redirect to the intended destination or dashboard
      navigate(from, { replace: true });
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div 
        className="p-8 bg-white rounded-lg shadow-xl w-full max-w-md"
        variants={scaleVariants}
        initial="initial"
        animate="in"
      >
        <motion.div 
          className="text-center mb-8"
          variants={fadeInUpVariants}
          initial="initial"
          animate="in"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          variants={fadeInUpVariants}
          initial="initial"
          animate="in"
        >
          {/* {error && <Alert type="error" message={error} />} */}

          <motion.div variants={fadeInUpVariants}>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username"
            />
          </motion.div>

          <motion.div variants={fadeInUpVariants}>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {loading ? "Signing in..." : "Sign In"}
          </motion.button>

          <motion.div 
            className="relative my-6"
            variants={fadeInUpVariants}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </motion.div>
          <motion.div variants={fadeInUpVariants}>
            <motion.button
              type="button"
              onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  fill="#4285F4"
                />
              </svg>
              Sign in with Google
            </motion.button>
          </motion.div>
        </motion.form>

        <motion.div 
          className="mt-6 text-center"
          variants={fadeInUpVariants}
          initial="initial"
          animate="in"
        >
          <p className="text-sm text-gray-600">
            Demo credentials:
          </p>
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <p>Admin: username: admin, password: admin123</p>
            <p>User: username: user, password: user123</p>
            <p>Manager: username: manager, password: manager123</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login; 