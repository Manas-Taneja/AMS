import { 
  CheckCircle, 
  Pause, 
  Clock, 
  AlertCircle, 
  XCircle, 
  User, 
  Users, 
  Building2, 
  Package,
  Wrench,
  Activity,
  Archive
} from 'lucide-react';

export interface StatusOption {
  value: string;
  label: string;
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface StatusConfig {
  [key: string]: StatusOption[];
}

// Common status configurations
export const statusConfig: StatusConfig = {
  // General statuses
  general: [
    {
      value: 'active',
      label: 'Active',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: CheckCircle,
      description: 'Currently active and operational'
    },
    {
      value: 'inactive',
      label: 'Inactive',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: Pause,
      description: 'Currently inactive or paused'
    },
    {
      value: 'pending',
      label: 'Pending',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: Clock,
      description: 'Awaiting action or approval'
    },
    {
      value: 'error',
      label: 'Error',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: AlertCircle,
      description: 'Error or issue detected'
    },
    {
      value: 'completed',
      label: 'Completed',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: CheckCircle,
      description: 'Successfully completed'
    }
  ],

  // Project statuses
  project: [
    {
      value: 'active',
      label: 'Active',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: Activity,
      description: 'Project is currently in progress'
    },
    {
      value: 'paused',
      label: 'Paused',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: Pause,
      description: 'Project is temporarily paused'
    },
    {
      value: 'completed',
      label: 'Completed',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: CheckCircle,
      description: 'Project has been completed'
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: XCircle,
      description: 'Project has been cancelled'
    },
    {
      value: 'planning',
      label: 'Planning',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      icon: Clock,
      description: 'Project is in planning phase'
    }
  ],

  // Staff statuses
  staff: [
    {
      value: 'active',
      label: 'Active',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: User,
      description: 'Staff member is active and available'
    },
    {
      value: 'inactive',
      label: 'Inactive',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: Pause,
      description: 'Staff member is inactive'
    },
    {
      value: 'on_leave',
      label: 'On Leave',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      icon: Clock,
      description: 'Staff member is on leave'
    },
    {
      value: 'terminated',
      label: 'Terminated',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: XCircle,
      description: 'Staff member has been terminated'
    }
  ],

  // Component statuses
  component: [
    {
      value: 'operational',
      label: 'Operational',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: CheckCircle,
      description: 'Component is working normally'
    },
    {
      value: 'maintenance',
      label: 'Maintenance',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: Wrench,
      description: 'Component is under maintenance'
    },
    {
      value: 'faulty',
      label: 'Faulty',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: AlertCircle,
      description: 'Component has a fault'
    },
    {
      value: 'retired',
      label: 'Retired',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: Archive,
      description: 'Component has been retired'
    },
    {
      value: 'spare',
      label: 'Spare',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: Package,
      description: 'Component is available as spare'
    }
  ],

  // Location statuses
  location: [
    {
      value: 'active',
      label: 'Active',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: Building2,
      description: 'Location is active and operational'
    },
    {
      value: 'inactive',
      label: 'Inactive',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: Pause,
      description: 'Location is inactive'
    },
    {
      value: 'maintenance',
      label: 'Maintenance',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: Wrench,
      description: 'Location is under maintenance'
    },
    {
      value: 'closed',
      label: 'Closed',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: XCircle,
      description: 'Location has been closed'
    }
  ]
};

// Helper functions
export function getStatusConfig(type: string): StatusOption[] {
  return statusConfig[type] || statusConfig.general || [];
}

export function getStatusOption(type: string, value: string): StatusOption | null {
  const config = getStatusConfig(type);
  return config.find(option => option.value === value) || null;
}

export function getStatusColor(type: string, value: string): string {
  const option = getStatusOption(type, value);
  return option ? option.bgColor : 'bg-gray-100';
}

export function getStatusTextColor(type: string, value: string): string {
  const option = getStatusOption(type, value);
  return option ? option.color : 'text-gray-600';
}

export function getStatusIcon(type: string, value: string) {
  const option = getStatusOption(type, value);
  return option ? option.icon : Clock;
}

export function getStatusLabel(type: string, value: string): string {
  const option = getStatusOption(type, value);
  return option ? option.label : value;
}

// Status badge component props
export interface StatusBadgeProps {
  type: string;
  value: string;
  showIcon?: boolean;
  className?: string;
}

// Department configurations
export const departmentConfig = [
  { value: 'operations', label: 'Operations', icon: Activity },
  { value: 'maintenance', label: 'Maintenance', icon: Wrench },
  { value: 'engineering', label: 'Engineering', icon: Building2 },
  { value: 'management', label: 'Management', icon: Users },
  { value: 'support', label: 'Support', icon: User },
];

// Location type configurations
export const locationTypeConfig = [
  { value: 'headquarters', label: 'Headquarters', icon: Building2 },
  { value: 'branch', label: 'Branch', icon: Building2 },
  { value: 'warehouse', label: 'Warehouse', icon: Package },
  { value: 'factory', label: 'Factory', icon: Wrench },
  { value: 'office', label: 'Office', icon: Building2 },
];

// Component type configurations
export const componentTypeConfig = [
  { value: 'equipment', label: 'Equipment', icon: Wrench },
  { value: 'machinery', label: 'Machinery', icon: Activity },
  { value: 'electronics', label: 'Electronics', icon: Package },
  { value: 'tools', label: 'Tools', icon: Wrench },
  { value: 'vehicles', label: 'Vehicles', icon: Activity },
]; 