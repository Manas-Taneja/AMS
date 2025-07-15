
import { Badge } from '@/components/ui/badge';
import { getStatusOption } from '@/config/statusConfig';
import type { StatusBadgeProps } from '@/config/statusConfig';

export function StatusBadge({ 
  type, 
  value, 
  showIcon = true, 
  className = "" 
}: StatusBadgeProps) {
  const statusOption = getStatusOption(type, value);
  
  if (!statusOption) {
    return (
      <Badge variant="secondary" className={className}>
        {value}
      </Badge>
    );
  }

  const IconComponent = statusOption.icon;

  return (
    <Badge 
      className={`${statusOption.bgColor} ${statusOption.color} ${className}`}
    >
      {showIcon && <IconComponent className="h-3 w-3 mr-1" />}
      {statusOption.label}
    </Badge>
  );
}

// Specialized status badge components
export function ProjectStatusBadge({ value, ...props }: Omit<StatusBadgeProps, 'type'>) {
  return <StatusBadge type="project" value={value} {...props} />;
}

export function StaffStatusBadge({ value, ...props }: Omit<StatusBadgeProps, 'type'>) {
  return <StatusBadge type="staff" value={value} {...props} />;
}

export function ComponentStatusBadge({ value, ...props }: Omit<StatusBadgeProps, 'type'>) {
  return <StatusBadge type="component" value={value} {...props} />;
}

export function LocationStatusBadge({ value, ...props }: Omit<StatusBadgeProps, 'type'>) {
  return <StatusBadge type="location" value={value} {...props} />;
} 