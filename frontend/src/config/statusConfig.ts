import { 
  LuCheck, 
  LuPause, 
  LuClock, 
  LuLoaderCircle, 
  LuCircle, 
  LuUser, 
  LuUsers, 
  LuBuilding2, 
  LuPackage,
  LuWrench,
  LuActivity,
  LuArchive
} from 'react-icons/lu';

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
      icon: LuCheck,
      description: 'Currently active and operational'
    },
    {
      value: 'inactive',
      label: 'Inactive',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: LuPause,
      description: 'Currently inactive or paused'
    },
    {
      value: 'pending',
      label: 'Pending',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: LuClock,
      description: 'Awaiting action or approval'
    },
    {
      value: 'error',
      label: 'Error',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: LuLoaderCircle,
      description: 'Error or issue detected'
    },
    {
      value: 'completed',
      label: 'Completed',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: LuCheck,
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
      icon: LuActivity,
      description: 'Project is currently in progress'
    },
    {
      value: 'paused',
      label: 'Paused',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: LuPause,
      description: 'Project is temporarily paused'
    },
    {
      value: 'completed',
      label: 'Completed',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: LuCheck,
      description: 'Project has been completed'
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: LuCircle,
      description: 'Project has been cancelled'
    },
    {
      value: 'planning',
      label: 'Planning',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      icon: LuClock,
      description: 'Project is in planning phase'
    }
  ],

  // Staff statuses
  staff: [
    {
      value: 'available',
      label: 'Available',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: LuUser,
      description: 'Staff member is available for work'
    },
    {
      value: 'busy',
      label: 'Busy',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: LuActivity,
      description: 'Staff member is currently busy'
    },
    {
      value: 'unavailable',
      label: 'Unavailable',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: LuPause,
      description: 'Staff member is unavailable'
    },
    {
      value: 'on_leave',
      label: 'On Leave',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      icon: LuClock,
      description: 'Staff member is on leave'
    }
  ],

  // Component statuses
  component: [
    {
      value: 'operational',
      label: 'Operational',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: LuCheck,
      description: 'Component is working normally'
    },
    {
      value: 'maintenance',
      label: 'Maintenance',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: LuWrench,
      description: 'Component is under maintenance'
    },
    {
      value: 'faulty',
      label: 'Faulty',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: LuLoaderCircle,
      description: 'Component has a fault'
    },
    {
      value: 'retired',
      label: 'Retired',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: LuArchive,
      description: 'Component has been retired'
    },
    {
      value: 'spare',
      label: 'Spare',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: LuPackage,
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
      icon: LuBuilding2,
      description: 'Location is active and operational'
    },
    {
      value: 'inactive',
      label: 'Inactive',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: LuPause,
      description: 'Location is inactive'
    },
    {
      value: 'maintenance',
      label: 'Maintenance',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: LuWrench,
      description: 'Location is under maintenance'
    },
    {
      value: 'closed',
      label: 'Closed',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: LuCircle,
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
  return option ? option.icon : LuClock;
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
  { value: 'operations', label: 'Operations', icon: LuActivity },
  { value: 'maintenance', label: 'Maintenance', icon: LuWrench },
  { value: 'engineering', label: 'Engineering', icon: LuBuilding2 },
  { value: 'management', label: 'Management', icon: LuUsers },
  { value: 'support', label: 'Support', icon: LuUser },
];

// Location type configurations
export const locationTypeConfig = [
  { value: 'headquarters', label: 'Headquarters', icon: LuBuilding2 },
  { value: 'branch', label: 'Branch', icon: LuBuilding2 },
  { value: 'warehouse', label: 'Warehouse', icon: LuPackage },
  { value: 'factory', label: 'Factory', icon: LuWrench },
  { value: 'office', label: 'Office', icon: LuBuilding2 },
];

// Component type configurations
export const componentTypeConfig = [
  { value: 'equipment', label: 'Equipment', icon: LuWrench },
  { value: 'machinery', label: 'Machinery', icon: LuActivity },
  { value: 'electronics', label: 'Electronics', icon: LuPackage },
  { value: 'tools', label: 'Tools', icon: LuWrench },
  { value: 'vehicles', label: 'Vehicles', icon: LuActivity },
]; 