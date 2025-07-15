"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import {
  Grid3X3,
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
import { useProjectsData } from "../hooks/useApiData"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import { BaseLayout } from "../components/BaseLayout"
import { projectStatusConfig, projectPriorityConfig } from "../utils/statusColors"
import { motion } from "framer-motion"
import { RoleBasedComponent, ManagerOrAdmin } from "../components/RoleBasedComponent"
import { StatsCards } from "../components/StatsCards"

import { EntityModal } from "../components/EntityModal"
import type { FieldConfig } from "../components/EntityModal"
import SearchFilterTabs from "../components/SearchFilterTabs"
import { useProjectsCrud } from "../hooks/useCrud"
import { useForm, validationRules } from "../hooks/useForm"
import { useModal } from "../hooks/useModal"
import { UnifiedHeader } from "../components/UnifiedHeader"


// Extended Project type to include UI-specific fields
type ExtendedProject = Omit<{
  id: string;
  name: string;
  description?: string;
  status: "Active" | "Paused" | "Completed";
  priority?: "High" | "Medium" | "Low";
  team?: string[];
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  tags?: string[];
  progress: number;
  color?: string;
  thumbnailUrl?: string;
  owner: string;
  category?: string;
}, 'budget' | 'spent'>;

interface ProjectFormData {
  name: string;
  description: string;
  status: "Active" | "Paused" | "Completed";
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  tags: string;
  owner: string;
  [key: string]: string | number | boolean | string[] | undefined;
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
  const { data: projects, loading, error, refetch } = useProjectsData(token || undefined)
  const { create, update } = useProjectsCrud(token || undefined)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"Active" | "Paused" | "Completed" | "All">("All")
  const [priorityFilter, setPriorityFilter] = useState<"High" | "Medium" | "Low" | "All">("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [selectedOwner, setSelectedOwner] = useState<string>("all")
  const navigate = useNavigate()
  
  // Modal management
  const addModal = useModal();
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form management
  const form = useForm<ProjectFormData>({
    initialData: {
      name: "",
      description: "",
      status: "Active",
      priority: "Medium",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || "", // 30 days from now
      tags: "",
      owner: "IIDT",
    },
    validationRules: [
      validationRules.required("name"),
      validationRules.required("description"),
      validationRules.required("status"),
      validationRules.required("priority"),
      validationRules.required("dueDate"),
    ],
    onSubmit: async (formData) => {
      const projectData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(",").map((s) => s.trim()) : [],
      };
      
      if (editMode && editingId) {
        await update(editingId, projectData);
      } else {
        await create(projectData);
      }
      
      addModal.close();
      setEditMode(false);
      setEditingId(null);
      form.reset();
      refetch();
    },
  });

  const ownerList = [ "PSSL", "IIDT", "Prakhar Aviation"];
  // Transform backend projects to include UI-specific fields
  const extendedProjects: ExtendedProject[] = projects.map((project: any, index: number) => ({
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
    color: colorGradients[index % colorGradients.length],
    thumbnailUrl: project.thumbnailUrl,
    owner: ownerList[index % ownerList.length] || 'Unknown',
    category: project.category, // Use backend value as-is
  }))

  const filteredProjects = extendedProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(search.toLowerCase())) ||
      (project.tags && project.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())))
    const matchesStatus = statusFilter === "All" || project.status === statusFilter
    const matchesPriority = priorityFilter === "All" || project.priority === priorityFilter
    const matchesOwner = selectedOwner === "all" || project.owner === selectedOwner
    return matchesSearch && matchesStatus && matchesPriority && matchesOwner
  })

  const stats = {
    total: extendedProjects.length,
    active: extendedProjects.filter((p) => p.status === "Active").length,
    completed: extendedProjects.filter((p) => p.status === "Completed").length,
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  const getDaysUntilDue = (dueDate: string) => Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const handleViewDetails = (projectId: string) => {
    navigate(`/projects/${projectId}`)
  }



  const handleModalSubmit = async (data: Record<string, any>) => {
    // Update form data with modal data
    Object.entries(data).forEach(([key, value]) => {
      form.setFieldValue(key as keyof ProjectFormData, value);
    });
    // Submit the form
    await form.handleSubmit();
  };

  // For owner tabs
  const owners = useMemo(() => Array.from(new Set(extendedProjects.map((p) => p.owner))), [extendedProjects]);
  const groupedByOwner = useMemo(() => {
    const map: Record<string, ExtendedProject[]> = {};
    owners.forEach((owner) => {
      map[owner] = filteredProjects.filter((project) => project.owner === owner);
    });
    return map;
  }, [owners, filteredProjects]);

  // Get unique categories for grouping, filter out undefined
  const categories: string[] = useMemo(() => Array.from(new Set(filteredProjects.map((project) => project.category).filter((c): c is string => typeof c === 'string'))), [filteredProjects]);

  // ProjectCard and ProjectListItem
  const ProjectCard = ({ project }: { project: ExtendedProject }) => (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden" onClick={() => handleViewDetails(project.id)}>
        <div className={`h-2 bg-gradient-to-r ${project.color}`}></div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${project.color} rounded-lg flex items-center justify-center shadow-lg`}>
              <span className="text-white text-lg font-bold">{project.name.charAt(0)}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleViewDetails(project.id)}>
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <ManagerOrAdmin>
                  <DropdownMenuItem>Edit Project</DropdownMenuItem>
                </ManagerOrAdmin>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <RoleBasedComponent allowedRoles={['admin']}>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">Delete Project</DropdownMenuItem>
                </RoleBasedComponent>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{project.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
          <div className="flex items-center gap-2 mb-4">
            <Badge className={projectStatusConfig[project.status]?.color} variant="outline">{project.status}</Badge>
            {project.priority && (
              <Badge className={projectPriorityConfig[project.priority]?.color} variant="outline">{project.priority}</Badge>
            )}
        </div>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-900">{project.progress}%</span>
              </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className={`bg-gradient-to-r ${project.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${project.progress}%` }}></div>
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
                    </div>
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {project.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">{tag}</span>
              ))}
              {project.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">+{project.tags.length - 3}</span>
              )}
            </div>
          )}
              </CardContent>
            </Card>
    </motion.div>
  );

  const ProjectListItem = ({ project }: { project: ExtendedProject }) => (
    <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden" onClick={() => handleViewDetails(project.id)}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 flex-1">
              <div className={`w-16 h-16 bg-gradient-to-r ${project.color} rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg`}>
                            <span className="text-white text-xl font-bold">{project.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-gray-900 text-lg truncate">{project.name}</h3>
                              {project.priority && (
                    <Badge className={projectPriorityConfig[project.priority]?.color} variant="outline">{project.priority}</Badge>
                              )}
                  <Badge className={projectStatusConfig[project.status]?.color} variant="outline">{project.status}</Badge>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleViewDetails(project.id)}>
                                <ArrowUpRight className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                <ManagerOrAdmin>
                              <DropdownMenuItem>Edit Project</DropdownMenuItem>
                </ManagerOrAdmin>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <RoleBasedComponent allowedRoles={['admin']}>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete Project</DropdownMenuItem>
                </RoleBasedComponent>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
    </motion.div>
  );

  const projectFields: FieldConfig[] = [
    { name: "name", label: "Project Name", type: "text", required: true },
    { name: "description", label: "Description", type: "text" },
    { name: "status", label: "Status", type: "select", options: [
      { value: "Active", label: "Active" },
      { value: "Paused", label: "Paused" },
      { value: "Completed", label: "Completed" }
    ]},
    { name: "priority", label: "Priority", type: "select", options: [
      { value: "High", label: "High" },
      { value: "Medium", label: "Medium" },
      { value: "Low", label: "Low" }
    ]},
    { name: "dueDate", label: "Due Date", type: "date" },
    { name: "owner", label: "Owner", type: "select", options: [
      { value: "IIDT", label: "IIDT" },
      { value: "Prakhar Aviation", label: "Prakhar Aviation" },
      { value: "PSSL", label: "PSSL" }
    ]},
    { name: "tags", label: "Tags (comma-separated)", type: "text" },
  ];

  const hasActiveFilters = !!(search || statusFilter !== "All" || priorityFilter !== "All");
  console.log('Projects hasActiveFilters:', { search, statusFilter, priorityFilter, hasActiveFilters });

  const handleExport = () => {
    // Export functionality
    alert('Export projects clicked')
  }

  // Add a CategorySubheader component
  const CategorySubheader = ({ category, count }: { category: string, count: number }) => (
    <div className="mb-2">
      <Card className="bg-gray-50 border-blue-200 border flex items-center px-6 py-3">
        <span className="font-semibold text-blue-700 text-lg">{category}</span>
      </Card>
    </div>
  );

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
        {/* Unified Header */}
        <UnifiedHeader
          title="Projects"
          subtitle="Manage and track your project portfolio"
          onAdd={() => addModal.open()}
          addLabel="New Project"
          onExport={handleExport}
          exportLabel="Export Projects"
        />

        {/* Stats Cards */}
        <StatsCards 
          cards={[
            {
              icon: <Grid3X3 className="w-6 h-6 text-white" />,
              label: "Total Projects",
              value: stats.total,
              bgClass: "bg-gradient-to-r from-blue-500 to-cyan-500"
            },
            {
              icon: <TrendingUp className="w-6 h-6 text-white" />,
              label: "Active Projects",
              value: stats.active,
              color: "text-emerald-600",
              bgClass: "bg-gradient-to-r from-emerald-500 to-green-500"
            },
            {
              icon: <Star className="w-6 h-6 text-white" />,
              label: "Completed",
              value: stats.completed,
              color: "text-purple-600",
              bgClass: "bg-gradient-to-r from-purple-500 to-pink-500"
            }
          ]}
          gridCols="grid grid-cols-3 gap-4"
        />

        {/* Search and Filters */}
        <SearchFilterTabs
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
              onValueChange: (value) => setStatusFilter(value as "Active" | "Paused" | "Completed" | "All")
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
              onValueChange: (value) => setPriorityFilter(value as "High" | "Medium" | "Low" | "All")
            }
          ]}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={true}
          owners={owners}
          groupedByOwner={groupedByOwner}
          emptyStateIcon={<Grid3X3 className="w-12 h-12 text-gray-400" />}
          emptyStateTitle="No projects found"
          emptyStateDescription="Try adjusting your search or filter criteria"
          gridCols="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          totalCount={extendedProjects.length}
          filteredCount={filteredProjects.length}
          itemLabel="projects"
          allItems={filteredProjects}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedOwner(tab);
          }}
          onClearFilters={() => {
            setSearch("");
            setStatusFilter("All");
            setPriorityFilter("All");
            setActiveTab("all");
            setSelectedOwner("all");
          }}
          renderGridItem={() => null}
          renderListItem={() => null}
        />

        {/* After SearchFilterTabs, group projects by category and render with subheaders */}
        {categories.map((category) => {
          const projectsInCategory = filteredProjects.filter((project) => project.category === category);
          if (projectsInCategory.length === 0) return null;
          return (
            <div key={category}>
              <CategorySubheader category={category} count={projectsInCategory.length} />
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-2'}>
                {projectsInCategory.map((project) =>
                  viewMode === 'grid' ? (
                    <ProjectCard key={project.id} project={project} />
                  ) : (
                    <ProjectListItem key={project.id} project={project} />
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Project Modal */}
      <EntityModal
        open={addModal.isOpen}
        onClose={() => { addModal.close(); setEditMode(false); setEditingId(null); form.reset(); }}
        onSubmit={handleModalSubmit}
        loading={form.isSubmitting}
        title={editMode ? "Edit Project" : "Add New Project"}
        buttonText={editMode ? "Save Changes" : "Create Project"}
        fields={projectFields}
        initialValues={form.data}
      />
    </BaseLayout>
  )
}
