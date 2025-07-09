"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BaseLayout } from "../components/BaseLayout"
import { UnifiedHeader } from "../components/UnifiedHeader"
import EmptyState from "../components/ui/EmptyState"
import SearchAndFilter from "../components/ui/SearchAndFilter"
import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, MapPin, FolderOpen, Hash, User, Package } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { componentStatusConfig } from "../utils/statusColors"

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



const Components: React.FC = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [components, setComponents] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [selectedOwner, setSelectedOwner] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Fetch components from backend
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/components", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()

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

          setComponents([...data, ...hardcodedItems])
        } else {
          setError("Failed to fetch components")
        }
      } catch (err) {
        setError("Network error")
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchComponents()
    }
  }, [token])

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
  const owners = useMemo(() => Array.from(new Set(components.map((item) => item.owner))), [components])
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

  const handleAdd = () => alert("Add Item clicked")
  const handleExport = () => alert("Export clicked")

  const ComponentCard = ({ item }: { item: TableData }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {item.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {item.description || "No description available"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/components/${item.id}`)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
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
                {item.category}
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
                  <Badge variant="outline" className="text-xs">
                    {item.category}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/components/${item.id}`)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

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
          title="Components"
          onAdd={handleAdd}
          onExport={handleExport}
          addLabel="Add Component"
          exportLabel="Export"
          onBack={() => window.history.back()}
          backLabel="Back"
        />

        {/* Search and Filters */}
        <SearchAndFilter
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search components, projects, locations..."
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
          totalCount={components.length}
          filteredCount={filteredComponents.length}
          itemLabel="components"
          onClearFilters={() => {
            setSearch("")
            setSelectedOwner("all")
            setSelectedCategory("all")
            setSelectedStatus("all")
          }}
          hasActiveFilters={!!(search || selectedOwner !== "all" || selectedCategory !== "all" || selectedStatus !== "all")}
        />

        {/* Owner Tabs */}
        <Tabs defaultValue={owners[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-1 h-auto p-1 bg-gray-100">
            {owners.map((owner) => (
              <TabsTrigger
                key={owner}
                value={owner}
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <User className="w-4 h-4" />
                <span className="font-medium">{owner}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {groupedByOwner[owner]?.length || 0}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {owners.map((owner) => (
            <TabsContent key={owner} value={owner} className="mt-6">
              <AnimatePresence mode="wait">
                {groupedByOwner[owner] && groupedByOwner[owner].length > 0 ? (
                  <motion.div
                    key={`${owner}-${viewMode}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {viewMode === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {groupedByOwner[owner]!.map((item) => (
                          <ComponentCard key={item.id} item={item} />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {groupedByOwner[owner]!.map((item) => (
                          <ComponentListItem key={item.id} item={item} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <EmptyState
                      icon={<Package className="w-12 h-12 text-gray-400" />}
                      title="No components found"
                      description={
                        search || selectedCategory !== "all" || selectedStatus !== "all"
                          ? "Try adjusting your search or filters"
                          : `No components available for ${owner}`
                      }
                      action={<Button onClick={handleAdd}>Add Component</Button>}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </BaseLayout>
  )
}

export default Components
