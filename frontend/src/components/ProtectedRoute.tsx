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

  // Auth disabled: always render children without redirects or spinners

  // Previously, this component redirected unauthenticated users.
  // With auth disabled, return children directly.

  return <>{children}</>;
};

export default ProtectedRoute; 