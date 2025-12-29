import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminOnly } from '@/components/RoleBasedComponent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BaseLayout } from '@/components/BaseLayout';
import { LuTrash2 as Trash2 } from 'react-icons/lu';
import { apiService } from '@/services/api';
import { API_ENDPOINTS, SUPABASE_CONFIG } from '@/config';
import { supabase, supabaseEnabled } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { 
  fadeInUpVariants, 
  containerVariants, 
  itemVariants
} from '@/utils/animations';
import { useConfirmation } from "@/hooks/useConfirmation";
import ProtectedRoute from '@/components/ProtectedRoute';

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'User' },
];

const fetchUsers = async (
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  setPendingUsers: React.Dispatch<React.SetStateAction<User[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  useSupabase: boolean
) => {
  setLoading(true);
  try {
    if (useSupabase && supabase) {
      // Fetch all users from profiles table
      const { data: allProfiles, error } = await supabase
        .from('profiles')
        .select('id,email,username,full_name,role,is_active,is_superuser,created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const profiles = (allProfiles || []) as User[];
      setUsers(profiles.filter(p => p.role !== 'pending'));
      setPendingUsers(profiles.filter(p => p.role === 'pending'));
    } else {
      const token = sessionStorage.getItem('access_token');
      const [allUsers, pendingUsers] = await Promise.all([
        apiService.get(API_ENDPOINTS.AUTH.ADMIN.USERS, token || undefined) as Promise<User[]>,
        apiService.get(API_ENDPOINTS.AUTH.ADMIN.PENDING_USERS, token || undefined) as Promise<User[]>,
      ]);
      setUsers(allUsers);
      setPendingUsers(pendingUsers);
    }
  } catch (err) {
    toast.error('Failed to fetch users');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { confirm } = useConfirmation();
  const useSupabase = Boolean(SUPABASE_CONFIG.USE_SUPABASE && supabaseEnabled && supabase);

  useEffect(() => {
    fetchUsers(setUsers, setPendingUsers, setLoading, useSupabase);
  }, [useSupabase]);

  const handleRoleChange = async (userId: number, newRole: string, userName: string) => {
    const confirmed = await confirm({
      title: 'Change Role',
      message: `Are you sure you want to change ${userName}'s role to ${newRole}?`,
      confirmText: 'Change',
      cancelText: 'Cancel',
      type: 'warning'
    });
    
    if (!confirmed) {
      return;
    }
    
    try {
      if (useSupabase && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', userId);
        
        if (error) throw error;
        toast.success('User role updated successfully');
        fetchUsers(setUsers, setPendingUsers, setLoading, useSupabase);
      } else {
        const token = sessionStorage.getItem('access_token');
        await apiService.put(API_ENDPOINTS.AUTH.ADMIN.UPDATE_USER_ROLE(userId), { role: newRole }, token || undefined);
        toast.success('User role updated successfully');
        fetchUsers(setUsers, setPendingUsers, setLoading, useSupabase);
      }
    } catch (err) {
      toast.error('Failed to update user role');
      console.error(err);
    }
  };

  const handleApprove = async (userId: number, role: string) => {
    try {
      if (useSupabase && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ role, is_active: true })
          .eq('id', userId);
        
        if (error) throw error;
        toast.success('User approved');
        fetchUsers(setUsers, setPendingUsers, setLoading, useSupabase);
      } else {
        const token = sessionStorage.getItem('access_token');
        await apiService.put(API_ENDPOINTS.AUTH.ADMIN.APPROVE_USER(userId), { role, is_active: true }, token || undefined);
        toast.success('User approved');
        fetchUsers(setUsers, setPendingUsers, setLoading, useSupabase);
      }
    } catch (err) {
      toast.error('Failed to approve user');
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    const confirmed = await confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete user ${userName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'error'
    });
    
    if (!confirmed) {
      return;
    }
    
    try {
      if (useSupabase && supabase) {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        
        if (error) throw error;
        toast.success('User deleted successfully');
        fetchUsers(setUsers, setPendingUsers, setLoading, useSupabase);
      } else {
        const token = sessionStorage.getItem('access_token');
        await apiService.delete(API_ENDPOINTS.AUTH.ADMIN.DELETE_USER(userId), token || undefined);
        toast.success('User deleted successfully');
        fetchUsers(setUsers, setPendingUsers, setLoading, useSupabase);
      }
    } catch (err) {
      toast.error('Failed to delete user');
      console.error(err);
    }
  };

  if (loading) return (
    <BaseLayout loading={true}>
      <div></div>
    </BaseLayout>
  );

  return (
    <AdminOnly>
      <BaseLayout className="p-8 text-black">
        <motion.div 
          className="max-w-4xl mx-auto space-y-8"
          variants={containerVariants}
          initial="initial"
          animate="in"
        >
          <motion.h1 
            className="text-3xl font-bold mb-6"
            variants={fadeInUpVariants}
            initial="initial"
            animate="in"
          >
            User Management
          </motion.h1>
          {pendingUsers.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Pending Users</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pendingUsers.map((user, index) => (
                    <motion.div 
                      key={user.id} 
                      className="flex items-center justify-between border-b py-2 last:border-b-0"
                      variants={itemVariants}
                      initial="initial"
                      animate="in"
                      transition={{ delay: index * 0.1 }}
                    >
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <Select onValueChange={(role: string) => handleApprove(user.id, role)}>
                        <SelectTrigger className="w-auto focus:outline-none focus:ring-0 focus-visible:ring-0">
                          <SelectValue placeholder="Approve as..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white !text-black">
                          {roleOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="focus:outline-none focus:ring-0 focus-visible:ring-0">{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {users.filter(user => user.role !== 'pending').map((user, index) => (
                  <motion.div 
                    key={user.id} 
                    className="flex items-center justify-between border-b py-2 last:border-b-0"
                    variants={itemVariants}
                    initial="initial"
                    animate="in"
                    transition={{ delay: index * 0.05 }}
                  >
                    <div>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{user.role}</Badge>
                      <Select value={user.role} onValueChange={(role: string) => handleRoleChange(user.id, role, user.full_name)}>
                        <SelectTrigger className="w-auto focus:outline-none focus:ring-0 focus-visible:ring-0" disabled={user.id === currentUser?.id}>
                          
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {roleOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="focus:outline-none focus:ring-0 focus-visible:ring-0">{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:bg-red-100"
                        onClick={() => handleDeleteUser(user.id, user.full_name)}
                        disabled={user.id === currentUser?.id}
                        title={user.id === currentUser?.id ? 'You cannot delete your own account' : 'Delete user'}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </BaseLayout>
    </AdminOnly>
  );
};

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <Users />
    </ProtectedRoute>
  );
} 