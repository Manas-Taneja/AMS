import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LuClock as Clock, LuMail as Mail } from 'react-icons/lu';
import ProtectedRoute from '../../components/ProtectedRoute';
import { Button } from '@/components/ui/button';

const PendingApproval: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Clock className="h-6 w-6 text-yellow-500" />
            <span className="text-2xl font-bold text-gray-800"  >Account Pending Approval</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription className="text-gray-600">
              Welcome, {user?.username}! Your account is currently pending approval from an administrator.
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p>What happens next?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>An administrator will review your account</li>
              <li>You&apos;ll be assigned appropriate permissions</li>
              <li>You&apos;ll receive access to the system features</li>
            </ul>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Mail className="h-4 w-4" />
            <span>Logged in as: {user?.email}</span>
          </div>
          
          <div className="text-xs text-gray-400 text-center">
            You can close this page and return later. You&apos;ll be notified when your account is approved.
          </div>
          <div className="flex justify-center mt-4">
            <Button className="cursor-pointer" variant="outline" onClick={logout}>Logout</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function PendingPage() {
  return (
    <ProtectedRoute>
      <PendingApproval />
    </ProtectedRoute>
  );
} 