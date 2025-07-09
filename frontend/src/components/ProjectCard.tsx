import { Calendar, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Project } from "../../types/project"
import { projectStatusConfig } from "../utils/statusColors"

interface ProjectCardProps {
  project: Project
  viewMode?: "grid" | "list"
}

export function ProjectCard({ project, viewMode = "grid" }: ProjectCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Invalid date"
    }
  }

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                {project.thumbnailUrl ? (
                  <img
                    src={project.thumbnailUrl || "/placeholder.svg"}
                    alt={project.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                <p className="text-sm text-gray-600 truncate">{project.description || "No description"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className={projectStatusConfig[project.status as keyof typeof projectStatusConfig]?.color}>{project.status}</Badge>

              <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(project.updatedAt)}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="p-0">
        <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl || "/placeholder.svg"}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{project.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 truncate flex-1">{project.name}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description || "No description available"}</p>

        <div className="flex items-center justify-between">
          <Badge className={projectStatusConfig[project.status as keyof typeof projectStatusConfig]?.color}>{project.status}</Badge>

          <div className="text-xs text-gray-500 flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(project.updatedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
