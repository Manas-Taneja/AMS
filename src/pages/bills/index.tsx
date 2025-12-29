import React, { useState, useEffect, useMemo } from 'react';
import { BaseLayout } from '@/components/BaseLayout';
import { UnifiedHeader } from '@/components/UnifiedHeader';
import { BillsTable } from '@/components/bills/BillsTable';
import { UploadBillDialog } from '@/components/bills/UploadBillDialog';
import { ViewBillDialog } from '@/components/bills/ViewBillDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Bill } from '@/interfaces/Bill';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiService } from '@/services/api';
import { useConfirmation } from '@/hooks/useConfirmation';
import { StatsCards } from '@/components/StatsCards';
import { ManagerOrAdmin } from '@/components/RoleBasedComponent';
import { useApiData } from '@/hooks/useApiData';
import { API_ENDPOINTS, SUPABASE_CONFIG } from '@/config';
import { supabase, supabaseEnabled } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

interface BillStats {
  total_bills: number;
  pending_bills: number;
  approved_bills: number;
  total_amount: number;
}

const Bills: React.FC = () => {
  const { token } = useAuth();
  const useSupabase = SUPABASE_CONFIG.USE_SUPABASE && supabaseEnabled && supabase;
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [filters, setFilters] = useState({ search: '', status: '', category: '', vendor: '' });
  const [dialogs, setDialogs] = useState({ upload: false, view: false });
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, billId: null as number | null, loading: false });
  const { confirmDelete } = useConfirmation();

  // Fetch bills using Supabase or API
  const { data: bills, loading, error, refetch } = useApiData<Bill>({
    endpoint: API_ENDPOINTS.BILLS,
    token: token || undefined,
    queryParams: {},
  });

  // Calculate stats from bills data
  const stats = useMemo<BillStats | null>(() => {
    if (!bills || bills.length === 0) return null;
    return {
      total_bills: bills.length,
      pending_bills: bills.filter(b => b.status === 'pending').length,
      approved_bills: bills.filter(b => b.status === 'approved').length,
      total_amount: bills.reduce((sum, b) => sum + (b.amount || 0), 0),
    };
  }, [bills]);

  // Extract categories and vendors from bills
  const categories = useMemo<string[]>(() => {
    const cats = new Set<string>();
    bills.forEach(bill => {
      if (bill.category) cats.add(bill.category);
    });
    return Array.from(cats).sort();
  }, [bills]);

  const vendors = useMemo<string[]>(() => {
    const vends = new Set<string>();
    bills.forEach(bill => {
      if (bill.vendor) vends.add(bill.vendor);
    });
    return Array.from(vends).sort();
  }, [bills]);

  // Apply filters locally
  useEffect(() => {
    let filtered = bills || [];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(bill => 
        bill.title.toLowerCase().includes(searchLower) ||
        bill.vendor.toLowerCase().includes(searchLower) ||
        bill.category.toLowerCase().includes(searchLower) ||
        bill.description?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(bill => bill.status === filters.status);
    }
    
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(bill => bill.category === filters.category);
    }
    
    if (filters.vendor && filters.vendor !== 'all') {
      filtered = filtered.filter(bill => bill.vendor === filters.vendor);
    }
    
    setFilteredBills(filtered);
  }, [bills, filters]);

  // Handlers
  const requestDelete = (bill: Bill) => {
    setDeleteDialog({ open: true, billId: bill.id, loading: false });
  };

  const handleDelete = async () => {
    if (!deleteDialog.billId) return;
    
    // Find the bill to get its name for confirmation
    const billToDelete = (bills || []).find(bill => bill.id === deleteDialog.billId);
    const billName = billToDelete?.title || billToDelete?.vendor || 'this bill';
    
    // Show confirmation dialog
    const confirmed = await confirmDelete('bill', billName);
    if (!confirmed) {
      setDeleteDialog({ open: false, billId: null, loading: false });
      return;
    }
    
    setDeleteDialog(d => ({ ...d, loading: true }));
    try {
      if (useSupabase && supabase) {
        const { error: deleteError } = await supabase
          .from('bills')
          .delete()
          .eq('id', deleteDialog.billId);
        
        if (deleteError) throw deleteError;
        toast.success('Bill deleted successfully');
        refetch();
      } else {
        await apiService.delete(`/api/bills/${deleteDialog.billId}`, token || undefined);
        toast.success('Bill deleted successfully');
        refetch();
      }
      setDeleteDialog({ open: false, billId: null, loading: false });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete bill');
      setDeleteDialog(d => ({ ...d, loading: false }));
    }
  };

  const handleView = (bill: Bill) => {
    setSelectedBill(bill);
    setDialogs(d => ({ ...d, view: true }));
  };

  // Prepare stats cards
  const statsCards = stats ? [
    {
      icon: <div className="h-6 w-6 text-blue-600">📄</div>,
      label: 'Total Bills',
      value: stats.total_bills,
      bgClass: 'bg-blue-100',
    },
    {
      icon: <div className="h-6 w-6 text-yellow-600">⏳</div>,
      label: 'Pending',
      value: stats.pending_bills,
      bgClass: 'bg-yellow-100',
    },
    {
      icon: <div className="h-6 w-6 text-green-600">✅</div>,
      label: 'Approved',
      value: stats.approved_bills,
      bgClass: 'bg-green-100',
    },
    {
      icon: <div className="h-6 w-6 text-purple-600">💰</div>,
      label: 'Total Amount',
      value: `$${stats.total_amount.toFixed(2)}`,
      bgClass: 'bg-purple-100',
    },
  ] : [];

  if (loading) {
    return <BaseLayout loading={true}><div className="p-8" /></BaseLayout>;
  }
  if (error) {
    return <BaseLayout error={error}><div className="p-8" /></BaseLayout>;
  }

  return (
    <BaseLayout>
      <div className="p-8 text-black max-w-7xl mx-auto">
        <UnifiedHeader
          title="Bills Management"
          subtitle="Upload and manage bills for approval"
          onAdd={() => setDialogs(d => ({ ...d, upload: true }))}
          addLabel="Upload Bill"
        />
        
        {/* Stats Cards */}
        {stats && <StatsCards cards={statsCards} gridCols="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" />}
        
        {/* Filters */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                placeholder="Search bills..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select value={filters.status || 'all'} onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select value={filters.category || 'all'} onValueChange={(value) => setFilters(f => ({ ...f, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
              <Select value={filters.vendor || 'all'} onValueChange={(value) => setFilters(f => ({ ...f, vendor: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map(vendor => (
                    <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {filteredBills.length} of {bills.length} bills
            </div>
            <Button
              variant="secondary"
              onClick={() => setFilters({ search: '', status: 'all', category: 'all', vendor: 'all' })}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white rounded-lg border">
          <BillsTable
            bills={filteredBills}
            onView={handleView}
            onDelete={requestDelete}
          />
        </div>

        {/* Upload Bill Dialog (Manager/Admin only) */}
        <ManagerOrAdmin>
          <UploadBillDialog
            isOpen={dialogs.upload}
            onOpenChange={isOpen => setDialogs(d => ({ ...d, upload: isOpen }))}
            onSuccess={() => { refetch(); }}
            categories={categories}
            vendors={vendors}
          />
        </ManagerOrAdmin>
        
        <ViewBillDialog
          bill={selectedBill}
          isOpen={dialogs.view}
          onOpenChange={isOpen => setDialogs(d => ({ ...d, view: isOpen }))}
        />
        
        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={open => setDeleteDialog(d => ({ ...d, open, billId: open ? d.billId : null, loading: false }))}
          title="Delete Bill"
          description="Are you sure you want to delete this bill? This action cannot be undone."
          onConfirm={handleDelete}
          confirmLabel="Delete"
          loading={deleteDialog.loading}
        />
      </div>
    </BaseLayout>
  );
};

export default function BillsPage() {
  return (
    <ProtectedRoute>
      <Bills />
    </ProtectedRoute>
  );
} 