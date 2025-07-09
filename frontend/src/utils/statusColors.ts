import { Shield, UserCheck, User, Clock, CheckCircle, XCircle } from "lucide-react"

// User Status Configuration
export const userStatusConfig = {
  active: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  inactive: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: XCircle },
  pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
}

// User Role Configuration
export const userRoleConfig = {
  admin: { color: "bg-red-50 text-red-700 border-red-200", icon: Shield },
  manager: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: UserCheck },
  staff: { color: "bg-green-50 text-green-700 border-green-200", icon: User },
  user: { color: "bg-gray-50 text-gray-700 border-gray-200", icon: User },
  pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
}

// Project Status Configuration
export const projectStatusConfig = {
  Active: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: "🟢" },
  Paused: { color: "bg-amber-100 text-amber-800 border-amber-200", icon: "🟡" },
  Completed: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: "⚪" },
}

// Project Priority Configuration
export const projectPriorityConfig = {
  High: { color: "bg-red-100 text-red-800 border-red-200", icon: "🔴" },
  Medium: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🟡" },
  Low: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: "🔵" },
}

// Staff Status Configuration
export const staffStatusConfig = {
  active: { color: "bg-green-100 text-green-800 border-green-200", icon: "🟢" },
  "on-leave": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🟡" },
  inactive: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: "⚪" },
  "in-transit": { color: "bg-blue-100 text-blue-800 border-blue-200", icon: "🔵" },
}

// Staff Department Configuration
export const staffDepartmentConfig = {
  Operations: { color: "bg-blue-100 text-blue-800", icon: "🏢" },
  Technical: { color: "bg-green-100 text-green-800", icon: "⚙️" },
  "Human Resources": { color: "bg-purple-100 text-purple-800", icon: "👥" },
  Analytics: { color: "bg-orange-100 text-orange-800", icon: "📊" },
  Security: { color: "bg-red-100 text-red-800", icon: "🔒" },
}

// Component Status Configuration
export const componentStatusConfig = {
  Active: { color: "bg-green-100 text-green-800 border-green-200", icon: "🟢" },
  Idle: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🟡" },
  Maintenance: { color: "bg-red-100 text-red-800 border-red-200", icon: "🔴" },
}

// Location Status Configuration
export const locationStatusConfig = {
  active: { color: "bg-green-100 text-green-800 border-green-200", icon: "🟢" },
  maintenance: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "🟡" },
  inactive: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: "⚪" },
}

// Location Type Configuration
export const locationTypeConfig = {
  headquarters: { color: "bg-blue-100 text-blue-800", icon: "🏢" },
  branch: { color: "bg-green-100 text-green-800", icon: "🏪" },
  training: { color: "bg-purple-100 text-purple-800", icon: "🎓" },
}

// Utility Functions
export function getUserStatusColor(status: string) {
  return userStatusConfig[status as keyof typeof userStatusConfig]?.color || userStatusConfig.inactive.color
}

export function getUserRoleColor(role: string) {
  return userRoleConfig[role as keyof typeof userRoleConfig]?.color || userRoleConfig.user.color
}

export function getProjectStatusColor(status: string) {
  return projectStatusConfig[status as keyof typeof projectStatusConfig]?.color || projectStatusConfig.Completed.color
}

export function getProjectPriorityColor(priority: string) {
  return projectPriorityConfig[priority as keyof typeof projectPriorityConfig]?.color || projectPriorityConfig.Low.color
}

export function getStaffStatusColor(status: string) {
  return staffStatusConfig[status as keyof typeof staffStatusConfig]?.color || staffStatusConfig.inactive.color
}

export function getStaffDepartmentColor(department: string) {
  return staffDepartmentConfig[department as keyof typeof staffDepartmentConfig]?.color || "bg-gray-100 text-gray-800"
}

export function getComponentStatusColor(status: string) {
  return componentStatusConfig[status as keyof typeof componentStatusConfig]?.color || componentStatusConfig.Idle.color
}

export function getLocationStatusColor(status: string) {
  return locationStatusConfig[status as keyof typeof locationStatusConfig]?.color || locationStatusConfig.inactive.color
}

export function getLocationTypeColor(type: string) {
  return locationTypeConfig[type as keyof typeof locationTypeConfig]?.color || "bg-gray-100 text-gray-800"
} 