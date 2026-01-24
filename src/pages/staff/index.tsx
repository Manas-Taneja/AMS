"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import {
  LuPlus as Plus,
  LuDownload as Download,
  LuUsers as Users,
  LuMail as Mail,
  LuPhone as Phone,
  LuMapPin as MapPin,
} from "react-icons/lu"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { useRouter } from "next/navigation";
import { BaseLayout } from "@/components/BaseLayout"
import { useAuth } from "@/context/AuthContext"
import { useStaffData } from "@/hooks/useApiData"
import { useStaffCrud } from "@/hooks/useCrud"
import { useModal } from "@/hooks/useModal"
import { useConfirmation } from "@/hooks/useConfirmation"
import { StatusBadge } from "@/components/StatusBadge"
import { departmentConfig } from "@/config/statusConfig"
import SearchFilterTabs from "@/components/SearchFilterTabs"
import { motion } from "framer-motion"
import { RoleBasedComponent } from "@/components/RoleBasedComponent"
import { StatsCards } from "@/components/StatsCards"
import { EntityModal } from "@/components/EntityModal"
import type { FieldConfig } from "@/components/EntityModal"
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'sonner';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  company: string;
  location: string;
  availability: string;
  project: string;
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
  availability: string;
  project: string;
  skills: string;
  experience: string;
  joinDate: string;
  reportsTo: string;
  [key: string]: string | number | boolean | string[] | undefined;
}

// Type guard for StaffMember
function isStaffMember(m: unknown): m is StaffMember {
  return (
    typeof m === 'object' && m !== null &&
    typeof (m as { id?: unknown }).id === 'number' &&
    typeof (m as { name?: unknown }).name === 'string' &&
    typeof (m as { email?: unknown }).email === 'string'
  );
}

function TeamMembersPage() {
  const { token } = useAuth();
  const router = useRouter();
  const renderCount = useRef(0);
  useEffect(() => { renderCount.current += 1; console.log('Staff render', renderCount.current, 'token:', token); }, [token]);
  
  // Use new DRY hooks
  const { data: staff, loading, error, refetch } = useStaffData(token || undefined);
  const { create, update, remove } = useStaffCrud(token || undefined);
  const { confirmDelete } = useConfirmation();
  
  // Modal management
  const addModal = useModal();
  const [editMode, setEditMode] = useState(false);
  const [editInitialValuesRaw, setEditInitialValues] = useState<StaffFormData | undefined>(undefined);
  const { confirmCreate, confirmUpdate } = useConfirmation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoize initial values to avoid unnecessary re-renders
  const editInitialValues = useMemo(() => editInitialValuesRaw, [editInitialValuesRaw]);

  // Local state for filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");

  // Handle URL query parameters for filters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const category = urlParams.get('category');
      
      if (category) {
        setDepartmentFilter(category);
        toast.info(`Filtering by: ${category}`);
      }
    }
  }, [router]);

  const typedStaff: StaffMember[] = staff.filter(isStaffMember);
  
  // Debug: Check for duplicates
  useEffect(() => {
    const ids = typedStaff.map(m => m.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      console.warn('⚠️ Duplicate staff IDs detected:', {
        total: ids.length,
        unique: uniqueIds.size,
        duplicates: ids.filter((id, index) => ids.indexOf(id) !== index)
      });
    }
  }, [typedStaff]);
  
  const totalMembers = typedStaff.length;
  const activeMembers = typedStaff.filter((m) => m.availability === "available").length;

  const filteredMembers = typedStaff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.skills.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAvailability = statusFilter === "all" || member.availability === statusFilter;
    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter;
    const matchesCompany = companyFilter === "all" || member.company === companyFilter;
    return matchesSearch && matchesAvailability && matchesDepartment && matchesCompany;
  });

  const companies = useMemo(() => {
    const companySet = new Set<string>();
    typedStaff.forEach((m) => {
      if (m.company) companySet.add(m.company);
    });
    return Array.from(companySet);
  }, [typedStaff]);
  
  const groupedByOwner = useMemo(() => {
    const map: Record<string, StaffMember[]> = {};
    companies.forEach((company) => {
      map[company] = filteredMembers.filter((member) => member.company === company);
    });
    return map;
  }, [companies, filteredMembers]);



  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _onEditStaff = (id: number) => {
    const member = typedStaff.find(m => m.id === id);
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
      availability: member.availability || "available",
      project: member.project || "",
      skills: member.skills.join(', '),
      experience: member.experience,
      joinDate: member.joinDate,
      reportsTo: member.reportsTo,
    });
    addModal.open();
  };



  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _handleDeleteStaff = async (id: number) => {
    // Find the staff member to get their name for confirmation
    const staffMember = typedStaff.find(member => member.id === id);
    const staffName = staffMember?.name || 'this staff member';
    
    // Show confirmation dialog
    const confirmed = await confirmDelete('staff member', staffName);
    if (!confirmed) {
      return;
    }
    
    await remove(id);
    refetch();
  };

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Designation', 'Department', 'Company', 'Location', 'Status'],
      ...typedStaff.map(m => [
        m.name,
        m.email,
        m.phone,
        m.designation,
        m.department,
        m.company,
        m.location,
        m.availability
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

  const availabilityOptions = [
    { value: "available", label: "Available" },
    { value: "busy", label: "Busy" },
    { value: "unavailable", label: "Unavailable" },
    { value: "on_leave", label: "On Leave" }
  ];
  const departmentOptions = departmentConfig;

  // For owner tabs
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<string>("all");
  const owners = companies;

  // Note: App Router doesn't have the same events API as Pages Router
  // Modal cleanup is handled by the modal's own close handlers

  // StaffCard and StaffListItem
  const StaffCard = ({ member }: { member: StaffMember }) => (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
      <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm hover:shadow-md">
        <CardContent className="p-6 cursor-pointer" onClick={() => router.push(`/staff/${member.id}`)}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-foreground">{member.name}</h4>
                <p className="text-sm text-muted-foreground">{member.designation}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge type="staff" value={member.availability} />
                  <Badge variant="outline" className="text-xs">{member.department}</Badge>
                </div>
              </div>
            </div>

          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="h-3 w-3 mr-2" />
              {member.email}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-3 w-3 mr-2" />
              {member.phone}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 mr-2" />
              {member.location}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{member.currentProjects} active projects</span>
            <span className="text-muted-foreground">{member.completedTasks} completed tasks</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const StaffListItem = ({ member }: { member: StaffMember }) => (
    <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
      <Card className="group hover:shadow-sm transition-all duration-200 border-0 shadow-none hover:bg-accent/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <Avatar>
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-foreground">{member.name}</h4>
                  <StatusBadge type="staff" value={member.availability} />
                  <Badge variant="outline" className="text-xs">{member.department}</Badge>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
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

          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const staffFields: FieldConfig[] = [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "Enter full name" },
    { name: "email", label: "Email", type: "text", required: true, placeholder: "Enter email address" },
    { name: "phone", label: "Phone", type: "tel", placeholder: "Enter phone number" },
    { name: "designation", label: "Designation", type: "text", required: true, placeholder: "Enter job title" },
    { name: "department", label: "Department", type: "select", required: true, options: departmentOptions },
    { name: "company", label: "Company", type: "select", required: true, options: [
      { value: "PSSL", label: "PSSL" },
      { value: "Prakhar Aviation", label: "Prakhar Aviation" },
      { value: "IIDT", label: "IIDT" }
    ]},
    { name: "location", label: "Location", type: "text", required: true, placeholder: "Enter work location" },
    { name: "availability", label: "Availability", type: "select", required: true, options: [
      { value: "available", label: "Available" },
      { value: "busy", label: "Busy" },
      { value: "unavailable", label: "Unavailable" },
      { value: "on_leave", label: "On Leave" }
    ]},
    { name: "project", label: "Project", type: "text", required: true, placeholder: "Enter current project" },
    { name: "skills", label: "Skills (comma-separated)", type: "text", required: true, placeholder: "e.g. Drone Pilot, Telemetry, Navigation" },
    { name: "experience", label: "Experience (years)", type: "number", placeholder: "Enter years of experience", min: 0, max: 50 },
    { name: "joinDate", label: "Join Date", type: "date", max: new Date().toISOString().split('T')[0] },
    { name: "reportsTo", label: "Reports To", type: "text", placeholder: "Enter supervisor name" },
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
              <Button className="text-black transition-all duration-200" 
              onClick={() => {
                setEditMode(false);
                setEditingId(null);
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
              key: "availability",
              label: "Availability",
              value: statusFilter,
              options: [
                { value: "all", label: "All Availability" },
                ...availabilityOptions.map((availability) => ({ value: availability.value, label: availability.label }))
              ],
              onValueChange: (value: string) => setStatusFilter(value)
            },
            {
              key: "department",
              label: "Department",
              value: departmentFilter,
              options: [
                { value: "all", label: "All Departments" },
                ...departmentOptions.map((dept) => ({ value: dept.value, label: dept.label }))
              ],
              onValueChange: (value: string) => setDepartmentFilter(value)
            }
          ]}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showViewToggle={true}
          owners={owners}
          groupedByOwner={groupedByOwner}
          renderGridItem={(member: StaffMember) => <StaffCard key={member.id} member={member} />}
          renderListItem={(member: StaffMember) => <StaffListItem key={member.id} member={member} />}
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

        {/* Add/Edit Modal */}
        <EntityModal
          open={addModal.isOpen}
          onClose={() => { addModal.close(); setEditMode(false); setEditInitialValues(undefined); }}
          onSubmit={async (data: StaffFormData) => {
            setIsSubmitting(true);
            try {
              const staffData: Omit<StaffMember, 'id' | 'avatar' | 'initials' | 'currentProjects' | 'completedTasks'> & { skills: string[] } = {
                ...data,
                skills: data.skills.split(",").map((s) => s.trim()),
              };
              
              if (editMode && editingId) {
                // Show confirmation for update
                const confirmed = await confirmUpdate('staff member', data.name);
                if (!confirmed) {
                  return false;
                }
                await update(editingId, staffData);
              } else {
                // Show confirmation for create
                const confirmed = await confirmCreate('staff member');
                if (!confirmed) {
                  return false;
                }
                await create(staffData);
              }
              
              addModal.close();
              setEditMode(false);
              setEditingId(null);
              refetch();
              return true;
            } catch (error) {
              console.error('Error submitting form:', error);
              return false;
            } finally {
              setIsSubmitting(false);
            }
          }}
          loading={isSubmitting}
          title={editMode ? "Edit Staff Member" : "Add New Staff Member"}
          buttonText={editMode ? "Save Changes" : "Create Member"}
          fields={staffFields}
          initialValues={editInitialValues}
        />
      </div>
    </BaseLayout>
  );
}

export default function StaffPage() {
  return (
    <ProtectedRoute>
      <TeamMembersPage />
    </ProtectedRoute>
  );
}
