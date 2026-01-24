import React from "react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  onAction?: () => void
  actionLabel?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  action, 
  className = "",
  onAction,
  actionLabel
}) => (
  <div className={`flex flex-col items-center justify-center h-full py-16 px-4 text-center rounded-xl border-2 border-dashed border-border bg-muted/50 ${className}`}>
    {icon && (
      <div className="mb-6 p-4 bg-card rounded-full shadow-sm ring-1 ring-border">
        <div className="text-muted-foreground [&>svg]:w-8 [&>svg]:h-8">
          {icon}
        </div>
      </div>
    )}
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    {description && <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>}
    
    <div className="flex gap-3">
      {action}
      {onAction && actionLabel && (
        <Button onClick={onAction} variant="outline" className="min-w-[120px]">
          {actionLabel}
        </Button>
      )}
    </div>
  </div>
)

export default EmptyState
