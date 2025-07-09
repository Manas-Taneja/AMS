import { useParams } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Users, Building2 } from "lucide-react"
import { useDetailPage } from "../hooks/useDetailPage"
import { DetailPageLayout } from "../components/DetailPageLayout"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

interface Location {
  id: number
  name: string
  address: string
  team: number
  manager: string
  project: string
  created_at: string
  updated_at: string
}

interface LocationUpdate {
  name?: string
  address?: string
  team?: number
  manager?: string
  project?: string
}

export default function LocationDetail() {
  const { id } = useParams<{ id: string }>()
  const {
    data: location,
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
  } = useDetailPage<Location, LocationUpdate>({
    id: id!,
    apiEndpoint: "http://localhost:8000/api/locations",
    entityName: "Location",
    listRoute: "/locations",
  })

  const mainContent = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Location Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter location name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Manager</Label>
              <Input
                id="manager"
                value={formData.manager || ""}
                onChange={e => setFormData({ ...formData, manager: e.target.value })}
                placeholder="Enter manager name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team">Team Size</Label>
              <Input
                id="team"
                type="number"
                value={formData.team ?? 0}
                onChange={e => setFormData({ ...formData, team: Number(e.target.value) })}
                placeholder="Enter team size"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Input
                id="project"
                value={formData.project || ""}
                onChange={e => setFormData({ ...formData, project: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address || ""}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter full address"
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Location Name</Label>
              <p className="text-base font-medium">{location?.name}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Manager</Label>
              <p className="text-base font-medium">{location?.manager}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Team Size</Label>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-base font-medium">{location?.team} members</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Project</Label>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-base font-medium">{location?.project}</span>
              </div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Address</Label>
              <p className="text-base whitespace-pre-line">{location?.address}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <DetailPageLayout
      title={location?.name || ""}
      subtitle="Location management"
      backRoute="/location"
      entityName="Location"
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
      data={location}
      mainContent={mainContent}
      created_at={location?.created_at}
      updated_at={location?.updated_at}
    />
  )
}