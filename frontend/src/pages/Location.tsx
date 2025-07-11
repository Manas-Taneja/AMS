"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Plus,
  Download,
  MoreHorizontal,
  MapPin,
  Users,
  Building,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "../context/AuthContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input as ShadInput } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { getStatusColor, getTypeIcon } from "../utils/locationUtils"
import StatsCard from "../components/StatsCard"
import { BaseLayout } from "../components/BaseLayout"
import EmptyState from "../components/ui/EmptyState"
import { locationStatusConfig } from "../utils/statusColors"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { AnimatePresence, motion } from "framer-motion"
import { RoleBasedComponent, ManagerOrAdmin } from "../components/RoleBasedComponent"
import { StatsCards } from "../components/StatsCards"
import { EntityModal } from "../components/EntityModal"
import type { FieldConfig } from "../components/EntityModal"
import SearchFilterTabs from "../components/SearchFilterTabs"
import { apiService } from "../services/api"

interface Location {
  id: number;
  name: string;
  address: string;
  team: number;
  manager: string;
  project: string;
  pointOfContact: string;
  status: string;
  type: string;
  assetCount: number;
  avatar: string;
  owner?: string;
}

interface LocationForm {
  name: string;
  address: string;
  team: string;
  manager: string;
  project: string;
}

export default function LocationsPage() {
  const { token } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editInitialValues, setEditInitialValues] = useState<any>(null);
  const navigate = useNavigate();
  
  // For owner tabs
  const ownerList = ["IIDT", "Prakhar Aviation", "PSSL"];
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<string>("all");
  // Assign mock owners to locations
  const locationsWithOwners: (Location & { owner: string })[] = useMemo(() => locations.map((loc, idx) => ({ ...loc, owner: ownerList[idx % ownerList.length] || "Unknown" })), [locations]);
  const owners: string[] = useMemo(() => Array.from(new Set(locationsWithOwners.map((l) => l.owner ?? "Unknown"))), [locationsWithOwners]);
  const groupedByOwner: Record<string, (Location & { owner: string })[]> = useMemo(() => {
    const map: Record<string, (Location & { owner: string })[]> = {};
    owners.forEach((owner) => {
      map[owner] = locationsWithOwners.filter((location: Location & { owner: string }) => (location.owner ?? "Unknown") === owner);
    });
    return map;
  }, [owners, locationsWithOwners]);
  
  const fetchLocations = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiService.get("/locations", token || undefined) as any[];
      setLocations(
        data.map((loc: any) => ({
          ...loc,
          pointOfContact: loc.manager,
          status: "active", // TODO: Map real status if available
          type: "branch", // TODO: Map real type if available
          assetCount: 0, // TODO: Fetch asset count if available
          avatar: loc.manager ? loc.manager.split(" ").map((n: string) => n[0]).join("") : "?",
        }))
      );
    } catch {
      setError("Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLocations();
    // eslint-disable-next-line
  }, [token]);

  const handleExport = () => {
    const csvRows = [
      ["Name", "Address", "Team", "Manager", "Project", "Status", "Type", "Assets"],
      ...locations.map((l) => [
        l.name,
        l.address,
        l.team,
        l.pointOfContact,
        l.project,
        l.status,
        l.type,
        l.assetCount,
      ]),
    ];
    const csvContent = csvRows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "locations.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const locationFields: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "address", label: "Address", type: "text", required: true },
    { name: "team", label: "Team Size", type: "number", required: true, min: 1 },
    { name: "manager", label: "Manager", type: "text", required: true },
    { name: "project", label: "Project", type: "text", required: true },
  ];

  const handleAddLocation = async (data: any) => {
    setAdding(true);
    try {
      await apiService.post("/locations", {
        ...data,
        team: Number(data.team),
      }, token || undefined);
      setShowAddModal(false);
      fetchLocations();
    } catch {
      // handle error
    } finally {
      setAdding(false);
    }
  };

  const onEditLocation = (id: number) => {
    const loc = locations.find(l => l.id === id);
    if (!loc) return;
    setEditMode(true);
    setEditInitialValues({
      name: loc.name,
      address: loc.address,
      team: String(loc.team),
      manager: loc.manager,
      project: loc.project,
    });
    setShowAddModal(true);
  };

  const handleEditLocation = async (data: any) => {
    setAdding(true);
    try {
      const id = locations.find(l => l.name === data.name)?.id;
      if (!id) throw new Error('Location not found');
      await apiService.put(`/locations/${id}`, {
        ...data,
        team: Number(data.team),
      }, token || undefined);
      setShowAddModal(false);
      setEditMode(false);
      setEditInitialValues(null);
      fetchLocations();
    } catch {
      // handle error
    } finally {
      setAdding(false);
    }
  };

  const totalLocations = locations.length;
  const activeLocations = locations.filter((l) => l.status === "active").length;
  const totalAssets = locations.reduce((sum, l) => sum + l.assetCount, 0);
  const totalTeamMembers = locations.reduce((sum, l) => sum + l.team, 0);

  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.pointOfContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || location.status === statusFilter;
    const matchesType = typeFilter === "all" || location.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const onViewDetails = (id: number) => navigate(`/location/${id}`);

  // LocationCard and LocationListItem
  const LocationCard = ({ location }: { location: Location }) => (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
      <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="py-2 cursor-pointer" onClick={() => onViewDetails(location.id)}>
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              {getTypeIcon(location.type)}
                              <div>
                                <h3 className="font-semibold text-lg">{location.name}</h3>
                                <p className="text-gray-600 text-sm">{location.address}</p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="focus:!ring-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white">
                    <ManagerOrAdmin>
                      <DropdownMenuItem className="cursor-pointer hover:shadow-md" onClick={e => { e.stopPropagation(); onEditLocation(location.id); }}>
                                  <Edit className="h-4 w-4" />
                                  Edit Location
                                </DropdownMenuItem>
                    </ManagerOrAdmin>
                    <RoleBasedComponent allowedRoles={['admin']}>
                                <DropdownMenuItem className="text-red-600 cursor-pointer hover:shadow-md">
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                    </RoleBasedComponent>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                <Badge className={locationStatusConfig[location.status as keyof typeof locationStatusConfig]?.color}>{location.status}</Badge>
                            <span className="text-gray-600">{location.assetCount} assets</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Point of Contact</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">{location.avatar}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{location.pointOfContact}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Team Size</p>
                              <p className="text-sm font-medium mt-1">{location.team} members</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Current Project</p>
                            <p className="text-sm font-medium mt-1">{location.project}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
    </motion.div>
  );

  const LocationListItem = ({ location }: { location: Location }) => (
    <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
      <Card className="hover:shadow-sm transition-shadow border-0 shadow-none hover:bg-gray-50">
        <CardContent className="p-4 cursor-pointer" onClick={() => onViewDetails(location.id)}>
          <div className="flex items-center gap-4">
            {getTypeIcon(location.type)}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{location.name}</h3>
              <p className="text-gray-600 text-sm">{location.address}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={locationStatusConfig[location.status as keyof typeof locationStatusConfig]?.color}>{location.status}</Badge>
                <span className="text-gray-600">{location.assetCount} assets</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <BaseLayout loading={true}>
        <div></div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout error={error}>
        <div></div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
                <p className="text-gray-600 mt-1">Manage your asset locations and teams</p>
              </div>
              <div className="flex gap-3">
                <RoleBasedComponent allowedRoles={['admin']}>
                  <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button className="gap-2" onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4" />
                    Add Location
                  </Button>
                </RoleBasedComponent>
              </div>
            </div>

            {/* Stats Cards */}
            <StatsCards 
              cards={[
                {
                  icon: <Building className="h-5 w-5 text-blue-600" />,
                  label: "Total Locations",
                  value: totalLocations,
                  bgClass: "bg-blue-100"
                },
                {
                  icon: <MapPin className="h-5 w-5 text-green-600" />,
                  label: "Active Locations",
                  value: activeLocations,
                  bgClass: "bg-green-100"
                },
                {
                  icon: <Users className="h-5 w-5 text-purple-600" />,
                  label: "Team Members",
                  value: totalTeamMembers,
                  bgClass: "bg-purple-100"
                },
                {
                  icon: <Building className="h-5 w-5 text-orange-600" />,
                  label: "Total Assets",
                  value: totalAssets,
                  bgClass: "bg-orange-100"
                }
              ]}
              gridCols="grid grid-cols-1 md:grid-cols-4 gap-4"
            />

            {/* Search and Filters */}
            <SearchFilterTabs
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search locations, addresses, contacts..."
              allItems={locations}
              filters={[
                {
                  key: "status",
                  label: "Status",
                  value: statusFilter,
                  options: [
                    { value: "all", label: "All Status" },
                    { value: "active", label: "Active" },
                    { value: "maintenance", label: "Maintenance" },
                    { value: "inactive", label: "Inactive" }
                  ],
                  onValueChange: setStatusFilter
                },
                {
                  key: "type",
                  label: "Type",
                  value: typeFilter,
                  options: [
                    { value: "all", label: "All Types" },
                    { value: "headquarters", label: "Headquarters" },
                    { value: "branch", label: "Branch" },
                    { value: "training", label: "Training" }
                  ],
                  onValueChange: setTypeFilter
                }
              ]}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showViewToggle={true}
              owners={owners}
              groupedByOwner={groupedByOwner}
              renderGridItem={(location) => <LocationCard key={location.id} location={location} />}
              renderListItem={(location) => <LocationListItem key={location.id} location={location} />}
              emptyStateIcon={<MapPin className="h-12 w-12 text-gray-400" />}
              emptyStateTitle="No locations found"
              emptyStateDescription="Try adjusting your search terms or filters."
              gridCols="grid grid-cols-1 lg:grid-cols-2 gap-4"
              totalCount={locations.length}
              filteredCount={filteredLocations.length}
              itemLabel="locations"
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onClearFilters={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setTypeFilter("all");
                setActiveTab("all");
              }}
            />

            {/* Add Location Modal */}
            <EntityModal
              open={showAddModal}
              onClose={() => { setShowAddModal(false); setEditMode(false); setEditInitialValues(null); }}
              onSubmit={editMode ? handleEditLocation : handleAddLocation}
              loading={adding}
              title={editMode ? "Edit Location" : "Add Location"}
              buttonText={editMode ? "Save Changes" : "Add Location"}
              fields={locationFields}
              initialValues={editInitialValues}
            />
          </div>
        </BaseLayout>
  )
} 