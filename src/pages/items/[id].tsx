import { useParams } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  LuPackage as Package,
  LuMapPin as MapPin,
  LuBuilding2 as Building2,
  LuTriangle as AlertTriangle,
  LuCircle as CheckCircle,
  LuClock as Clock,
  LuArrowRightLeft as Transfer,
  LuArrowLeft as Return,
  LuCalendar as Calendar,
} from "react-icons/lu"
import { TransferAssetDialog } from "@/components/TransferAssetDialog"
import { useLocationsData } from "@/hooks/useApiData"
import { useAuth } from "@/context/AuthContext"
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
  // Transfer tracking fields
  home_location?: string
  current_location?: string
  is_transferred?: boolean
  transferred_to?: string
  transfer_date?: string
  expected_return_date?: string
  transfer_notes?: string
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
  const { token } = useAuth();
  const { data: locations } = useLocationsData(token || undefined);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  
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
      {/* Transfer Status Alert */}
      {component?.is_transferred && (
        <Card className="border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-orange-500 p-2 animate-pulse">
                  <Transfer className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1 flex items-center gap-2">
                    Asset Currently Transferred
                    <span className="inline-flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                  </h3>
                  <div className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                    <p className="flex items-center gap-2">
                      <strong>From:</strong> {component.home_location} 
                      <span className="text-orange-500">→</span> 
                      <strong>To:</strong> {component.current_location || component.transferred_to}
                    </p>
                    {component.transfer_date && (
                      <p>
                        <strong>Transfer Date:</strong> {new Date(component.transfer_date).toLocaleDateString()}
                      </p>
                    )}
                    {component.expected_return_date && (
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <strong>Expected Return:</strong> {new Date(component.expected_return_date).toLocaleDateString()}
                      </p>
                    )}
                    {component.transfer_notes && (
                      <p>
                        <strong>Notes:</strong> {component.transfer_notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setTransferDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700 shadow-md"
              >
                <Return className="w-4 h-4 mr-2" />
                Return Asset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Component Details
            </div>
            {!component?.is_transferred && !editMode && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTransferDialogOpen(true)}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Transfer className="w-4 h-4 mr-2" />
                Transfer Asset
              </Button>
            )}
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
                <Label className="text-sm font-medium text-muted-foreground">
                  {component?.is_transferred ? "Current Location" : "Location"}
                </Label>
                <div className={`flex items-center gap-2 ${component?.is_transferred ? 'p-3 bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500 rounded-md' : ''}`}>
                  <MapPin className={`h-4 w-4 ${component?.is_transferred ? 'text-orange-500 animate-pulse' : 'text-muted-foreground'}`} />
                  <span className={`text-base font-medium ${component?.is_transferred ? 'text-orange-700 dark:text-orange-400' : ''}`}>
                    {component?.current_location || component?.location}
                  </span>
                  {component?.is_transferred && (
                    <Badge variant="default" className="bg-orange-500 text-white ml-2 animate-pulse">
                      <Transfer className="w-3 h-3 mr-1" />
                      Transferred
                    </Badge>
                  )}
                </div>
              </div>
              {component?.is_transferred && component?.home_location && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-muted-foreground">Home Location</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/20 border-l-4 border-gray-400 rounded-md">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-base text-gray-700 dark:text-gray-300">{component.home_location}</span>
                  </div>
                </div>
              )}
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
          <div className="w-32 h-32 bg-muted rounded flex items-center justify-center text-muted-foreground">Image Placeholder</div>
        </CardContent>
      </Card>
      {/* Maintenance History */}
      <Card>
        <CardHeader><CardTitle>Maintenance History</CardTitle></CardHeader>
        <CardContent>
          <ul className="text-muted-foreground space-y-1">
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
          <div className="text-muted-foreground italic">No linked projects or locations. (Placeholder)</div>
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
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground">S</div>
                <div className="text-xs mt-1 text-muted-foreground">Staff Name</div>
              </div>
            ))}
            <div className="text-muted-foreground ml-4">(Placeholder staff)</div>
          </div>
        </CardContent>
      </Card>
      {/* Warranty Provider/Contact */}
      <Card>
        <CardHeader><CardTitle>Warranty Provider / Contact</CardTitle></CardHeader>
        <CardContent>
          <div className="text-muted-foreground italic">No warranty provider info. (Placeholder)</div>
        </CardContent>
      </Card>
      {/* Replacement Parts List */}
      <Card>
        <CardHeader><CardTitle>Replacement Parts List</CardTitle></CardHeader>
        <CardContent>
          <ul className="text-muted-foreground space-y-1">
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
          <div className="text-muted-foreground italic">No attachments uploaded. (Placeholder)</div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <>
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
      
      {component && (
        <TransferAssetDialog
          open={transferDialogOpen}
          onClose={() => setTransferDialogOpen(false)}
          assetId={component.id}
          assetName={component.name}
          currentLocation={component.current_location || component.location}
          homeLocation={component.home_location || component.location}
          isTransferred={component.is_transferred || false}
          locations={(locations as Array<{ name: string }>) || []}
          onTransferComplete={() => {
            // Refresh the component data
            window.location.reload();
          }}
          token={token || undefined}
        />
      )}
    </>
  )
}

export default function ItemDetailPage() {
  return (
    <ProtectedRoute>
      <ComponentDetail />
    </ProtectedRoute>
  );
} 