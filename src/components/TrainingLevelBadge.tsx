import React from "react"
import { Badge } from "@/components/ui/badge"
import { getLevelColor, getLevelName } from "@/utils/trainingUtils"

interface TrainingLevelBadgeProps {
  level: string
  className?: string
}

export const TrainingLevelBadge: React.FC<TrainingLevelBadgeProps> = ({ 
  level, 
  className = "" 
}) => {
  return (
    <Badge className={`${getLevelColor(level)} ${className}`}>
      {level} - {getLevelName(level)}
    </Badge>
  )
} 