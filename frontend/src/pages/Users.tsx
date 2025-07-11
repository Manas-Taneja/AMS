import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AdminOnly } from '../components/RoleBasedComponent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BaseLayout } from '../components/BaseLayout';
import { Trash2 } from 'lucide-react';
import { apiService } from '../services/api';
import { 
  fadeInUpVariants, 
  containerVariants, 
  itemVariants,
  cardVariants 
} from '@/utils/animations';

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

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('access_token');
  const { id: currentUserId } = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [allUsers, pendingUsers] = await Promise.all([
        apiService.get('/admin/users', token || undefined) as Promise<User[]>,
        apiService.get('/admin/users/pending', token || undefined) as Promise<User[]>,
      ]);
      setUsers(allUsers);
      setPendingUsers(pendingUsers);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string, userName: string) => {
    const confirmed = window.confirm(`Are you sure you want to change ${userName} role to ${newRole}?`);
    if (!confirmed) return;
    try {
      await apiService.put(`/admin/users/${userId}/role?role=${encodeURIComponent(newRole)}`, {}, token || undefined);
      toast.success('Role updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleApprove = async (userId: number, role: string) => {
    try {
      await apiService.put(`/admin/users/${userId}/approve`, { role, is_active: true }, token || undefined);
      toast.success('User approved');
      fetchUsers();
    } catch {
      toast.error('Failed to approve user');
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      await apiService.delete(`/admin/users/${userId}`, token || undefined);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  if (loading) return (
    <BaseLayout loading={true}>
      <div></div>
    </BaseLayout>
  );

  return (
    <AdminOnly>
      <BaseLayout className="p-8">
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
                      <Select onValueChange={(role) => handleApprove(user.id, role)}>
                        <SelectTrigger className="w-auto focus:outline-none focus:ring-0 focus-visible:ring-0">
                          <SelectValue placeholder="Approve as..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
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
                      <Select value={user.role} onValueChange={(role) => handleRoleChange(user.id, role, user.full_name)}>
                        <SelectTrigger className="w-auto focus:outline-none focus:ring-0 focus-visible:ring-0" disabled={user.id === currentUserId}>
                          
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
                        disabled={user.id === currentUserId}
                        title={user.id === currentUserId ? 'You cannot delete your own account' : 'Delete user'}
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

export default Users; 