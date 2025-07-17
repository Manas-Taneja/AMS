import { useParams } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, CheckCircle, Clock, XCircle, Calendar } from "lucide-react"
import { useDetailPage } from "../hooks/useDetailPage"
import { DetailPageLayout } from "../components/DetailPageLayout"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

interface Staff {
  id: number
  name: string
  designation: string
  skills: string[] | string
  location: string
  availability: string
  project: string
  company: string
  created_at: string
  updated_at: string
}

interface StaffUpdate {
  name?: string
  designation?: string
  skills?: string
  location?: string
  availability?: string
  project?: string
  company?: string
}

const availabilityOptions = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "unavailable", label: "Unavailable" },
]

const getAvailabilityIcon = (availability: string) => {
  switch (availability?.toLowerCase()) {
    case "available":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "busy":
      return <Clock className="h-4 w-4 text-yellow-500" />
    case "unavailable":
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const getAvailabilityColor = (availability: string) => {
  switch (availability?.toLowerCase()) {
    case "available":
      return "bg-green-100 text-green-800"
    case "busy":
      return "bg-yellow-100 text-yellow-800"
    case "unavailable":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function StaffDetail() {
  const { id } = useParams<{ id: string }>()
  const {
    data: staff,
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
  } = useDetailPage<Staff, StaffUpdate>({
    id: id!,
    apiEndpoint: "http://localhost:8000/api/staff",
    entityName: "Staff",
    listRoute: "/staff",
  })

  const mainContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Staff Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation || ""}
                  onChange={e => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Enter designation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills || ""}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. Drone Pilot, Telemetry"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select
                  value={formData.availability || "available"}
                  onValueChange={value => setFormData({ ...formData, availability: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Input
                  id="project"
                  value={formData.project || ""}
                  onChange={e => setFormData({ ...formData, project: e.target.value })}
                  placeholder="Enter project"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company || ""}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Enter company"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <p className="text-base font-medium">{staff?.name}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Designation</Label>
                <p className="text-base">{staff?.designation}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Skills</Label>
                <p className="text-base">{Array.isArray(staff?.skills) ? staff?.skills.join(", ") : staff?.skills}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                <p className="text-base">{staff?.location}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Availability</Label>
                <Badge className={getAvailabilityColor(staff?.availability!)}>
                  {getAvailabilityIcon(staff?.availability!)} {staff?.availability}
                </Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Project</Label>
                <p className="text-base">{staff?.project}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Company</Label>
                <p className="text-base">{staff?.company}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Certifications</Label>
                <Badge className="w-fit bg-blue-100 text-blue-800">Drone Data Processing Fundamentals- L1</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Placeholder: Assigned Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">Assets</Badge>
            Assigned Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 text-sm">No assets assigned yet.</div>
        </CardContent>
      </Card>
      {/* Placeholder: Tasks/Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-yellow-100 text-yellow-800">Tasks</Badge>
            Tasks / Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 text-sm">No tasks or issues assigned.</div>
        </CardContent>
      </Card>
      {/* Placeholder: Attachments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-gray-100 text-gray-800">Files</Badge>
            Attachments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 text-sm">No attachments uploaded.</div>
        </CardContent>
      </Card>
    </div>
  )

  const sidebarContent = (
    <div className="space-y-6">
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
              {staff?.created_at && new Date(staff.created_at).toLocaleDateString("en-US", {
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
              {staff?.updated_at && new Date(staff.updated_at).toLocaleDateString("en-US", {
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
      {/* Placeholder: Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">Certs</Badge>
            Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 text-sm">No certifications listed.</div>
        </CardContent>
      </Card>
      {/* Placeholder: History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-800">History</Badge>
            Activity History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500 text-sm">No activity history available.</div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <DetailPageLayout
      title={staff?.name || ""}
      subtitle="Staff management"
      backRoute="/staff"
      entityName="Staff"
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
      data={staff}
      mainContent={mainContent}
      sidebarContent={sidebarContent}
      created_at={staff?.created_at}
      updated_at={staff?.updated_at}
    />
  )
} 