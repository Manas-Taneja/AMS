import React, { useEffect } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, isPending } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('🔍 ProtectedRoute: Auth state check...');
    console.log('Loading:', loading);
    console.log('IsAuthenticated:', isAuthenticated);
    console.log('IsPending:', isPending());
    console.log('Current pathname:', pathname);
    
    if (!loading && !isAuthenticated) {
      console.log('🔍 ProtectedRoute: Not authenticated, redirecting to login');
      router.push('/login');
    } else if (!loading && isAuthenticated && isPending() && pathname !== '/pending') {
      console.log('🔍 ProtectedRoute: User is pending, redirecting to pending page');
      router.push('/pending');
    }
  }, [isAuthenticated, loading, isPending, router, pathname]);

  if (loading || !isAuthenticated || (isAuthenticated && isPending() && pathname !== '/pending')) {
    // Show loading spinner while checking authentication or redirecting
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 