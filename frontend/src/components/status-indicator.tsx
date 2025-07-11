"use client"

import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  status: "active" | "maintenance" | "idle" | "critical"
  size?: "sm" | "md" | "lg"
}

export function StatusIndicator({ status, size = "md" }: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }

  const statusClasses = {
    active: "bg-green-500 animate-pulse",
    maintenance: "bg-yellow-500",
    idle: "bg-gray-400",
    critical: "bg-red-500 animate-pulse",
  }

  return <div className={cn("rounded-full", sizeClasses[size], statusClasses[status])} />
}
