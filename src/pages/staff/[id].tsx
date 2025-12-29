import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  LuUser as User,
  LuCircle as CheckCircle,
  LuClock as Clock,
  LuCircle as XCircle,
} from "react-icons/lu"
import { useDetailPage } from "../../hooks/useDetailPage"
import { DetailPageLayout } from "../../components/DetailPageLayout"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import ProtectedRoute from '../../components/ProtectedRoute';
import { API_BASE_URL, API_ENDPOINTS } from "../../config";

interface Staff {
  id: number
  name: string
  email: string
  phone: string
  designation: string
  skills: string[] | string
  location: string
  availability: string
  project: string
  company: string
  experience: string
  joinDate: string
  created_at: string
  updated_at: string
}

interface StaffUpdate {
  name?: string
  email?: string
  phone?: string
  designation?: string
  skills?: string
  location?: string
  availability?: string
  project?: string
  company?: string
  experience?: string
  joinDate?: string
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

function StaffDetail() {
  const params = useParams<{ id: string }>();
  const staffId = params?.id || '';
  
  // Transform function to handle wrapped API response
  const transformData = (responseData: unknown): Staff => {
    if (typeof responseData === 'object' && responseData !== null) {
      const res = responseData as { success?: boolean; data?: unknown };
      if (res.success && res.data) {
        return res.data as Staff;
      }
    }
    return responseData as Staff;
  };
  
  const detailPage = useDetailPage<Staff, StaffUpdate>({
    id: staffId,
    apiEndpoint: `${API_BASE_URL}${API_ENDPOINTS.STAFF}`,
    entityName: "Staff",
    listRoute: "/staff",
    transformData,
  });
  if (!staffId) {
    return null; // Or a loading spinner/message if desired
  }
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
  } = detailPage;

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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
                {formData.email && !formData.email.includes('@') && (
                  <p className="text-red-500 text-sm mt-1">Invalid email</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    // Allow: backspace, delete, tab, escape, enter, and navigation keys
                    if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode) ||
                        // Allow: numbers, space, dash, parentheses, plus sign
                        /[\d\s\-\(\)\+]/.test(e.key)) {
                      return;
                    }
                    // Prevent all other keys
                    e.preventDefault();
                  }}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    // Additional validation to ensure only valid characters
                    const phoneRegex = /^[\d\s\-\(\)\+]*$/;
                    if (phoneRegex.test(value) || value === '') {
                      setFormData({ ...formData, phone: value });
                    }
                  }}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="Enter designation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (years)</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experience || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="Enter years of experience"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Join Date</Label>
                <Input
                  id="joinDate"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.joinDate || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, joinDate: e.target.value })}
                  placeholder="Enter join date"
                />
                {formData.joinDate && new Date(formData.joinDate) > new Date() && (
                  <p className="text-red-500 text-sm mt-1">Join date cannot be in the future</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input
                  id="skills"
                  value={formData.skills || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. Drone Pilot, Telemetry"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Select
                  value={formData.availability || "available"}
                  onValueChange={(value: string) => setFormData({ ...formData, availability: value })}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, project: e.target.value })}
                  placeholder="Enter project"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Select
                  value={formData.company || ""}
                  onValueChange={(value: string) => setFormData({ ...formData, company: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PSSL">PSSL</SelectItem>
                    <SelectItem value="Prakhar Aviation">Prakhar Aviation</SelectItem>
                    <SelectItem value="IIDT">IIDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <p className="text-base font-medium">{staff?.name}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-base">{staff?.email}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                <p className="text-base">{staff?.phone}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Designation</Label>
                <p className="text-base">{staff?.designation}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Experience</Label>
                <p className="text-base">{staff?.experience}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Join Date</Label>
                <p className="text-base">{staff?.joinDate}</p>
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
                <Badge className={getAvailabilityColor(staff?.availability || 'unknown')}>
                  {getAvailabilityIcon(staff?.availability || 'unknown')} {staff?.availability || 'unknown'}
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
    />
  )
}

export default function StaffDetailPage() {
  return (
    <ProtectedRoute>
      <StaffDetail />
    </ProtectedRoute>
  );
} 