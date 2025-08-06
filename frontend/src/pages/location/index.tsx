"use client"

import { useState, useMemo } from "react"
import {
  LuPencil as Edit,   
  LuMapPin as MapPin,
  LuUsers as Users,
  LuBuilding as Building,
  LuEye as Eye,
  LuTrash2 as Trash2,
} from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

import { useAuth } from "@/context/AuthContext"

import { useRouter } from "next/navigation";
import { getTypeIcon } from "@/utils/locationUtils"
import { BaseLayout } from "@/components/BaseLayout"
import { locationStatusConfig } from "@/utils/statusColors"
import { motion } from "framer-motion"
import { RoleBasedComponent, ManagerOrAdmin } from "@/components/RoleBasedComponent"
import { StatsCards } from "@/components/StatsCards"
import { EntityModal } from "@/components/EntityModal"
import type { FieldConfig } from "@/components/EntityModal"
import SearchFilterTabs from "@/components/SearchFilterTabs"
import { useLocationsData } from "@/hooks/useApiData"
import { useLocationsCrud } from "@/hooks/useCrud"
import { useForm, validationRules } from "@/hooks/useForm"
import { useModal } from "@/hooks/useModal"
import { useConfirmation } from "@/hooks/useConfirmation"
import { UnifiedHeader } from "@/components/UnifiedHeader"
import ProtectedRoute from '@/components/ProtectedRoute';

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
  const router = useRouter();
  
  // Modal management
  const addModal = useModal();
  const [editMode, setEditMode] = useState(false);
  const { confirmCreate, confirmUpdate } = useConfirmation();

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
      validationRules.minLength("name", 3),
      validationRules.required("address"),
      validationRules.minLength("address", 10),
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
  const ownerList: string[] = useMemo(() => ["PSSL", "IIDT", "Prakhar Aviation"], []);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<string>("all");
  // Assign mock owners to locations
  const locationsWithOwners: (Location & { owner: string })[] = useMemo(() =>
    locations
      .filter((loc): loc is Location => typeof loc === 'object' && loc !== null)
      .map((loc, idx) => ({ ...loc, owner: ownerList[idx % ownerList.length] || "Unknown" })),
    [locations, ownerList]
  );
  const owners: string[] = useMemo(() => Array.from(new Set(locationsWithOwners.map((l) => l.owner ?? "Unknown"))), [locationsWithOwners]);
  // Grouped by owner for FILTERED locations
  const filteredLocationsWithOwners: (Location & { owner: string })[] = useMemo(() =>
    locations
      .filter((location): location is Location => typeof location === 'object' && location !== null)
      .filter((location) => {
        const matchesSearch =
          location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.pointOfContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.project.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || location.status === statusFilter;
        const matchesType = typeFilter === "all" || location.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
      })
      .map((loc, idx) => ({ ...loc, owner: ownerList[idx % ownerList.length] || "Unknown" })),
    [locations, searchTerm, statusFilter, typeFilter, ownerList]
  );
  const filteredGroupedByOwner: Record<string, (Location & { owner: string })[]> = useMemo(() => {
    const map: Record<string, (Location & { owner: string })[]> = {};
    owners.forEach((owner: string) => {
      map[owner] = filteredLocationsWithOwners.filter((location: Location & { owner: string }) => (location.owner ?? "Unknown") === owner);
    });
    return map;
  }, [owners, filteredLocationsWithOwners]);
  


  const handleExport = () => {
    const csvRows = [
      ["Name", "Address", "Team", "Manager", "Project", "Status", "Type", "Assets"],
      ...locations
        .filter((l): l is Location => typeof l === 'object' && l !== null)
        .map((l) => [
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
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter location name" },
    { name: "address", label: "Address", type: "textarea", required: true, placeholder: "Enter full address" },
    { name: "team", label: "Team Size", type: "number", required: true, min: 1, max: 100, placeholder: "Enter team size" },
    { name: "manager", label: "Manager", type: "text", required: true, placeholder: "Enter manager name" },
    { name: "project", label: "Project", type: "text", required: true, placeholder: "Enter project name" },
    { name: "status", label: "Status", type: "select", required: true, options: [
      { value: "active", label: "Active" },
      { value: "maintenance", label: "Maintenance" },
      { value: "inactive", label: "Inactive" }
    ]},
    { name: "type", label: "Type", type: "select", required: true, options: [
      { value: "headquarters", label: "Headquarters" },
      { value: "branch", label: "Branch" },
      { value: "training", label: "Training" }
    ]},
    { name: "pointOfContact", label: "Point of Contact", type: "text", placeholder: "Enter contact person" },
  ];

  const onEditLocation = (id: number) => {
    const loc = locations.find((l): l is Location => {
      if (typeof l === 'object' && l !== null && 'id' in l) {
        return (l as Location).id === id;
      }
      return false;
    });
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

  const handleModalSubmit = async (data: Partial<LocationFormData>) => {
    try {
      // Validate required fields
      if (!data.name || !data.name.trim()) {
        toast.error('Location name is required');
        return false;
      }
      
      if (!data.address || !data.address.trim()) {
        toast.error('Location address is required');
        return false;
      }
      
      if (!data.manager || !data.manager.trim()) {
        toast.error('Location manager is required');
        return false;
      }
      
      if (!data.project || !data.project.trim()) {
        toast.error('Location project is required');
        return false;
      }
      
      if (!data.team || Number(data.team) <= 0) {
        toast.error('Team size must be greater than 0');
        return false;
      }
      
      // Transform the data to match backend schema
      const locationData = {
        name: data.name.trim(),
        address: data.address.trim(),
        team: Number(data.team),
        manager: data.manager.trim(),
        project: data.project.trim(),
        status: data.status || 'active',
        type: data.type || 'branch',
        pointOfContact: data.pointOfContact || data.manager || '',
      };

      if (editMode && editingId) {
        // Show confirmation for update
        const confirmed = await confirmUpdate('location', data.name);
        if (!confirmed) {
          return false;
        }
        const result = await update(editingId, locationData);
        if (result) {
          toast.success('Location updated successfully');
          setEditMode(false);
          setEditingId(null);
          form.reset();
          refetch();
          return true;
        }
        return false;
      } else {
        // Show confirmation for create
        const confirmed = await confirmCreate('location');
        if (!confirmed) {
          return false;
        }
        const result = await create(locationData);
        if (result) {
          toast.success('Location created successfully');
          setEditMode(false);
          setEditingId(null);
          form.reset();
          refetch();
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Error submitting location:', error);
      toast.error('Failed to save location. Please try again.');
      return false;
    }
  };

  const typedLocations = locations.filter((l): l is Location => typeof l === 'object' && l !== null);
  const totalLocations = typedLocations.length;
  const activeLocations = typedLocations.filter((l) => l.status === "active").length;
  const totalAssets = typedLocations.reduce((sum, l) => sum + l.assetCount, 0);
  const totalTeamMembers = typedLocations.reduce((sum, l) => sum + l.team, 0);

  const filteredLocations = typedLocations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.pointOfContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || location.status === statusFilter;
    const matchesType = typeFilter === "all" || location.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const onViewDetails = (id: number) => router.push(`/location/${id}`);

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

              </div>
              <div className="flex items-center gap-4 text-sm">
                <Badge className={locationStatusConfig[location.status as keyof typeof locationStatusConfig]?.color}>
                  {locationStatusConfig[location.status as keyof typeof locationStatusConfig]?.label || location.status}
                </Badge>
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
                <Badge className={locationStatusConfig[location.status as keyof typeof locationStatusConfig]?.color}>
                  {locationStatusConfig[location.status as keyof typeof locationStatusConfig]?.label || location.status}
                </Badge>
                <span className="text-gray-600">{location.assetCount} assets</span>
              </div>
            </div>

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
    <ProtectedRoute>
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
                value: 6,
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
            allItems={filteredLocations.map(l => ({ ...l, owner: l.owner ?? "Unknown" })) as (Location & { owner: string })[]}
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
            renderGridItem={(location: Location & { owner: string }) => <LocationCard key={location.id} location={location} />}
            renderListItem={(location: Location & { owner: string }) => <LocationListItem key={location.id} location={location} />}
            emptyStateIcon={<MapPin className="h-12 w-12 text-gray-400" />}
            emptyStateTitle="No locations found"
            emptyStateDescription="Try adjusting your search terms or filters."
            gridCols="grid grid-cols-1 lg:grid-cols-2 gap-4"
            totalCount={locations.length}
            filteredCount={filteredLocations.length}
            itemLabel="locations"
            activeTab={activeTab}
            onTabChange={(tab: string) => setActiveTab(tab)}
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
    </ProtectedRoute>
  )
} 