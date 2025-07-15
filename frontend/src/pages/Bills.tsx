import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useAuth } from '../context/AuthContext';
import { Upload, Plus, Search, Filter, Download, Eye, Edit, Trash2, CheckCircle } from 'lucide-react';
import { BaseLayout } from '../components/BaseLayout';
import { UnifiedHeader } from '../components/UnifiedHeader';

interface Bill {
  id: number;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  bill_date: string;
  due_date?: string;
  vendor: string;
  category: string;
  status: string;
  file_name: string;
  file_size: number;
  uploaded_by: number;
  approved_by?: number;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface BillStats {
  total_bills: number;
  pending_bills: number;
  approved_bills: number;
  total_amount: number;
}

const Bills: React.FC = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<BillStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [vendors, setVendors] = useState<string[]>([]);
  const [statuses] = useState(['pending', 'approved', 'rejected', 'paid']);
  
  // Upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'USD',
    bill_date: '',
    due_date: '',
    vendor: '',
    category: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Approval dialog state
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [approvalStatus, setApprovalStatus] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
      if (vendorFilter && vendorFilter !== 'all') params.append('vendor', vendorFilter);

      const response = await fetch(`/api/bills?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch bills');
      const data = await response.json();
      setBills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/bills/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/bills/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/bills/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch vendors');
      const data = await response.json();
      setVendors(data);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchStats();
    fetchCategories();
    fetchVendors();
  }, [searchTerm, statusFilter, categoryFilter, vendorFilter]);

  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.title || !uploadForm.amount || !uploadForm.vendor || !uploadForm.category) {
      setError('Please fill in all required fields and select a file');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('access_token');
      const billData = {
        ...uploadForm,
        amount: parseFloat(uploadForm.amount),
        bill_date: uploadForm.bill_date || new Date().toISOString(),
        due_date: uploadForm.due_date || null,
      };

      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) throw new Error('Failed to upload bill');
      
      // Reset form and close dialog
      setUploadForm({
        title: '',
        description: '',
        amount: '',
        currency: 'USD',
        bill_date: '',
        due_date: '',
        vendor: '',
        category: '',
        notes: ''
      });
      setSelectedFile(null);
      setUploadDialogOpen(false);
      setError(null);
      
      // Refresh bills
      fetchBills();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload bill');
    } finally {
      setUploading(false);
    }
  };

  const handleApproval = async () => {
    if (!selectedBill || !approvalStatus) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/bills/${selectedBill.id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: approvalStatus,
          notes: approvalNotes
        }),
      });

      if (!response.ok) throw new Error('Failed to update bill status');
      
      setApprovalDialogOpen(false);
      setSelectedBill(null);
      setApprovalStatus('');
      setApprovalNotes('');
      
      // Refresh bills
      fetchBills();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bill status');
    }
  };

  const handleDelete = async (billId: number) => {
    if (!confirm('Are you sure you want to delete this bill?')) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete bill');
      
      // Refresh bills
      fetchBills();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bill');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      approved: { color: 'bg-green-100 text-green-800', icon: '✅' },
      rejected: { color: 'bg-red-100 text-red-800', icon: '❌' },
      paid: { color: 'bg-blue-100 text-blue-800', icon: '💰' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={config.color}>
        <span className="mr-1">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleExport = () => {
    // Export functionality
    alert('Export bills clicked')
  }

  if (loading) {
    return (
      <BaseLayout loading={true}>
        <div className="p-8" />
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout error={error}>
        <div className="p-8" />
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="p-8">
        {/* Unified Header */}
        <UnifiedHeader
          title="Bills Management"
          subtitle="Upload and manage bills for approval"
          onAdd={() => setUploadDialogOpen(true)}
          addLabel="Upload Bill"
          onExport={handleExport}
          exportLabel="Export Bills"
        />

        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_bills}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending_bills}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approved_bills}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.total_amount.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search bills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vendor">Vendor</Label>
                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All vendors</SelectItem>
                    {vendors.map(vendor => (
                      <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bills List */}
        <div className="space-y-4">
          {bills.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bills found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || statusFilter || categoryFilter || vendorFilter
                    ? 'Try adjusting your filters'
                    : 'Get started by uploading your first bill'}
                </p>
                {!searchTerm && !statusFilter && !categoryFilter && !vendorFilter && (
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload First Bill
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            bills.map((bill) => (
              <Card key={bill.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{bill.title}</h3>
                        {getStatusBadge(bill.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                        <div>
                          <span className="font-medium">Amount:</span> {bill.currency} {bill.amount.toFixed(2)}
                        </div>
                        <div>
                          <span className="font-medium">Vendor:</span> {bill.vendor}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {bill.category}
                        </div>
                      </div>
                      {bill.description && (
                        <p className="text-sm text-muted-foreground mb-3">{bill.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Bill Date: {formatDate(bill.bill_date)}</span>
                        {bill.due_date && <span>Due Date: {formatDate(bill.due_date)}</span>}
                        <span>File: {bill.file_name} ({formatFileSize(bill.file_size)})</span>
                        <span>Uploaded: {formatDate(bill.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      {(user?.role === 'admin' || user?.role === 'manager') && bill.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBill(bill);
                            setApprovalDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {(user?.role === 'admin' || user?.role === 'manager' || bill.uploaded_by === user?.id) && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {(user?.role === 'admin' || user?.role === 'manager') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(bill.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white">
            <DialogHeader>
              <DialogTitle>Upload New Bill</DialogTitle>
              <DialogDescription>
                Fill in the bill details and upload the corresponding file.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    placeholder="Bill title"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={uploadForm.amount}
                    onChange={(e) => setUploadForm({...uploadForm, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={uploadForm.currency} onValueChange={(value) => setUploadForm({...uploadForm, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={uploadForm.category} onValueChange={(value) => setUploadForm({...uploadForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Services">Services</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bill_date">Bill Date</Label>
                  <Input
                    id="bill_date"
                    type="date"
                    value={uploadForm.bill_date}
                    onChange={(e) => setUploadForm({...uploadForm, bill_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={uploadForm.due_date}
                    onChange={(e) => setUploadForm({...uploadForm, due_date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="vendor">Vendor *</Label>
                <Input
                  id="vendor"
                  value={uploadForm.vendor}
                  onChange={(e) => setUploadForm({...uploadForm, vendor: e.target.value})}
                  placeholder="Vendor name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Bill description"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm({...uploadForm, notes: e.target.value})}
                  placeholder="Additional notes"
                />
              </div>
              <div>
                <Label htmlFor="file">Bill File *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Bill'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve/Reject Bill</DialogTitle>
              <DialogDescription>
                Review and approve or reject the selected bill.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="approval-status">Status</Label>
                <Select value={approvalStatus} onValueChange={setApprovalStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="approval-notes">Notes</Label>
                <Textarea
                  id="approval-notes"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApproval} disabled={!approvalStatus}>
                {approvalStatus === 'approved' ? 'Approve' : 'Reject'} Bill
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BaseLayout>
  );
};

export default Bills; 