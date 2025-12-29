import { useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LuPackage as Package,
  LuMapPin as MapPin,
  LuBuilding2 as Building2,
  LuTriangle as AlertTriangle,
  LuCircle as CheckCircle,
  LuClock as Clock,
} from "react-icons/lu"
import { useDetailPage } from "../../hooks/useDetailPage"
import { DetailPageLayout } from "../../components/DetailPageLayout"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import ProtectedRoute from '../../components/ProtectedRoute';
import { API_BASE_URL, API_ENDPOINTS } from "../../config";

interface Component {
  id: number
  name: string
  category: string
  status: string
  location: string
  project: string
  owner: string
  description?: string
  serial_number?: string
  purchase_date?: string
  warranty_expiry?: string
  created_at: string
  updated_at: string
}

interface ComponentUpdate {
  name?: string
  category?: string
  status?: string
  location?: string
  project?: string
  owner?: string
  description?: string
  serial_number?: string
  purchase_date?: string
  warranty_expiry?: string
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "maintenance", label: "Maintenance" },
  { value: "idle", label: "Idle" },
]

const categoryOptions = [
  { value: "hardware", label: "Hardware" },
  { value: "software", label: "Software" },
  { value: "network", label: "Network" },
  { value: "peripheral", label: "Peripheral" },
]

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dotColor: "bg-emerald-500",
      }
    case "maintenance":
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        color: "bg-amber-50 text-amber-700 border-amber-200",
        dotColor: "bg-amber-500",
      }
    case "idle":
      return {
        icon: <Clock className="h-4 w-4" />,
        color: "bg-slate-50 text-slate-700 border-slate-200",
        dotColor: "bg-slate-500",
      }
    default:
      return {
        icon: <Clock className="h-4 w-4" />,
        color: "bg-slate-50 text-slate-700 border-slate-200",
        dotColor: "bg-slate-500",
      }
  }
}

const getOwnerInitials = (name: string) => {
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function ComponentDetail() {
  const params = useParams<{ id: string }>();
  const componentId = params?.id || '';
  const {
    data: component,
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
  } = useDetailPage<Component, ComponentUpdate>({
    id: componentId,
    apiEndpoint: `${API_BASE_URL}${API_ENDPOINTS.COMPONENTS}`,
    entityName: "Component",
    listRoute: "/items",
  })

  const mainContent = (
    <div className="flex flex-col gap-6">
      {/* Component Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Component Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Component Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter component name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category || "hardware"}
                  onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || "active"}
                  onValueChange={(value: string) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Input
                  id="owner"
                  value={formData.owner || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="Enter owner name"
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
                <Label htmlFor="project">Project</Label>
                <Input
                  id="project"
                  value={formData.project || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, project: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="Enter serial number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
                <Input
                  id="warranty_expiry"
                  type="date"
                  value={formData.warranty_expiry || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter component description"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Component Name</Label>
                <p className="text-base font-medium">{component?.name}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                <Badge variant="outline">{component?.category}</Badge>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                {component?.status && (
                  <Badge className={getStatusConfig(component.status).color}>
                    {getStatusConfig(component.status).icon} {component.status}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Owner</Label>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {component?.owner ? getOwnerInitials(component.owner) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-base font-medium">{component?.owner}</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-base font-medium">{component?.location}</span>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Project</Label>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-base font-medium">{component?.project}</span>
                </div>
              </div>
              {component?.serial_number && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Serial Number</Label>
                  <p className="text-base font-mono">{component.serial_number}</p>
                </div>
              )}
              {component?.purchase_date && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Purchase Date</Label>
                  <p className="text-base">{new Date(component.purchase_date).toLocaleDateString()}</p>
                </div>
              )}
              {component?.warranty_expiry && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Warranty Expiry</Label>
                  <p className="text-base">{new Date(component.warranty_expiry).toLocaleDateString()}</p>
                </div>
              )}
              {component?.description && (
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-base">{component.description}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Component Image/Photo */}
      <Card>
        <CardHeader><CardTitle>Component Image</CardTitle></CardHeader>
        <CardContent>
          <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400">Image Placeholder</div>
        </CardContent>
      </Card>
      {/* Maintenance History */}
      <Card>
        <CardHeader><CardTitle>Maintenance History</CardTitle></CardHeader>
        <CardContent>
          <ul className="text-gray-500 space-y-1">
            <li>2024-01-10: Routine check (Placeholder)</li>
            <li>2023-12-01: Battery replaced (Placeholder)</li>
            <li>2023-10-15: Firmware update (Placeholder)</li>
          </ul>
        </CardContent>
      </Card>
      {/* Component Usage Stats */}
      <Card>
        <CardHeader><CardTitle>Component Usage Stats</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span>Hours Used</span>
              <span className="font-semibold text-blue-600">0 (Placeholder)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cycles</span>
              <span className="font-semibold text-green-600">0 (Placeholder)</span>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Linked Projects/Locations */}
      <Card>
        <CardHeader><CardTitle>Linked Projects / Locations</CardTitle></CardHeader>
        <CardContent>
          <div className="text-gray-500 italic">No linked projects or locations. (Placeholder)</div>
        </CardContent>
      </Card>
    </div>
  )

  const sidebarContent = (
    <div className="space-y-6">
      {/* Assigned Staff */}
      <Card>
        <CardHeader><CardTitle>Assigned Staff</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-nowrap overflow-x-auto scrollbar-hide py-2">
            {[1,2,3].map(i => (
              <div key={i} className="flex flex-col items-center flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">S</div>
                <div className="text-xs mt-1 text-gray-600">Staff Name</div>
              </div>
            ))}
            <div className="text-gray-400 ml-4">(Placeholder staff)</div>
          </div>
        </CardContent>
      </Card>
      {/* Warranty Provider/Contact */}
      <Card>
        <CardHeader><CardTitle>Warranty Provider / Contact</CardTitle></CardHeader>
        <CardContent>
          <div className="text-gray-500 italic">No warranty provider info. (Placeholder)</div>
        </CardContent>
      </Card>
      {/* Replacement Parts List */}
      <Card>
        <CardHeader><CardTitle>Replacement Parts List</CardTitle></CardHeader>
        <CardContent>
          <ul className="text-gray-500 space-y-1">
            <li>Battery (Placeholder)</li>
            <li>Propeller (Placeholder)</li>
            <li>Sensor (Placeholder)</li>
          </ul>
        </CardContent>
      </Card>
      {/* Attachments (Manuals, Datasheets) */}
      <Card>
        <CardHeader><CardTitle>Attachments</CardTitle></CardHeader>
        <CardContent>
          <div className="text-gray-500 italic">No attachments uploaded. (Placeholder)</div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <DetailPageLayout
      title={component?.name || ""}
      subtitle="Item management"
      backRoute="/items"
      entityName="Item"
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
      data={component}
      mainContent={<div className="w-full px-0 lg:px-4">{mainContent}</div>}
      sidebarContent={sidebarContent}
    />
  )
}

export default function ItemDetailPage() {
  return (
    <ProtectedRoute>
      <ComponentDetail />
    </ProtectedRoute>
  );
} 