"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation";
import { BaseLayout } from "@/components/BaseLayout"
import { UnifiedHeader } from "@/components/UnifiedHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion} from "framer-motion"
import {
  LuMapPin as MapPin,
  LuFolderOpen as FolderOpen,
  LuHash as Hash,
  LuPackage as Package,
  LuArrowRightLeft as Transfer,
} from "react-icons/lu"
import { useAuth } from "@/context/AuthContext"
import { componentStatusConfig } from "@/utils/statusColors"

import SearchFilterTabs from "@/components/SearchFilterTabs"
import { useComponentsData, useLocationsData } from "@/hooks/useApiData"
import { useComponentsCrud } from "@/hooks/useCrud"
import { useModal, useConfirm } from "@/hooks/useModal"
import { AlertDialog } from '@/components/ui/AlertDialog'
import { useConfirmation } from "@/hooks/useConfirmation"
import { EntityModal } from '@/components/EntityModal'
import { toast } from 'sonner'
import ProtectedRoute from '@/components/ProtectedRoute';
import type { FieldConfig } from '@/components/EntityModal';

interface TableData {
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
  updated_at?: string
  // Transfer tracking fields
  home_location?: string
  current_location?: string
  is_transferred?: boolean
  transferred_to?: string
  transfer_date?: string
  expected_return_date?: string
  transfer_notes?: string
}

const Components: React.FC = () => {
  const { token } = useAuth()
  const router = useRouter()
  const { data: apiComponents, loading, refetch } = useComponentsData(token || undefined)
  const { data: locations } = useLocationsData(token || undefined)
  const { create, update } = useComponentsCrud(token || undefined)
  const [components, setComponents] = useState<TableData[]>([])
  const [search, setSearch] = useState("")
  const [selectedOwner, setSelectedOwner] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedTransferStatus, setSelectedTransferStatus] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState<string>("all")
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  // Modal management
  const addModal = useModal();
  const confirmDialog = useConfirm();
  const { confirmCreate, confirmUpdate } = useConfirmation();
  
  // Create location options from available locations
  const locationOptions = useMemo(() => {
    if (!locations || !Array.isArray(locations)) return [];
    
    return locations
      .filter((loc): loc is { name: string } => typeof loc === 'object' && loc !== null && 'name' in loc)
      .map(location => ({
        value: location.name,
        label: location.name
      }));
  }, [locations]);

  // Memoize editing component and stable initial values
  const editingComponent = useMemo(() => 
    isEditing && editingId ? components.find(c => c.id === editingId) : undefined, 
    [isEditing, editingId, components]
  );
  
  const stableInitialValues = useMemo(() => {
    if (!editingComponent) return undefined;
    // Create a stable object reference to prevent unnecessary re-renders
    return {
      name: editingComponent.name || "",
      category: editingComponent.category || "Drones",
      status: editingComponent.status || "Active",
      location: editingComponent.location || "Headquarters",
      project: editingComponent.project || "",
      owner: editingComponent.owner || "IIDT",
      description: editingComponent.description || "",
      serial_number: editingComponent.serial_number || "",
      purchase_date: editingComponent.purchase_date || new Date().toISOString().split('T')[0],
      warranty_expiry: editingComponent.warranty_expiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  }, [editingComponent]);

  // Set components from API data
  useEffect(() => {
    setComponents(apiComponents as TableData[] || [])
  }, [apiComponents])

  // Handle URL query parameters for filters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const category = urlParams.get('category');
      const subcategory = urlParams.get('subcategory');
      
      if (category) {
        setSelectedCategory(category);
      }
      if (subcategory) {
        setSearch(subcategory); // Set search to filter by subcategory
        toast.info(`Filtering by: ${subcategory}`);
      }
    }
  }, [router])

  // Filter and search logic
  const filteredComponents = useMemo(() => {
    return components.filter((item: TableData) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.project.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.current_location?.toLowerCase().includes(search.toLowerCase()) ||
        item.home_location?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())

      const matchesOwner = selectedOwner === "all" || item.owner === selectedOwner
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus
      const matchesTransferStatus = 
        selectedTransferStatus === "all" || 
        (selectedTransferStatus === "transferred" && item.is_transferred) ||
        (selectedTransferStatus === "not_transferred" && !item.is_transferred)

      return matchesSearch && matchesOwner && matchesCategory && matchesStatus && matchesTransferStatus
    })
  }, [components, search, selectedOwner, selectedCategory, selectedStatus, selectedTransferStatus])

  // Get unique values for filters
  // Custom owner order: PSSL first, then others
  const owners = useMemo(() => {
    const ownerOrder = ["PSSL"];
    const uniqueOwners = Array.from(new Set(components.map((item) => item.owner)));
    // Place PSSL first, then the rest in their original order (excluding PSSL if present)
    const ordered = ownerOrder.filter(owner => uniqueOwners.includes(owner));
    const extras = uniqueOwners.filter(owner => !ownerOrder.includes(owner));
    return [...ordered, ...extras];
  }, [components]);
  const categories = useMemo(() => Array.from(new Set(components.map((item) => item.category))), [components])
  const statuses = useMemo(() => Array.from(new Set(components.map((item) => item.status))), [components])

  // Group by owner for tabs
  const groupedByOwner = useMemo(() => {
    const result: Record<string, TableData[]> = {}
    owners.forEach((owner) => {
      result[owner] = filteredComponents.filter((item) => item.owner === owner)
    })
    return result
  }, [owners, filteredComponents])

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Category', 'Status', 'Location', 'Project', 'Owner', 'Description', 'Serial Number', 'Purchase Date', 'Warranty Expiry'],
      ...components.map(item => [
        item.name,
        item.category,
        item.status,
        item.location,
        item.project,
        item.owner,
        item.description || '',
        item.serial_number || '',
        item.purchase_date || '',
        item.warranty_expiry || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `components_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Components exported successfully');
  };
  
  const handleAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    addModal.open();
  };

  // Modal field configuration
  const modalFields: FieldConfig[] = useMemo(() => [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter component name" },
    { name: "category", label: "Category", type: "select", required: true, options: [
      { value: "Drones", label: "Drones" },
      { value: "Sensors", label: "Sensors" },
      { value: "Cameras", label: "Cameras" },
      { value: "Controllers", label: "Controllers" },
      { value: "Batteries", label: "Batteries" },
      { value: "Other", label: "Other" }
    ]},
    { name: "status", label: "Status", type: "select", required: true, options: [
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
      { value: "Maintenance", label: "Maintenance" },
      { value: "Retired", label: "Retired" }
    ]},
    { name: "location", label: "Location", type: "select", required: true, options: locationOptions },
    { name: "project", label: "Project", type: "text", required: true, placeholder: "Enter project name" },
    { name: "owner", label: "Owner", type: "select", required: true, options: [
      { value: "IIDT", label: "IIDT" },
      { value: "Prakhar Aviation", label: "Prakhar Aviation" },
      { value: "PSSL", label: "PSSL" }
    ]},
    { name: "description", label: "Description", type: "textarea", placeholder: "Enter component description" },
    { name: "serial_number", label: "Serial Number", type: "text", required: true, placeholder: "Enter serial number" },
    { name: "purchase_date", label: "Purchase Date", type: "date" },
    { name: "warranty_expiry", label: "Warranty Expiry", type: "date" }
  ], [locationOptions]);

  const handleModalSubmit = async (data: Record<string, unknown>) => {
    try {
      if (isEditing && editingId) {
        // Show confirmation for update
        const confirmed = await confirmUpdate('component', editingComponent?.name);
        if (!confirmed) {
          return false;
        }
        await update(editingId, data);
        toast.success('Component updated successfully');
        addModal.close();
        setIsEditing(false);
        setEditingId(null);
        await refetch();
        return true;
      } else {
        // Show confirmation for create
        const confirmed = await confirmCreate('component');
        if (!confirmed) {
          return false;
        }
        await create(data);
        toast.success('Component created successfully');
        addModal.close();
        setIsEditing(false);
        setEditingId(null);
        await refetch();
        return true;
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save component');
      return false;
    }
  };

  const ComponentCard: React.FC<{ item: TableData }> = ({ item }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm hover:shadow-md">
        <CardContent className="p-6 cursor-pointer" onClick={() => router.push(`/items/${item.id}`)}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {item.description || "No description available"}
              </p>
            </div>

          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`${componentStatusConfig[item.status as keyof typeof componentStatusConfig]?.color} border`}
                >
                  <span className="mr-1">{componentStatusConfig[item.status as keyof typeof componentStatusConfig]?.icon}</span>
                  {item.status}
                </Badge>
                {item.is_transferred && (
                  <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 text-white border-0">
                    <Transfer className="w-3 h-3 mr-1" />
                    Transferred
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className={`w-4 h-4 ${item.is_transferred ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className="truncate font-medium">{item.current_location || item.location}</span>
              </div>
              {item.is_transferred && item.home_location && (
                <div className="flex items-center gap-2 text-xs text-gray-500 ml-6">
                  <span>Home: {item.home_location}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FolderOpen className="w-4 h-4 text-gray-400" />
              <span className="truncate">{item.project}</span>
            </div>

            {item.serial_number && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="font-mono text-xs">{item.serial_number}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const ComponentListItem: React.FC<{ item: TableData }> = ({ item }) => (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-sm transition-all duration-200 border-0 shadow-none hover:bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={`${componentStatusConfig[item.status as keyof typeof componentStatusConfig]?.color} border text-xs`}
                  >
                    {componentStatusConfig[item.status as keyof typeof componentStatusConfig]?.icon} {item.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className={`w-3 h-3 ${item.is_transferred ? 'text-orange-500' : ''}`} />
                    {item.current_location || item.location}
                    {item.is_transferred && item.home_location && (
                      <span className="text-xs text-gray-400 ml-1">(from {item.home_location})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" />
                    {item.project}
                  </div>
                  {item.serial_number && (
                    <div className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      <span className="font-mono text-xs">{item.serial_number}</span>
                    </div>
                  )}
                  {item.is_transferred && (
                    <Badge variant="default" className="bg-orange-500 text-white text-xs">
                      <Transfer className="w-3 h-3 mr-1" />
                      Transferred
                    </Badge>
                  )}
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Add a CategorySubheader component
  const CategorySubheader: React.FC<{ category: string }> = ({ category }) => (
    <div className="mb-2">
      <Card className="bg-gray-50 border-blue-200 border flex items-center px-6 py-3">
        <span className="font-semibold text-blue-700 text-lg">{category}</span>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <BaseLayout loading={true}>
        <div></div>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout className="p-8">
          <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header */}
        <UnifiedHeader
              title="Items"
              breadcrumbs={[
                { label: "Inventory", href: "/items" },
                { label: "All Items" }
              ]}
              onAdd={handleAdd}
              onExport={handleExport}
              addLabel="Add Item"
              exportLabel="Export"
            />

            {/* Search and Filters */}
        <SearchFilterTabs
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search items, projects, locations..."
          filters={[
            {
              key: "category",
              label: "Category",
              value: selectedCategory,
              options: [
                { value: "all", label: "All Categories" },
                ...categories.map((category) => ({ value: category, label: category }))
              ],
              onValueChange: (value: string) => setSelectedCategory(value)
            },
            {
              key: "status",
              label: "Status",
              value: selectedStatus,
              options: [
                { value: "all", label: "All Status" },
                ...statuses.map((status) => ({ value: status, label: status }))
              ],
              onValueChange: (value: string) => setSelectedStatus(value)
            },
            {
              key: "transfer",
              label: "Transfer Status",
              value: selectedTransferStatus,
              options: [
                { value: "all", label: "All Items" },
                { value: "transferred", label: "🔄 Transferred Only" },
                { value: "not_transferred", label: "📍 At Home Location" }
              ],
              onValueChange: (value: string) => setSelectedTransferStatus(value)
            }
          ]}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={true}
          owners={owners}
          groupedByOwner={groupedByOwner}
          renderGridItem={() => null}
          renderListItem={() => null}
          emptyStateIcon={<Package className="w-12 h-12 text-gray-400" />}
          emptyStateTitle="No items found"
          emptyStateDescription={
            search || selectedCategory !== "all" || selectedStatus !== "all" || selectedTransferStatus !== "all"
              ? "Try adjusting your search or filters"
              : `No items available for this owner`
          }
          gridCols="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          totalCount={components.length}
          filteredCount={filteredComponents.length}
          itemLabel="items"
          allItems={filteredComponents}
          activeTab={activeTab}
          onTabChange={(tab: string) => {
            setActiveTab(tab);
            setSelectedOwner(tab);
          }}
          onClearFilters={() => {
            setSearch("");
            setSelectedOwner("all");
            setSelectedCategory("all");
            setSelectedStatus("all");
            setSelectedTransferStatus("all");
            setActiveTab("all");
          }}
        />

        {/* After SearchFilterTabs: */}
        {
          categories.map((category) => {
            const itemsInCategory = filteredComponents.filter((item) => item.category === category);
            if (itemsInCategory.length === 0) return null;
            return (
              <div key={category}>
                <CategorySubheader category={category} />
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-2'}>
                  {itemsInCategory.map((item) =>
                    viewMode === 'grid' ? (
                      <ComponentCard key={item.id} item={item} />
                    ) : (
                      <ComponentListItem key={item.id} item={item} />
                    )
                  )}
                </div>
              </div>
            );
          })
        }
      </div>
      <EntityModal
        open={addModal.isOpen}
        onClose={addModal.close}
        title={isEditing ? "Edit Item" : "Add New Item"}
        buttonText={isEditing ? "Update Item" : "Add Item"}
        fields={modalFields}
        onSubmit={handleModalSubmit}
        initialValues={stableInitialValues}
      />
      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={() => confirmDialog.close()}
        title={confirmDialog.title}
        description={confirmDialog.message}
        onConfirm={confirmDialog.close}
        confirmLabel={confirmDialog.confirmText}
        cancelLabel={confirmDialog.cancelText}
      />
    </BaseLayout>
  )
}

export default function ItemsPage() {
  return (
    <ProtectedRoute>
      <Components />
    </ProtectedRoute>
  );
}
