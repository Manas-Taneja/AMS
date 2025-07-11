import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState("");

  // Get the intended destination from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("token");
    const userId = urlParams.get("user");
    const oauthError = urlParams.get("error");

    if (oauthError) {
      setError("Google authentication failed. Please try again.");
      return;
    }

    if (token && userId) {
      // Get user info from backend
      apiService.get('/auth/me', token)
        .then((userData: any) => {
          // Ensure userData has the role field
          const userWithRole = {
            ...userData,
            role: userData.role || "pending", // Fallback to 'pending' if role is missing
          };
          login(token, userWithRole);
          navigate(from, { replace: true });
        })
        .catch((err) => {
          setError("Failed to get user information.");
        });
    } else {
      setError("Missing token or user information in callback.");
    }
  }, [location.search, login, navigate, from]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  // Optionally, show a loading spinner while processing
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