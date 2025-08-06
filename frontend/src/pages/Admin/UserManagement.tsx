"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { AdminOnly } from "../../components/RoleBasedComponent"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import EmptyState from "../../components/ui/EmptyState"
import SearchFilterTabs from "../../components/SearchFilterTabs"
import {
  LuUser as User,
  LuCheck as CheckCircle,
  LuClock as Clock,
  LuShield as Shield,
  LuTriangle as AlertCircle,
} from 'react-icons/lu';
import { userStatusConfig, userRoleConfig } from "../../utils/statusColors"
import { 
  fadeInUpVariants, 
  containerVariants, 
  itemVariants
} from "@/utils/animations"
import { useConfirmation } from "@/hooks/useConfirmation"

interface UserData {
  id: number
  email: string
  username: string
  full_name: string
  role: string
  is_active: boolean
  is_superuser: boolean
  created_at: string
}

// Mock data for preview
const mockUsers: UserData[] = [
  {
    id: 1,
    email: "john.doe@example.com",
    username: "johndoe",
    full_name: "John Doe",
    role: "admin",
    is_active: true,
    is_superuser: true,
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    email: "jane.smith@example.com",
    username: "janesmith",
    full_name: "Jane Smith",
    role: "manager",
    is_active: true,
    is_superuser: false,
    created_at: "2024-02-20T14:15:00Z",
  },
  {
    id: 3,
    email: "bob.wilson@example.com",
    username: "bobwilson",
    full_name: "Bob Wilson",
    role: "staff",
    is_active: true,
    is_superuser: false,
    created_at: "2024-03-10T09:45:00Z",
  },
  {
    id: 4,
    email: "alice.brown@example.com",
    username: "alicebrown",
    full_name: "Alice Brown",
    role: "user",
    is_active: false,
    is_superuser: false,
    created_at: "2024-03-25T16:20:00Z",
  },
  {
    id: 5,
    email: "charlie.davis@example.com",
    username: "charliedavis",
    full_name: "Charlie Davis",
    role: "staff",
    is_active: true,
    is_superuser: false,
    created_at: "2024-04-05T11:10:00Z",
  },
]

const mockPendingUsers: UserData[] = [
  {
    id: 6,
    email: "new.user@example.com",
    username: "newuser",
    full_name: "New User",
    role: "pending",
    is_active: false,
    is_superuser: false,
    created_at: "2024-04-10T08:30:00Z",
  },
  {
    id: 7,
    email: "another.user@example.com",
    username: "anotheruser",
    full_name: "Another User",
    role: "pending",
    is_active: false,
    is_superuser: false,
    created_at: "2024-04-12T13:45:00Z",
  },
]

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([])
  const [pendingUsers, setPendingUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [processingUsers, setProcessingUsers] = useState<Set<number>>(new Set())
  const { confirm } = useConfirmation()

  useEffect(() => {
    // Simulate API call with mock data
    const fetchUsers = async () => {
      setLoading(true)
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUsers(mockUsers)
      setPendingUsers(mockPendingUsers)
      setLoading(false)
    }

    fetchUsers()
  }, [])

  const approveUser = async (userId: number, role: string) => {
    const userToApprove = pendingUsers.find((u) => u.id === userId)
    if (!userToApprove) return

    const confirmed = await confirm({
      title: 'Approve User',
      message: `Are you sure you want to approve ${userToApprove.full_name} as ${role}?`,
      confirmText: 'Approve',
      cancelText: 'Cancel',
      type: 'info'
    })

    if (!confirmed) {
      return
    }

    setProcessingUsers((prev) => new Set(prev).add(userId))

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      // Move user from pending to active users
      const approvedUser = {
        ...userToApprove,
        role,
        is_active: true,
      }

      setUsers((prev) => [...prev, approvedUser])
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId))
      toast.success("User approved successfully")
    } catch (error) {
      console.error("Error approving user:", error)
      toast.error("Failed to approve user")
    } finally {
      setProcessingUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const updateUserRole = async (userId: number, role: string) => {
    const userToUpdate = users.find((u) => u.id === userId)
    if (!userToUpdate) return

    const confirmed = await confirm({
      title: 'Update User Role',
      message: `Are you sure you want to change ${userToUpdate.full_name}'s role to ${role}?`,
      confirmText: 'Update',
      cancelText: 'Cancel',
      type: 'warning'
    })

    if (!confirmed) {
      return
    }

    setProcessingUsers((prev) => new Set(prev).add(userId))

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)))
      toast.success("User role updated successfully")
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role")
    } finally {
      setProcessingUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const getRoleBadge = (role: string, isActive = true) => {
    const config = userRoleConfig[role as keyof typeof userRoleConfig] || userRoleConfig.user
    const Icon = config.icon

    return (
      <Badge variant="outline" className={`${config.color} ${!isActive ? "opacity-50" : ""} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {role}
      </Badge>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    const status = isActive ? "active" : "inactive"
    const config = userStatusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {isActive ? "Active" : "Inactive"}
      </Badge>
    )
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const UserSkeleton = () => (
    <div className="flex items-center justify-between p-6 border rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  )

  if (loading) {
    return (
      <AdminOnly>
        <div className="p-8 space-y-6 max-w-7xl mx-auto">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <UserSkeleton key={i} />
              ))}
            </CardContent>
          </Card>
        </div>
      </AdminOnly>
    )
  }

  return (
    <AdminOnly>
      <motion.div 
        className="p-8 space-y-8 max-w-7xl mx-auto"
        variants={containerVariants}
        initial="initial"
        animate="in"
      >
        {/* Header */}
        <motion.div 
          className="space-y-2"
          variants={fadeInUpVariants}
          initial="initial"
          animate="in"
        >
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions across your organization</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="initial"
          animate="in"
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">{pendingUsers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">{users.filter((u) => u.is_active).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Admins</p>
                    <p className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Pending Users */}
        {pendingUsers.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <AlertCircle className="h-5 w-5" />
                <span>Pending Approvals ({pendingUsers.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-6 bg-white border border-yellow-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Applied:{" "}
                          {new Date(user.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getRoleBadge("pending")}
                      <Select 
                        onValueChange={(role: string) => approveUser(user.id, role)}
                        disabled={processingUsers.has(user.id)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Assign role & approve" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Users */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>All Users ({filteredUsers.length})</span>
              </CardTitle>

              <SearchFilterTabs
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Search users..."
                filters={[
                  {
                    key: "role",
                    label: "Role",
                    value: roleFilter,
                    options: [
                      { value: "all", label: "All Roles" },
                      { value: "admin", label: "Admin" },
                      { value: "manager", label: "Manager" },
                      { value: "staff", label: "Staff" },
                      { value: "user", label: "User" }
                    ],
                    onValueChange: setRoleFilter
                  }
                ]}
                viewMode="list"
                onViewModeChange={() => {}}
                owners={["All"]}
                groupedByOwner={{ All: filteredUsers }}
                renderGridItem={() => null}
                renderListItem={() => null}
                emptyStateIcon={null}
                emptyStateTitle=""
                emptyStateDescription=""
                gridCols=""
                totalCount={users.length}
                filteredCount={filteredUsers.length}
                itemLabel="users"
                onClearFilters={() => {
                  setSearchTerm("")
                  setRoleFilter("all")
                }}
                className="w-full sm:w-auto"
                allItems={filteredUsers}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <EmptyState
                  icon={<User className="h-12 w-12 text-gray-400" />}
                  title="No users found"
                  description="Try adjusting your search or filter criteria."
                />
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                          {user.is_superuser && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              <Shield className="h-3 w-3 mr-1" />
                              Super
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Joined:{" "}
                          {new Date(user.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(user.is_active)}
                      {getRoleBadge(user.role, user.is_active)}
                      <Select
                        value={user.role}
                        onValueChange={(role: string) => updateUserRole(user.id, role)}
                        disabled={processingUsers.has(user.id)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AdminOnly>
  )
}

export default UserManagement
