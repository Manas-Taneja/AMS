"use client"

import { useState } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import SearchAndFilter from "../components/ui/SearchAndFilter"
import {
  Plus,
  Grid3X3,
  List,
  Calendar,
  MoreHorizontal,
  TrendingUp,
  Clock,
  Users,
  Star,
  ArrowUpRight,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu"
import { useProjects } from "../hooks/useProjects"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { BaseLayout } from "../components/BaseLayout"
import EmptyState from "../components/ui/EmptyState"
import { projectStatusConfig, projectPriorityConfig } from "../utils/statusColors"

// Extended Project type to include UI-specific fields
interface ExtendedProject {
  id: string
  name: string
  description?: string
  status: "Active" | "Paused" | "Completed"
  priority?: "High" | "Medium" | "Low"
  team?: string[]
  createdAt?: string
  updatedAt?: string
  dueDate?: string
  tags?: string[]
  progress: number
  budget?: number
  spent?: number
  color?: string
  thumbnailUrl?: string
}



const colorGradients = [
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-blue-500",
  "from-teal-500 to-green-500",
]

export default function Projects() {
  const { token } = useAuth()
  const { projects, loading, error, refetch } = useProjects(token)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"Active" | "Paused" | "Completed" | "All">("All")
  const [priorityFilter, setPriorityFilter] = useState<"High" | "Medium" | "Low" | "All">("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const navigate = useNavigate()

  // Transform backend projects to include UI-specific fields
  const extendedProjects: ExtendedProject[] = projects.map((project, index) => ({
    id: project.id,
    name: project.name,
    description: project.description || `Project ${project.name} - ${project.status} status with ${project.progress}% progress`,
    status: project.status as "Active" | "Paused" | "Completed",
    priority: ["High", "Medium", "Low"][index % 3] as "High" | "Medium" | "Low",
    team: [`Team Member ${index + 1}`, `Team Member ${index + 2}`],
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    dueDate: new Date(Date.now() + (30 + index * 15) * 24 * 60 * 60 * 1000).toISOString(), // Mock due dates
    tags: ["Project", "Development", "Management"],
    progress: project.progress,
    budget: 50000 + (index * 10000),
    spent: Math.floor((50000 + (index * 10000)) * (project.progress / 100)),
    color: colorGradients[index % colorGradients.length],
    thumbnailUrl: project.thumbnailUrl,
  }))

  const filteredProjects = extendedProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(search.toLowerCase())) ||
      (project.tags && project.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())))
    const matchesStatus = statusFilter === "All" || project.status === statusFilter
    const matchesPriority = priorityFilter === "All" || project.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = {
    total: extendedProjects.length,
    active: extendedProjects.filter((p) => p.status === "Active").length,
    completed: extendedProjects.filter((p) => p.status === "Completed").length,
    totalBudget: extendedProjects.reduce((sum, p) => sum + (p.budget || 0), 0),
    totalSpent: extendedProjects.reduce((sum, p) => sum + (p.spent || 0), 0),
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount)
  const getDaysUntilDue = (dueDate: string) => Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const handleViewDetails = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }

  if (loading) {
    return (
      <BaseLayout loading={true} onRetry={refetch}>
        <div></div>
      </BaseLayout>
    )
  }

  if (error) {
    return (
      <BaseLayout error={error} onRetry={refetch}>
        <div></div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                <p className="text-gray-600 mt-1">Manage and track your project portfolio</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="bg-white/60 backdrop-blur-sm border-gray-200/50"
                >
                  {viewMode === "grid" ? <List className="h-4 w-4 mr-2" /> : <Grid3X3 className="h-4 w-4 mr-2" />}
                  {viewMode === "grid" ? "List View" : "Grid View"}
                </Button>
                <Button className="shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Projects</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Grid3X3 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Projects</p>
                      <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-3xl font-bold text-purple-600">{stats.completed}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <SearchAndFilter
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search projects, tags, or team members..."
              filters={[
                {
                  key: "status",
                  label: "Status",
                  value: statusFilter,
                  options: [
                    { value: "All", label: "All Status" },
                    { value: "Active", label: "Active" },
                    { value: "Paused", label: "Paused" },
                    { value: "Completed", label: "Completed" }
                  ],
                  onValueChange: (value: any) => setStatusFilter(value)
                },
                {
                  key: "priority",
                  label: "Priority",
                  value: priorityFilter,
                  options: [
                    { value: "All", label: "All Priority" },
                    { value: "High", label: "High" },
                    { value: "Medium", label: "Medium" },
                    { value: "Low", label: "Low" }
                  ],
                  onValueChange: (value: any) => setPriorityFilter(value)
                }
              ]}  
              totalCount={extendedProjects.length}
              filteredCount={filteredProjects.length}
              itemLabel="projects"
              onClearFilters={() => {
                setSearch("")
                setStatusFilter("All")
                setPriorityFilter("All")
              }}
              hasActiveFilters={!!(search || statusFilter !== "All" || priorityFilter !== "All")}
            />

            {/* Enhanced Projects Display */}
            {filteredProjects.length === 0 ? (
              <EmptyState
                icon={
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    <Grid3X3 className="w-8 h-8 text-gray-500" />
                  </div>
                }
                title="No projects found"
                description="Try adjusting your search or filter criteria"
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearch("")
                      setStatusFilter("All")
                      setPriorityFilter("All")
                    }}
                    className="bg-white/80"
                  >
                    Clear all filters
                  </Button>
                }
              />
            ) : viewMode === "list" ? (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 flex-1">
                          <div
                            className={`w-16 h-16 bg-gradient-to-r ${project.color} rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg`}
                          >
                            <span className="text-white text-xl font-bold">{project.name.charAt(0)}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-gray-900 text-lg truncate">{project.name}</h3>
                              {project.priority && (
                                <Badge className={projectPriorityConfig[project.priority]?.color} variant="outline">
                                  {project.priority}
                                </Badge>
                              )}
                              <Badge className={projectStatusConfig[project.status]?.color} variant="outline">
                                {project.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-1">{project.description}</p>

                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              {project.team && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{project.team.length} members</span>
                                </div>
                              )}
                              {project.dueDate && (
                                <>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Due {formatDate(project.dueDate)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{getDaysUntilDue(project.dueDate)} days left</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{project.progress}% Complete</div>
                            <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                              <div
                                className={`bg-gradient-to-r ${project.color} h-2 rounded-full transition-all duration-500`}
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>

                          {project.budget && project.spent && (
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{formatCurrency(project.spent)}</div>
                              <div className="text-xs text-gray-500">of {formatCurrency(project.budget)}</div>
                            </div>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleViewDetails(project.id)}>
                                <ArrowUpRight className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit Project</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete Project</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden"
                    onClick={() => handleViewDetails(project.id)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${project.color}`}></div>

                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${project.color} rounded-lg flex items-center justify-center shadow-lg`}
                        >
                          <span className="text-white text-lg font-bold">{project.name.charAt(0)}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewDetails(project.id)}>
                              <ArrowUpRight className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Project</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Delete Project</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{project.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                      <div className="flex items-center gap-2 mb-4">
                        <Badge className={projectStatusConfig[project.status]?.color} variant="outline">
                          {project.status}
                        </Badge>
                        {project.priority && (
                          <Badge className={projectPriorityConfig[project.priority]?.color} variant="outline">
                            {project.priority}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${project.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center justify-between">
                          {project.team && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{project.team.length} members</span>
                            </div>
                          )}
                          {project.dueDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{getDaysUntilDue(project.dueDate)}d left</span>
                            </div>
                          )}
                        </div>
                        {project.budget && project.spent && (
                          <div className="flex items-center justify-between">
                            <span>Budget: {formatCurrency(project.spent)}</span>
                            <span>of {formatCurrency(project.budget)}</span>
                          </div>
                        )}
                      </div>

                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-4">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                              +{project.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </BaseLayout>
      )
}
