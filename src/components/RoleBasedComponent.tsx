import React from 'react';
import { useAuth } from '@/context/AuthContext';

interface RoleBasedComponentProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  children,
  allowedRoles,
  fallback = null
}) => {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Convenience components
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedComponent allowedRoles={['admin']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const ManagerOrAdmin: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedComponent allowedRoles={['manager', 'admin']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
);

export const StaffOrAbove: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedComponent allowedRoles={['staff', 'manager', 'admin']} fallback={fallback}>
    {children}
  </RoleBasedComponent>
); 