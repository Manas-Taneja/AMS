"use client"

import { useState, useMemo } from "react"
import {
  MoreHorizontal,
  MapPin,
  Users,
  Building,
  Eye,
  Edit,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "../context/AuthContext"

import { useNavigate } from "react-router-dom"
import { getTypeIcon } from "../utils/locationUtils"
import { BaseLayout } from "../components/BaseLayout"
import { locationStatusConfig } from "../utils/statusColors"
import { motion } from "framer-motion"
import { RoleBasedComponent, ManagerOrAdmin } from "../components/RoleBasedComponent"
import { StatsCards } from "../components/StatsCards"
import { EntityModal } from "../components/EntityModal"
import type { FieldConfig } from "../components/EntityModal"
import SearchFilterTabs from "../components/SearchFilterTabs"
import { useLocationsData } from "../hooks/useApiData"
import { useLocationsCrud } from "../hooks/useCrud"
import { useForm, validationRules } from "../hooks/useForm"
import { useModal } from "../hooks/useModal"
import { UnifiedHeader } from "../components/UnifiedHeader"

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

interface LocationFormData {
  name: string;
  address: string;
  team: string;
  manager: string;
  project: string;
  status: string;
  type: string;
  pointOfContact: string;
  [key: string]: string | number | boolean | string[] | undefined;
}



export default function LocationsPage() {
  const { token } = useAuth();
  const { data: locations, loading, error, refetch } = useLocationsData(token || undefined);
  const { create, update } = useLocationsCrud(token || undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const navigate = useNavigate();
  
  // Modal management
  const addModal = useModal();
  const [editMode, setEditMode] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form management
  const form = useForm<LocationFormData>({
    initialData: {
      name: "",
      address: "",
      team: "",
      manager: "",
      project: "",
      status: "active",
      type: "headquarters",
      pointOfContact: "",
    },
    validationRules: [
      validationRules.required("name"),
      validationRules.required("address"),
      validationRules.required("manager"),
      validationRules.required("project"),
      validationRules.positiveNumber("team"),
    ],
    onSubmit: async (formData) => {
      const locationData = {
        ...formData,
        team: Number(formData.team),
      };
      
      if (editMode && editingId) {
        await update(editingId, locationData);
      } else {
        await create(locationData);
      }
      
      addModal.close();
      setEditMode(false);
      setEditingId(null);
      form.reset();
      refetch();
    },
  });
  
  // For owner tabs
  const ownerList = ["PSSL", "IIDT", "Prakhar Aviation"];
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<string>("all");
  // Assign mock owners to locations
  const locationsWithOwners: (Location & { owner: string })[] = useMemo(() => locations.map((loc, idx) => ({ ...loc, owner: ownerList[idx % ownerList.length] || "Unknown" })), [locations]);
  const owners: string[] = useMemo(() => Array.from(new Set(locationsWithOwners.map((l) => l.owner ?? "Unknown"))), [locationsWithOwners]);
  // Grouped by owner for ALL locations (unfiltered)
  // const groupedByOwner: Record<string, (Location & { owner: string })[]> = useMemo(() => {
  //   const map: Record<string, (Location & { owner: string })[]> = {};
  //   owners.forEach((owner) => {
  //     map[owner] = locationsWithOwners.filter((location: Location & { owner: string }) => (location.owner ?? "Unknown") === owner);
  //   });
  //   return map;
  // }, [owners, locationsWithOwners]);

  // Grouped by owner for FILTERED locations
  const filteredLocationsWithOwners: (Location & { owner: string })[] = useMemo(() => locations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.pointOfContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || location.status === statusFilter;
    const matchesType = typeFilter === "all" || location.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }).map((loc, idx) => ({ ...loc, owner: ownerList[idx % ownerList.length] || "Unknown" })), [locations, searchTerm, statusFilter, typeFilter, ownerList]);
  const filteredGroupedByOwner: Record<string, (Location & { owner: string })[]> = useMemo(() => {
    const map: Record<string, (Location & { owner: string })[]> = {};
    owners.forEach((owner) => {
      map[owner] = filteredLocationsWithOwners.filter((location: Location & { owner: string }) => (location.owner ?? "Unknown") === owner);
    });
    return map;
  }, [owners, filteredLocationsWithOwners]);
  


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

  const onEditLocation = (id: number) => {
    const loc = locations.find(l => l.id === id);
    if (!loc) return;
    setEditMode(true);
    setEditingId(id);
    form.setFieldValue("name", loc.name);
    form.setFieldValue("address", loc.address);
    form.setFieldValue("team", String(loc.team));
    form.setFieldValue("manager", loc.manager);
    form.setFieldValue("project", loc.project);
    form.setFieldValue("status", loc.status);
    form.setFieldValue("type", loc.type);
    form.setFieldValue("pointOfContact", loc.pointOfContact);
    addModal.open();
  };

  const handleModalSubmit = async (data: Record<string, any>) => {
    // Update form data with modal data
    Object.entries(data).forEach(([key, value]) => {
      form.setFieldValue(key as keyof LocationFormData, value);
    });
    // Submit the form
    await form.handleSubmit();
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
        {/* Unified Header */}
        <UnifiedHeader
          title="Locations"
          subtitle="Manage your asset locations and teams"
          onAdd={() => addModal.open()}
          addLabel="Add Location"
          onExport={handleExport}
          exportLabel="Export Locations"
        />

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
              label: "Locations under Consideration",
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
          allItems={filteredLocations}
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
          groupedByOwner={filteredGroupedByOwner}
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
          open={addModal.isOpen}
          onClose={() => { addModal.close(); setEditMode(false); setEditingId(null); form.reset(); }}
          onSubmit={handleModalSubmit}
          loading={form.isSubmitting}
          title={editMode ? "Edit Location" : "Add Location"}
          buttonText={editMode ? "Save Changes" : "Add Location"}
          fields={locationFields}
          initialValues={form.data}
        />
      </div>
    </BaseLayout>
  )
} 