import { useParams } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Building2, CheckCircle, Pause, Clock, Calendar, FileText } from "lucide-react"
import { useDetailPage } from "../hooks/useDetailPage"
import { DetailPageLayout } from "../components/DetailPageLayout"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { ManagerOrAdmin } from "../components/RoleBasedComponent"
import { useAuth } from "../context/AuthContext"
import React from "react"

interface Project {
  id: number
  thumbnail_url?: string
  name: string
  status: string
  progress: number
  created_at: string
  updated_at: string
  funding_type?: "govt" | "self"
  funding_body?: string
  funding_received?: number
  report_links?: { label: string; url: string }[]
}

interface ProjectUpdate {
  name?: string
  status?: string
  progress?: number
  thumbnail_url?: string
  funding_type?: "govt" | "self"
  funding_body?: string
  funding_received?: number
  report_links?: { label: string; url: string }[]
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
  const { user } = useAuth();
  const [newReportLabel, setNewReportLabel] = React.useState("");
  const [newReportUrl, setNewReportUrl] = React.useState("");
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
            <div className="space-y-2">
              <Label htmlFor="funding_type">Funding Type</Label>
              <Select
                value={formData.funding_type || "self"}
                onValueChange={value => setFormData({ ...formData, funding_type: value as "govt" | "self" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select funding type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="govt">Government Funded</SelectItem>
                  <SelectItem value="self">Self Funded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.funding_type === "govt" && (
              <div className="space-y-2">
                <Label htmlFor="funding_body">Funded by (Govt. Body)</Label>
                <Input
                  id="funding_body"
                  value={formData.funding_body || ""}
                  onChange={e => setFormData({ ...formData, funding_body: e.target.value })}
                  placeholder="Enter government body name"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="funding_received">Funding Received (₹)</Label>
              <Input
                id="funding_received"
                type="number"
                min={0}
                value={formData.funding_received ?? ""}
                onChange={e => setFormData({ ...formData, funding_received: Number(e.target.value) })}
                placeholder="Enter amount received"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Project Reports</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newReportLabel}
                  onChange={e => setNewReportLabel(e.target.value)}
                  placeholder="Report label (e.g. Q1 Report)"
                />
                <Input
                  value={newReportUrl}
                  onChange={e => setNewReportUrl(e.target.value)}
                  placeholder="Report URL"
                />
                <button
                  type="button"
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                  onClick={() => {
                    if (newReportLabel && newReportUrl) {
                      setFormData({
                        ...formData,
                        report_links: [
                          ...(formData.report_links || []),
                          { label: newReportLabel, url: newReportUrl },
                        ],
                      });
                      setNewReportLabel("");
                      setNewReportUrl("");
                    }
                  }}
                >
                  Add
                </button>
              </div>
              <ul className="space-y-1">
                {(formData.report_links || []).map((link, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span>{link.label}:</span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{link.url}</a>
                    <button
                      type="button"
                      className="text-red-500 ml-2"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          report_links: (formData.report_links || []).filter((_, i) => i !== idx),
                        });
                      }}
                    >Remove</button>
                  </li>
                ))}
              </ul>
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
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Funding Type</Label>
              <span className="text-base font-medium capitalize">{project?.funding_type === "govt" ? "Government Funded" : "Self Funded"}</span>
            </div>
            {project?.funding_type === "govt" && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Funded by (Govt. Body)</Label>
                <span className="text-base font-medium">{project?.funding_body || <span className="text-gray-400">N/A</span>}</span>
              </div>
            )}
            <ManagerOrAdmin>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Funding Received</Label>
                <span className="text-base font-medium">₹ {project?.funding_received?.toLocaleString() || <span className="text-gray-400">N/A</span>}</span>
              </div>
            </ManagerOrAdmin>
            <div className="space-y-1 col-span-2">
              <Label className="text-sm font-medium text-muted-foreground">Project Reports</Label>
              {(project?.report_links && project.report_links.length > 0) ? (
                <ul className="space-y-1">
                  {project.report_links.map((link, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span>{link.label}:</span>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{link.url}</a>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-400">No reports available</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const sidebarContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-4 w-4" /> Gantt Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-gray-400 italic">
            [Gantt chart visualization coming soon]
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-4 w-4" /> Work Breakdown Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center text-gray-400 italic">
            [Work Breakdown Structure visualization coming soon]
          </div>
        </CardContent>
      </Card>
    </div>
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