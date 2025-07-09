import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Staff from "./pages/Staff";
import Location from "./pages/Location";
import AssetsComponents from "./pages/AssetsComponents";
import Settings from "./pages/Settings";
import Projects from "./pages/Projects";
import ComponentDetail from "./pages/ComponentDetail";
import LocationDetail from "./pages/LocationDetail";
import ProjectDetail from "./pages/ProjectDetail";
import StaffDetail from "./pages/StaffDetail";
import Training from "./pages/Training";
import { GoogleOAuthProvider } from '@react-oauth/google';
import PendingApproval from './pages/PendingApproval';
import UserManagement from './pages/Admin/UserManagement';
import Users from './pages/Users';
import AuthCallback from "./pages/AuthCallback";
// Placeholder components for new routes
const Assets = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Assets Management</h1>
    <p className="text-muted-foreground">Manage all your assets in one place.</p>
  </div>
);

const Reports = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Reports & Analytics</h1>
    <p className="text-muted-foreground">Generate reports and view analytics.</p>
  </div>
);

const Documents = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">Documents</h1>
    <p className="text-muted-foreground">Asset documentation and files.</p>
  </div>
);

const Profile = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold mb-4">User Profile</h1>
    <p className="text-muted-foreground">Manage your account settings.</p>
  </div>
);

export default function App() {
  const { isAuthenticated, isPending, isAdmin } = useAuth();

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "GOOGLE_CLIENT_ID_HERE"}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <main className="w-full bg-background">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/assets" element={<Assets />} />
                      <Route path="/staff" element={<Staff />} />
                      <Route path="/staff/:id" element={<StaffDetail />} />
                      <Route path="/location" element={<Location />} />
                      <Route path="/location/:id" element={<LocationDetail />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/components" element={<AssetsComponents />} />
                      <Route path="/components/:id" element={<ComponentDetail />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/:id" element={<ProjectDetail />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/training" element={<Training />} />
                    </Routes>
                  </main>
                </ProtectedRoute>
              }
            />
            {/* Show pending approval page for pending users */}
            {isAuthenticated && isPending() && (
              <Route path="*" element={<PendingApproval />} />
            )}
            {/* Admin routes */}
            {isAuthenticated && isAdmin() && (
              <Route path="/admin/users" element={<UserManagement />} />
            )}
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
