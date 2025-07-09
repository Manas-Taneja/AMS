import React, { useEffect, useState } from 'react';
import { AdminOnly } from '../components/RoleBasedComponent';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BaseLayout } from '../components/BaseLayout';
  import { Trash2 } from 'lucide-react';

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
      const [allRes, pendingRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:8000/api/admin/users/pending', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (allRes.ok) {
        setUsers(await allRes.json());
      }
      if (pendingRes.ok) {
        setPendingUsers(await pendingRes.json());
      }
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
      const res = await fetch(`http://localhost:8000/api/admin/users/${userId}/role?role=${encodeURIComponent(newRole)}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        toast.success('Role updated');
        fetchUsers();
      } else {
        toast.error('Failed to update role');
      }
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleApprove = async (userId: number, role: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, is_active: true }),
      });
      if (res.ok) {
        toast.success('User approved');
        fetchUsers();
      } else {
        toast.error('Failed to approve user');
      }
    } catch {
      toast.error('Failed to approve user');
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete user ${userName}? This action cannot be undone.`);
    if (!confirmed) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        toast.success('User deleted');
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Failed to delete user');
      }
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
        <div className="max-w-4xl mx-auto space-y-8">
              <h1 className="text-3xl font-bold mb-6">User Management</h1>
              {pendingUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Users</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
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
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {users.filter(user => user.role !== 'pending').map((user) => (
                    <div key={user.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
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
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </BaseLayout>
        </AdminOnly>
      );
    };

export default Users; 