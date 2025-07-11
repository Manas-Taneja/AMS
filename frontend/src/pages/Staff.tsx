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
import SearchFilterTabs from "../components/SearchFilterTabs"
import { AnimatePresence, motion } from "framer-motion"
import { RoleBasedComponent, ManagerOrAdmin } from "../components/RoleBasedComponent"
import { StatsCards } from "../components/StatsCards"
import { EntityModal } from "../components/EntityModal"
import type { FieldConfig } from "../components/EntityModal"

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
  const [editInitialValues, setEditInitialValues] = useState<any>(null);
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

  const handleAddStaff = async (data: any) => {
    await create({
      ...data,
      skills: data.skills ? data.skills.split(",").map((s: string) => s.trim()) : [],
    });
    addModal.close();
    refetch();
  };

  const onEditStaff = (id: number) => {
    const member = staff.find(m => m.id === id);
    if (!member) return;
    setEditMode(true);
    setEditInitialValues({
      name: member.name,
      email: member.email,
      phone: member.phone,
      designation: member.designation,
      department: member.department,
      company: member.company,
      location: member.location,
      status: member.status,
      skills: member.skills.join(', '),
      experience: member.experience,
      joinDate: member.joinDate,
      reportsTo: member.reportsTo,
    });
    addModal.open();
  };

  const handleEditStaff = async (data: any) => {
    await update(editingId!, {
      ...data,
      skills: data.skills ? data.skills.split(",").map((s: string) => s.trim()) : [],
    });
    addModal.close();
    setEditMode(false);
    setEditInitialValues(null);
    setEditingId(null);
    refetch();
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

  // For owner tabs
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<string>("all");
  const owners = companies;
  const groupedByOwner = useMemo(() => {
    const map: Record<string, StaffMember[]> = {};
    owners.forEach((owner) => {
      map[owner] = filteredMembers.filter((member) => member.company === owner);
    });
    return map;
  }, [owners, filteredMembers]);

  // StaffCard and StaffListItem
  const StaffCard = ({ member }: { member: StaffMember }) => (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
      <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm hover:shadow-md">
        <CardContent className="p-6 cursor-pointer" onClick={() => navigate(`/staff/${member.id}`)}>
          <div className="flex items-start justify-between mb-4">
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
                  <Badge variant="outline" className="text-xs">{member.department}</Badge>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="focus:!ring-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <ManagerOrAdmin>
                  <DropdownMenuItem className="cursor-pointer" onClick={(e) => {e.stopPropagation(); onEditStaff(member.id)}}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                </ManagerOrAdmin>
                <RoleBasedComponent allowedRoles={['admin']}>
                  <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleDeleteStaff(member.id)} } className="text-red-600 cursor-pointer">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </RoleBasedComponent>
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
            <span className="text-gray-600">{member.currentProjects} active projects</span>
            <span className="text-gray-600">{member.completedTasks} completed tasks</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const StaffListItem = ({ member }: { member: StaffMember }) => (
    <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
      <Card className="group hover:shadow-sm transition-all duration-200 border-0 shadow-none hover:bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Avatar>
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  <StatusBadge type="staff" value={member.status} />
                  <Badge variant="outline" className="text-xs">{member.department}</Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 mr-2" />
                    {member.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 mr-2" />
                    {member.phone}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 mr-2" />
                    {member.location}
                  </div>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/staff/${member.id}`)} className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const staffFields: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "email", label: "Email", type: "text", required: true },
    { name: "phone", label: "Phone", type: "text" },
    { name: "designation", label: "Designation", type: "text" },
    { name: "department", label: "Department", type: "select", required: true, options: departmentOptions },
    { name: "company", label: "Company", type: "text" },
    { name: "location", label: "Location", type: "text" },
    { name: "status", label: "Status", type: "select", options: statusOptions },
    { name: "skills", label: "Skills (comma-separated)", type: "text" },
    { name: "experience", label: "Experience", type: "text" },
    { name: "joinDate", label: "Join Date", type: "date" },
    { name: "reportsTo", label: "Reports To", type: "text" },
  ];

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
    <BaseLayout className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
            <p className="text-gray-600 mt-1">Manage your team members and their information</p>
              </div>
          <div className="flex items-center gap-3">
            <RoleBasedComponent allowedRoles={['admin']}>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              <Button onClick={() => {
                  setEditMode(false);
                setEditingId(null);
                form.reset();
                addModal.open();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
                </Button>
            </RoleBasedComponent>
              </div>
            </div>

        {/* Stats */}
        <StatsCards 
          cards={[
            {
              icon: <Users className="h-8 w-8 text-blue-600" />,
              label: "Total Members",
              value: totalMembers,
              bgClass: "bg-blue-100"
            },
            {
              icon: <Users className="h-8 w-8 text-green-600" />,
              label: "Active Members", 
              value: activeMembers,
              bgClass: "bg-green-100"
            }
          ]}
          gridCols="grid grid-cols-2 gap-4"
        />

        {/* Search and Filters (Unified) */}
        <SearchFilterTabs
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
            }
          ]}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={true}
          owners={owners}
          groupedByOwner={groupedByOwner}
          renderGridItem={(member) => <StaffCard key={member.id} member={member} />}
          renderListItem={(member) => <StaffListItem key={member.id} member={member} />}
          emptyStateIcon={<Users className="h-12 w-12 text-gray-400" />}
          emptyStateTitle="No team members found"
          emptyStateDescription="Try adjusting your search or filters to find what you're looking for."
          gridCols="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          totalCount={staff.length}
          filteredCount={filteredMembers.length}
          itemLabel="members"
          allItems={filteredMembers}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClearFilters={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setDepartmentFilter("all");
            setCompanyFilter("all");
            setActiveTab("all");
          }}
        />
      </div>

      {/* Add/Edit Modal */}
      <EntityModal
        open={addModal.isOpen && !editMode}
        onClose={() => { addModal.close(); setEditMode(false); setEditInitialValues(null); }}
        onSubmit={editMode ? handleEditStaff : handleAddStaff}
        loading={form.isSubmitting}
        title={editMode ? "Edit Staff Member" : "Add New Staff Member"}
        buttonText={editMode ? "Save Changes" : "Create Member"}
        fields={staffFields}
        initialValues={editInitialValues}
      />
    </BaseLayout>
  );
}
