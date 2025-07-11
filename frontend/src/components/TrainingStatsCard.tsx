import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, Clock, GraduationCap, Building2 } from "lucide-react"
import { calculateCompletionRate } from "@/utils/trainingUtils"

interface TrainingStatsCardProps {
  enrolled: number
  completed: number
  duration: string
  institution: string
  showProgress?: boolean
}

export const TrainingStatsCard: React.FC<TrainingStatsCardProps> = ({
  enrolled,
  completed,
  duration,
  institution,
  showProgress = true
}) => {
  const totalParticipants = enrolled + completed
  const completionRate = calculateCompletionRate(enrolled, completed)

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Institution</p>
              <p className="text-sm font-medium">{institution}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Duration</p>
              <p className="text-sm font-medium">{duration}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Currently Enrolled</span>
            </div>
            <span className="text-lg font-bold text-blue-600">{enrolled}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <span className="text-lg font-bold text-green-600">{completed}</span>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-medium">{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        )}

        {/* Total Participants */}
        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Participants:</span>
            <span className="font-medium">{totalParticipants}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 