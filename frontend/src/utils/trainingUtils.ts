// Training Level Configuration
export const trainingLevelConfig = {
  L1: { 
    color: "bg-green-100 text-green-800 border-green-200",
    name: "Beginner"
  },
  L2: { 
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    name: "Intermediate"
  },
  L3: { 
    color: "bg-red-100 text-red-800 border-red-200",
    name: "Advanced"
  }
}

export const getLevelColor = (level: string) => {
  return trainingLevelConfig[level as keyof typeof trainingLevelConfig]?.color || 
         "bg-gray-100 text-gray-800 border-gray-200"
}

export const getLevelName = (level: string) => {
  return trainingLevelConfig[level as keyof typeof trainingLevelConfig]?.name || 
         "Unknown"
}

export const calculateCompletionRate = (enrolled: number, completed: number) => {
  const totalParticipants = enrolled + completed
  return totalParticipants > 0 ? (completed / totalParticipants) * 100 : 0
} 