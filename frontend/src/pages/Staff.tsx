"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import {
  Plus,
  Download,
  MoreHorizontal,
  Users,
  Mail,
  Phone,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Building,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from "react-router-dom"
import { BaseLayout } from "../components/BaseLayout"
import EmptyState from "../components/ui/EmptyState"
import { useAuth } from "../context/AuthContext"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input as ShadInput } from "@/components/ui/input"

// Import new DRY hooks and components
import { useStaffData } from "../hooks/useApiData"
import { useStaffCrud } from "../hooks/useCrud"
import { useForm, validationRules } from "../hooks/useForm"
import { useModal } from "../hooks/useModal"
import { StatusBadge } from "../components/StatusBadge"
import { getStatusConfig, departmentConfig } from "../config/statusConfig"
import SearchAndFilter from "../components/ui/SearchAndFilter"

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  company: string;
  location: string;
  status: string;
  skills: string[];
  experience: string;
  joinDate: string;
  reportsTo: string;
  avatar: string;
  initials: string;
  currentProjects: number;
  completedTasks: number;
}

interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  company: string;
  location: string;
  status: string;
  skills: string;
  experience: string;
  joinDate: string;
  reportsTo: string;
  [key: string]: string | number | boolean | string[] | undefined;
}

export default function TeamMembersPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const renderCount = useRef(0);
  useEffect(() => { renderCount.current += 1; console.log('Staff render', renderCount.current, 'token:', token); }, [token]);
  
  // Use new DRY hooks
  const { data: staff, loading, error, refetch } = useStaffData(token || undefined);
  const { create, update, remove } = useStaffCrud(token || undefined);
  
  // Modal management
  const addModal = useModal();
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form management
  const form = useForm<StaffFormData>({
    initialData: {
      name: "",
      email: "",
      phone: "",
      designation: "",
      department: "",
      company: "",
      location: "",
      status: "active",
      skills: "",
      experience: "",
      joinDate: "",
      reportsTo: "",
      
    },
    validationRules: [
      validationRules.required("name"),
      validationRules.required("email"),
      validationRules.email("email"),
      validationRules.required("department"),
    ],
    onSubmit: async (formData) => {
      const staffData: Omit<StaffMember, 'id' | 'avatar' | 'initials' | 'currentProjects' | 'completedTasks'> & { skills: string[] } = {
        ...formData,
        skills: formData.skills.split(",").map((s) => s.trim()),
      };
      
      if (editMode && editingId) {
        await update(editingId, staffData);
      } else {
        await create(staffData);
      }
      
      addModal.close();
      setEditMode(false);
      setEditingId(null);
      form.reset();
      refetch();
    },
  });

  // Local state for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");

  const totalMembers = staff.length;
  const activeMembers = staff.filter((m) => m.status === "active").length;

  const filteredMembers = staff.filter((member: StaffMember) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter;
    const matchesCompany = companyFilter === "all" || member.company === companyFilter;
    return matchesSearch && matchesStatus && matchesDepartment && matchesCompany;
  });

  const companies = useMemo(() => Array.from(new Set(staff.map((m) => m.company))), [staff]);
  const groupedMembers = useMemo(() => {
    const map: Record<string, StaffMember[]> = {};
    companies.forEach((company) => {
      map[company] = filteredMembers.filter((member) => member.company === company);
    });
    return map;
  }, [companies, filteredMembers]);

  const getCompanyStats = (company: string) => {
    const companyMembers = staff.filter((m) => m.company === company);
    const activeCount = companyMembers.filter((m) => m.status === "active").length;
    return {
      total: companyMembers.length,
      active: activeCount,
    };
  };

  const handleAddStaff = () => {
    setEditMode(false);
    setEditingId(null);
    form.reset();
    addModal.open();
  };

  const handleEditStaff = (id: number) => {
    const member = staff.find(m => m.id === id);
    if (member) {
      setEditMode(true);
      setEditingId(id);
      form.reset();
      // Set form data
      Object.entries(member).forEach(([key, value]) => {
        if (key === 'skills') {
          form.setFieldValue('skills', Array.isArray(value) ? value.join(', ') : value);
        } else {
          form.setFieldValue(key as keyof StaffFormData, value as string);
        }
      });
      addModal.open();
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      await remove(id);
      refetch();
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Designation', 'Department', 'Company', 'Location', 'Status'],
      ...staff.map(m => [
        m.name,
        m.email,
        m.phone,
        m.designation,
        m.department,
        m.company,
        m.location,
        m.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statusOptions = getStatusConfig('staff');
  const departmentOptions = departmentConfig;

  if (loading) {
    return (
      <BaseLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refetch}>Retry</Button>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
            <p className="text-gray-600 mt-1">Manage your team members and their information</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleAddStaff}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900">{activeMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Companies</p>
                  <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters (Unified) */}
        <SearchAndFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search members, skills, or departments..."
          filters={[
            {
              key: "status",
              label: "Status",
              value: statusFilter,
              options: [
                { value: "all", label: "All Statuses" },
                ...statusOptions.map((status) => ({ value: status.value, label: status.label }))
              ],
              onValueChange: setStatusFilter
            },
            {
              key: "department",
              label: "Department",
              value: departmentFilter,
              options: [
                { value: "all", label: "All Departments" },
                ...departmentOptions.map((dept) => ({ value: dept.value, label: dept.label }))
              ],
              onValueChange: setDepartmentFilter
            },
            {
              key: "company",
              label: "Company",
              value: companyFilter,
              options: [
                { value: "all", label: "All Companies" },
                ...companies.map((company) => ({ value: company, label: company }))
              ],
              onValueChange: setCompanyFilter
            }
          ]}
          totalCount={staff.length}
          filteredCount={filteredMembers.length}
          itemLabel="members"
          onClearFilters={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setDepartmentFilter("all");
            setCompanyFilter("all");
          }}
          hasActiveFilters={
            !!(
              searchTerm ||
              statusFilter !== "all" ||
              departmentFilter !== "all" ||
              companyFilter !== "all"
            )
          }
        />

        {/* Results */}
        {filteredMembers.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12 text-gray-400" />}
            title="No team members found"
            description="Try adjusting your search or filters to find what you're looking for."
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMembers).map(([company, members]) => (
              <Card key={company}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{company}</h3>
                      <p className="text-sm text-gray-600">
                        {getCompanyStats(company).total} members • {getCompanyStats(company).active} active
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-gray-900">{member.name}</h4>
                              <p className="text-sm text-gray-600">{member.designation}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <StatusBadge type="staff" value={member.status} />
                                <Badge variant="outline" className="text-xs">
                                  {member.department}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/staff/${member.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditStaff(member.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteStaff(member.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="mt-3 space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-3 w-3 mr-2" />
                            {member.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-3 w-3 mr-2" />
                            {member.phone}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-3 w-3 mr-2" />
                            {member.location}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {member.currentProjects} active projects
                          </span>
                          <span className="text-gray-600">
                            {member.completedTasks} completed tasks
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={addModal.isOpen} onOpenChange={open => { if (!open) addModal.close(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Staff Member" : "Add New Staff Member"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <ShadInput
                  id="name"
                  value={form.data.name}
                  onChange={(e) => form.setFieldValue('name', e.target.value)}
                  placeholder="Enter full name"
                />
                {form.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{form.errors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <ShadInput
                  id="email"
                  type="email"
                  value={form.data.email}
                  onChange={(e) => form.setFieldValue('email', e.target.value)}
                  placeholder="Enter email address"
                />
                {form.errors.email && (
                  <p className="text-red-500 text-sm mt-1">{form.errors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <ShadInput
                  id="phone"
                  value={form.data.phone}
                  onChange={(e) => form.setFieldValue('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="designation">Designation</Label>
                <ShadInput
                  id="designation"
                  value={form.data.designation}
                  onChange={(e) => form.setFieldValue('designation', e.target.value)}
                  placeholder="Enter designation"
                />
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={form.data.department}
                  onValueChange={(value) => form.setFieldValue('department', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.errors.department && (
                  <p className="text-red-500 text-sm mt-1">{form.errors.department}</p>
                )}
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={form.data.status}
                  onValueChange={(value) => form.setFieldValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <ShadInput
                  id="company"
                  value={form.data.company}
                  onChange={(e) => form.setFieldValue('company', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <ShadInput
                  id="location"
                  value={form.data.location}
                  onChange={(e) => form.setFieldValue('location', e.target.value)}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <Label htmlFor="experience">Experience</Label>
                <ShadInput
                  id="experience"
                  value={form.data.experience}
                  onChange={(e) => form.setFieldValue('experience', e.target.value)}
                  placeholder="e.g., 5 years"
                />
              </div>
              <div>
                <Label htmlFor="joinDate">Join Date</Label>
                <ShadInput
                  id="joinDate"
                  type="date"
                  value={form.data.joinDate}
                  onChange={(e) => form.setFieldValue('joinDate', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <ShadInput
                  id="skills"
                  value={form.data.skills}
                  onChange={(e) => form.setFieldValue('skills', e.target.value)}
                  placeholder="e.g., React, TypeScript, Project Management"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="reportsTo">Reports To</Label>
                <ShadInput
                  id="reportsTo"
                  value={form.data.reportsTo}
                  onChange={(e) => form.setFieldValue('reportsTo', e.target.value)}
                  placeholder="Enter manager name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={addModal.close}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.isSubmitting}>
                {form.isSubmitting ? (editMode ? "Saving..." : "Creating...") : (editMode ? "Save Changes" : "Create Member")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </BaseLayout>
  );
}
