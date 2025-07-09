import { useParams } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Building2, CheckCircle, Pause, Clock, Calendar } from "lucide-react"
import { useDetailPage } from "../hooks/useDetailPage"
import { DetailPageLayout } from "../components/DetailPageLayout"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

interface Project {
  id: number
  thumbnail_url?: string
  name: string
  status: string
  progress: number
  created_at: string
  updated_at: string
}

interface ProjectUpdate {
  name?: string
  status?: string
  progress?: number
  thumbnail_url?: string
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
]

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "paused":
      return <Pause className="h-4 w-4 text-yellow-500" />
    case "completed":
      return <CheckCircle className="h-4 w-4 text-blue-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800"
    case "paused":
      return "bg-yellow-100 text-yellow-800"
    case "completed":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const {
    data: project,
    loading,
    editMode,
    saving,
    deleteDialogOpen,
    formData,
    setEditMode,
    setDeleteDialogOpen,
    setFormData,
    handleUpdate,
    handleDelete,
    handleCancel,
  } = useDetailPage<Project, ProjectUpdate>({
    id: id!,
    apiEndpoint: "http://localhost:8000/api/projects",
    entityName: "Project",
    listRoute: "/projects",
  })

  const mainContent = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Project Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || "active"}
                onValueChange={value => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min={0}
                max={100}
                value={formData.progress ?? 0}
                onChange={e => setFormData({ ...formData, progress: Number(e.target.value) })}
                placeholder="Enter progress"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <Input
                id="thumbnail_url"
                value={formData.thumbnail_url || ""}
                onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="Enter thumbnail URL"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Project Name</Label>
              <p className="text-base font-medium">{project?.name}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <Badge className={getStatusColor(project?.status!)}>
                {getStatusIcon(project?.status!)} {project?.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Progress</Label>
              <div className="flex items-center gap-2">
                <Progress value={project?.progress} className="w-32" />
                <span className="text-base font-medium">{project?.progress}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Thumbnail</Label>
              {project?.thumbnail_url ? (
                <img src={project.thumbnail_url} alt="Thumbnail" className="h-16 w-16 rounded object-cover" />
              ) : (
                <span className="text-gray-400">No thumbnail</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const sidebarContent = (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">Created</Label>
          <p className="text-sm">
            {project?.created_at && new Date(project.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-muted-foreground">Last Updated</Label>
          <p className="text-sm">
            {project?.updated_at && new Date(project.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DetailPageLayout
      title={project?.name || ""}
      subtitle="Project management"
      backRoute="/projects"
      entityName="Project"
      loading={loading}
      editMode={editMode}
      saving={saving}
      deleteDialogOpen={deleteDialogOpen}
      onEdit={() => setEditMode(true)}
      onSave={handleUpdate}
      onCancel={handleCancel}
      onDelete={handleDelete}
      onDeleteConfirm={handleDelete}
      setDeleteDialogOpen={setDeleteDialogOpen}
      data={project}
      mainContent={mainContent}
      sidebarContent={sidebarContent}
      created_at={project?.created_at}
      updated_at={project?.updated_at}
    />
  )
} 