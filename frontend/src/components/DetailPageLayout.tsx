import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Save, X, Trash2} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

interface DetailPageLayoutProps {
  title: string
  subtitle?: string
  backRoute: string
  entityName: string
  loading: boolean
  editMode: boolean
  saving: boolean
  deleteDialogOpen: boolean
  onEdit: () => void
  onSave: () => Promise<void>
  onCancel: () => void
  onDelete: () => void
  onDeleteConfirm: () => Promise<void>
  setDeleteDialogOpen: (open: boolean) => void
  data: any
  mainContent: React.ReactNode
  sidebarContent?: React.ReactNode
  created_at?: string
  updated_at?: string
}

// --- Section Config Type ---
type DetailSectionConfig = {
  type: "mainInfo" | "description" | "attachments";
  data?: any;
  render?: () => React.ReactNode; // for custom sections
};

// --- Section Renderer ---
function renderSection(section: DetailSectionConfig) {
  switch (section.type) {
    case "mainInfo":
      // This should be implemented by each entity, so fallback to custom render
      return section.render ? section.render() : null;
    case "description":
      return <DescriptionCard description={section.data?.description} />;
    case "attachments":
      return <AttachmentsCard attachments={section.data?.attachments} />;
    default:
      return section.render ? section.render() : null;
  }
}

// --- Main Layout ---
export function DetailPageLayout(props: DetailPageLayoutProps & {
  mainSections?: DetailSectionConfig[];
  sidebarSections?: DetailSectionConfig[];
}) {
  const navigate = useNavigate()
  const {
    title,
    subtitle,
    backRoute,
    entityName,
    loading,
    editMode,
    saving,
    deleteDialogOpen,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    onDeleteConfirm,
    setDeleteDialogOpen,
    data,
    mainContent,
    sidebarContent,
    mainSections,
    sidebarSections,
    created_at,
    updated_at,
  } = props

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <aside className="w-8">
            <AppSidebar />
          </aside>
          <main className="flex-1 bg-gray-50 overflow-x-auto">
            <div className="container mx-auto p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded mb-4"></div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    )
  }

  if (!data) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <aside className="w-8">
            <AppSidebar />
          </aside>
          <main className="flex-1 bg-gray-50 overflow-x-auto">
            <div className="container mx-auto p-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{entityName} Not Found</h1>
                <p className="text-gray-600 mb-4">The {entityName.toLowerCase()} you're looking for doesn't exist.</p>
                <Button onClick={() => navigate(backRoute)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to {entityName}s
                </Button>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <aside className="w-8">
          <AppSidebar />
        </aside>
        <main className="flex-1 bg-gray-50 overflow-x-auto">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(backRoute)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                  {subtitle && <p className="text-gray-600">{subtitle}</p>}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {editMode ? (
                  <>
                    <Button onClick={onSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outline" onClick={onCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={onDelete}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {mainSections && mainSections.length > 0
                  ? mainSections.map((section, i) => <div key={i}>{renderSection(section)}</div>)
                  : mainContent}
              </div>

              <div className="space-y-6">
                {sidebarSections && sidebarSections.length > 0
                  ? sidebarSections.map((section, i) => <div key={i}>{renderSection(section)}</div>)
                  : sidebarContent}
              </div>
            </div>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete the {entityName.toLowerCase()}.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={onDeleteConfirm} variant="destructive">
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

// --- DescriptionCard ---
export function DescriptionCard({ description }: { description?: string }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="font-semibold mb-2">Description</h2>
      <div className="text-gray-500 italic">{description || "No description provided."}</div>
    </div>
  );
}

// --- AttachmentsCard ---
export function AttachmentsCard({ attachments }: { attachments?: any[] }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="font-semibold mb-2">Attachments</h2>
      <div className="text-gray-500 italic">No attachments uploaded. (Placeholder)</div>
    </div>
  );
} 