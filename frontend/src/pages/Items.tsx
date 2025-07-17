"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BaseLayout } from "../components/BaseLayout"
import { UnifiedHeader } from "../components/UnifiedHeader"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { motion} from "framer-motion"
import { MapPin, FolderOpen, Hash, Package, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { componentStatusConfig } from "../utils/statusColors"
import { RoleBasedComponent, ManagerOrAdmin } from "../components/RoleBasedComponent"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import SearchFilterTabs from "../components/SearchFilterTabs"
import { useComponentsData } from "../hooks/useApiData"
import { useComponentsCrud } from "../hooks/useCrud"
import { useForm, validationRules } from "../hooks/useForm"
import { useModal } from "../hooks/useModal"

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
}

interface ComponentFormData {
  name: string;
  category: string;
  status: string;
  location: string;
  project: string;
  owner: string;
  description: string;
  serial_number: string;
  purchase_date: string;
  warranty_expiry: string;
  [key: string]: string | number | boolean | string[] | undefined;
}

const Components: React.FC = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const { data: apiComponents, loading, error, refetch } = useComponentsData(token || undefined)
  const { remove } = useComponentsCrud(token || undefined)
  const [components, setComponents] = useState<TableData[]>([])
  const [search, setSearch] = useState("")
  const [selectedOwner, setSelectedOwner] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState<string>("all")
  
  // Modal management
  const addModal = useModal();
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form management
  const form = useForm<ComponentFormData>({
    initialData: {
      name: "",
      category: "Drones",
      status: "Active",
      location: "Headquarters",
      project: "",
      owner: "IIDT",
      description: "",
      serial_number: "",
      purchase_date: new Date().toISOString().split('T')[0] || "",
      warranty_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || "", // 1 year from now
    },
    validationRules: [
      validationRules.required("name"),
      validationRules.required("category"),
      validationRules.required("status"),
      validationRules.required("location"),
      validationRules.required("project"),
      validationRules.required("owner"),
      validationRules.required("serial_number"),
    ],
    onSubmit: async (formData) => {
      // TODO: Implement create/update logic when API is ready
      console.log("Form submitted:", formData);
      addModal.close();
      setEditMode(false);
      setEditingId(null);
      form.reset();
      refetch();
    },
  });

  // Combine API data with hardcoded items
  useEffect(() => {
    // Add hardcoded items with different owners
    const hardcodedItems: TableData[] = [
      {
        id: 1001,
        name: "DJI Mavic 3 Pro",
        category: "Drones",
        status: "Active",
        location: "Headquarters",
        project: "Aerial Survey",
        owner: "PSSL",
        description: "Professional drone for aerial photography and mapping",
        serial_number: "DJIM3P-PSSL-001",
        purchase_date: "2024-01-15",
        warranty_expiry: "2026-01-15",
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z",
      },
      {
        id: 1002,
        name: "Thermal Imaging Camera",
        category: "Sensors",
        status: "Idle",
        location: "Branch Office A",
        project: "Search and Rescue",
        owner: "IIDT",
        description: "High-resolution thermal imaging camera for night operations",
        serial_number: "THCAM-IIDT-002",
        purchase_date: "2024-02-20",
        warranty_expiry: "2026-02-20",
        created_at: "2024-02-20T14:30:00Z",
        updated_at: "2024-02-20T14:30:00Z",
      },
      {
        id: 1003,
        name: "RTK GPS Module",
        category: "Navigation",
        status: "Active",
        location: "Data Center",
        project: "Precision Agriculture",
        owner: "IIDT",
        description: "Real-time kinematic GPS for centimeter accuracy positioning",
        serial_number: "RTKGPS-IIDT-003",
        purchase_date: "2024-03-10",
        warranty_expiry: "2026-03-10",
        created_at: "2024-03-10T09:15:00Z",
        updated_at: "2024-03-10T09:15:00Z",
      },
    ]

    setComponents([...(apiComponents as TableData[]), ...hardcodedItems])
  }, [apiComponents])

  // Filter and search logic
  const filteredComponents = useMemo(() => {
    return components.filter((item: TableData) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.project.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())

      const matchesOwner = selectedOwner === "all" || item.owner === selectedOwner
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || item.status === selectedStatus

      return matchesSearch && matchesOwner && matchesCategory && matchesStatus
    })
  }, [components, search, selectedOwner, selectedCategory, selectedStatus])

  // Get unique values for filters
  // Custom owner order: PSSL first, then others
  const ownerOrder = ["PSSL"];
  const owners = useMemo(() => {
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

  const handleAdd = () => {
    setEditMode(false);
    setEditingId(null);
    form.reset();
    addModal.open();
  }
  
  const handleExport = () => alert("Export clicked")
  
  const handleEdit = async (id: number) => {
    const component = components.find(c => c.id === id);
    if (!component) return;
    setEditMode(true);
    setEditingId(id);
    form.setFieldValue("name", component.name);
    form.setFieldValue("category", component.category);
    form.setFieldValue("status", component.status);
    form.setFieldValue("location", component.location);
    form.setFieldValue("project", component.project);
    form.setFieldValue("owner", component.owner);
    form.setFieldValue("description", component.description || "");
    form.setFieldValue("serial_number", component.serial_number || "");
    form.setFieldValue("purchase_date", component.purchase_date || "");
    form.setFieldValue("warranty_expiry", component.warranty_expiry || "");
    addModal.open();
  }
  
  const handleModalSubmit = async (data: Record<string, any>) => {
    // Update form data with modal data
    Object.entries(data).forEach(([key, value]) => {
      form.setFieldValue(key as keyof ComponentFormData, value);
    });
    // Submit the form
    await form.handleSubmit();
  };
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await remove(id);
        refetch();
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  }

  const ComponentCard = ({ item }: { item: TableData }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm hover:shadow-md">
        <CardContent className="p-6 cursor-pointer" onClick={() => navigate(`/items/${item.id}`)}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {item.description || "No description available"}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
                  className="focus:!ring-0"
            >
                  <MoreHorizontal className="w-4 h-4" />
            </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white">
                <ManagerOrAdmin>
                  <DropdownMenuItem className="cursor-pointer" onClick={(e) => {
                    e.preventDefault()
                    handleEdit(item.id)
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </ManagerOrAdmin>
                <RoleBasedComponent allowedRoles={['admin']}>
                  <DropdownMenuItem onClick={(e) => {
                    e.preventDefault()
                    handleDelete(item.id)
                  }} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </RoleBasedComponent>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge
                variant="secondary"
                className={`${componentStatusConfig[item.status as keyof typeof componentStatusConfig]?.color} border`}
              >
                <span className="mr-1">{componentStatusConfig[item.status as keyof typeof componentStatusConfig]?.icon}</span>
                {item.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
              <FolderOpen className="w-4 h-4 text-gray-400" />{item.project}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="truncate">{item.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-gray-400" />
                <span className="truncate">{item.project}</span>
              </div>
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

  const ComponentListItem = ({ item }: { item: TableData }) => (
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
                    <MapPin className="w-3 h-3" />
                    {item.location}
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
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
                  <MoreHorizontal className="w-4 h-4" />
            </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <ManagerOrAdmin>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(item.id)
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </ManagerOrAdmin>
                <RoleBasedComponent allowedRoles={['admin']}>
                  <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={(e) => {
                    e.preventDefault()
                    handleDelete(item.id)
                  }}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </RoleBasedComponent>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

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
      <BaseLayout loading={true}>
        <div></div>
      </BaseLayout>
    )
  }

  if (error) {
    return (
      <BaseLayout error={error}>
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
              onAdd={() => addModal.open()}
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
              onValueChange: setSelectedCategory
            },
            {
              key: "status",
              label: "Status",
              value: selectedStatus,
              options: [
                { value: "all", label: "All Status" },
                ...statuses.map((status) => ({ value: status, label: status }))
              ],
              onValueChange: setSelectedStatus
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
            search || selectedCategory !== "all" || selectedStatus !== "all"
              ? "Try adjusting your search or filters"
              : `No items available for this owner`
          }
          gridCols="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          totalCount={components.length}
          filteredCount={filteredComponents.length}
          itemLabel="items"
          allItems={filteredComponents}
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSelectedOwner(tab);
          }}
          onClearFilters={() => {
            setSearch("");
            setSelectedOwner("all");
            setSelectedCategory("all");
            setSelectedStatus("all");
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
                <CategorySubheader category={category} count={itemsInCategory.length} />
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
    </BaseLayout>
  )
}

export default Components
