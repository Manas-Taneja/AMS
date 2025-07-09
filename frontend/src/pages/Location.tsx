"use client"

import { useState, useEffect } from "react"
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
import SearchAndFilter from "../components/ui/SearchAndFilter"
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
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [addForm, setAddForm] = useState<LocationForm>({
    name: "",
    address: "",
    team: "",
    manager: "",
    project: "",
  });
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  
  const fetchLocations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/locations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
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
      } else {
        setError("Failed to fetch locations");
      }
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
      ...filteredLocations.map((l) => [
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

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      let res;
      if (editMode && editId !== null) {
        res = await fetch(`http://localhost:8000/api/locations/${editId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: addForm.name,
            address: addForm.address,
            team: Number(addForm.team),
            manager: addForm.manager,
            project: addForm.project,
          }),
        });
      } else {
        res = await fetch("http://localhost:8000/api/locations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: addForm.name,
            address: addForm.address,
            team: Number(addForm.team),
            manager: addForm.manager,
            project: addForm.project,
          }),
        });
      }
      if (res.ok) {
        setShowAddModal(false);
        setAddForm({ name: "", address: "", team: "", manager: "", project: "" });
        setEditMode(false);
        setEditId(null);
        fetchLocations();
      } else {
        alert(editMode ? "Failed to update location" : "Failed to add location");
      }
    } catch {
      alert(editMode ? "Failed to update location" : "Failed to add location");
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

  function onEditLocation(id: number): void {
    const loc = locations.find(l => l.id === id);
    if (!loc) return;
    setAddForm({
      name: loc.name,
      address: loc.address,
      team: String(loc.team),
      manager: loc.manager,
      project: loc.project,
    });
    setEditMode(true);
    setEditId(id);
    setShowAddModal(true);
  }

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
                <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button className="gap-2" onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4" />
                  Add Location
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard icon={<Building className="h-5 w-5 text-blue-600" />} label="Total Locations" value={totalLocations} bgClass="bg-blue-100" />
              <StatsCard icon={<MapPin className="h-5 w-5 text-green-600" />} label="Active Locations" value={activeLocations} bgClass="bg-green-100" />
              <StatsCard icon={<Users className="h-5 w-5 text-purple-600" />} label="Team Members" value={totalTeamMembers} bgClass="bg-purple-100" />
              <StatsCard icon={<Building className="h-5 w-5 text-orange-600" />} label="Total Assets" value={totalAssets} bgClass="bg-orange-100" />
            </div>

            {/* Search and Filters */}
            <SearchAndFilter
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search locations, addresses, contacts..."
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
              totalCount={locations.length}
              filteredCount={filteredLocations.length}
              itemLabel="locations"
              onClearFilters={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setTypeFilter("all")
              }}
              hasActiveFilters={!!(searchTerm || statusFilter !== "all" || typeFilter !== "all")}
            />

            {/* Locations Grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredLocations.map((location) => (
                  <Card key={location.id} className="hover:shadow-md transition-shadow" >
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
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-white">
                                <DropdownMenuItem
                                  className="cursor-pointer hover:shadow-md"
                                  onClick={e => {
                                    e.stopPropagation();
                                    onEditLocation(location.id);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit Location
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem className="text-red-600 cursor-pointer hover:shadow-md">
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
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
                ))}
              </div>
            </div>

            {filteredLocations.length === 0 && (
              <EmptyState
                icon={<MapPin className="h-12 w-12 text-gray-400" />}
                title="No locations found"
                description={
                  searchTerm ? "Try adjusting your search terms" : "Get started by adding your first location"
                }
                action={
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Location
                  </Button>
                }
              />
            )}

            {/* Add Location Modal */}
            <Dialog open={showAddModal} onOpenChange={open => {
              setShowAddModal(open);
              if (!open) {
                setTimeout(() => {
                  setEditMode(false);
                  setEditId(null);
                  setAddForm({ name: "", address: "", team: "", manager: "", project: "" });
                }, 200); // allow modal close animation
              }
            }}>
              <DialogContent className="bg-white" key={editMode ? editId : 'add'}>
                <DialogHeader>
                  <DialogTitle>{editMode ? "Edit Location" : "Add Location"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddLocation} className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <ShadInput required value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <ShadInput required value={addForm.address} onChange={e => setAddForm(f => ({ ...f, address: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Team Size</Label>
                    <ShadInput required type="number" min={1} value={addForm.team} onChange={e => setAddForm(f => ({ ...f, team: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Manager</Label>
                    <ShadInput required value={addForm.manager} onChange={e => setAddForm(f => ({ ...f, manager: e.target.value }))} />
                  </div>
                  <div>
                    <Label>Project</Label>
                    <ShadInput required value={addForm.project} onChange={e => setAddForm(f => ({ ...f, project: e.target.value }))} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={adding}>{adding ? (editMode ? "Saving..." : "Adding...") : (editMode ? "Save Changes" : "Add Location")}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </BaseLayout>
      )
    } 