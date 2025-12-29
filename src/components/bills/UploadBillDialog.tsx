import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import Image from 'next/image';

interface UploadBillDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess: () => void;
  categories?: string[];
  vendors?: string[];
}

export const UploadBillDialog: React.FC<UploadBillDialogProps> = ({ isOpen, onOpenChange, onSuccess, categories = [], vendors = [] }) => {
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
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file && file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.title || !uploadForm.amount || !uploadForm.vendor || !uploadForm.category) {
      setError('Please fill in all required fields and select a file');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    Object.entries(uploadForm).forEach(([key, value]) => formData.append(key, value));
    formData.append('billFile', selectedFile, selectedFile.name);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload bill');
      setUploadForm({
        title: '', description: '', amount: '', currency: 'USD', bill_date: '', due_date: '', vendor: '', category: '', notes: ''
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload bill');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-black">Upload New Bill</DialogTitle>
          <DialogDescription className="text-black">Fill in the bill details and upload the corresponding file.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-black mb-1">Title *</Label>
              <Input id="title" value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} placeholder="Bill title" className="text-black placeholder:text-gray-500 focus:!border-none focus:!ring-2" />
            </div>
            <div>
              <Label htmlFor="amount" className="text-black mb-1">Amount *</Label>
              <Input 
                id="amount" 
                type="number" 
                step="0.01" 
                min="0"
                value={uploadForm.amount} 
                onChange={e => setUploadForm({ ...uploadForm, amount: e.target.value })} 
                placeholder="0.00" 
                className="text-black placeholder:text-gray-500 focus:!border-none focus:!ring-2" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency" className="text-black mb-1">Currency</Label>
              <Select value={uploadForm.currency} onValueChange={(value: string) => setUploadForm({ ...uploadForm, currency: value })}>
                <SelectTrigger className="text-black focus:outline-none focus-visible:outline-none">
                  <SelectValue className="text-black focus:outline-none focus-visible:outline-none" />
                </SelectTrigger>
                <SelectContent className="text-black focus:outline-none focus-visible:outline-none bg-white">
                  <SelectItem value="USD" className="text-black">USD</SelectItem>
                  <SelectItem value="EUR" className="text-black">EUR</SelectItem>
                  <SelectItem value="GBP" className="text-black">GBP</SelectItem>
                  <SelectItem value="INR" className="text-black">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category" className="text-black mb-1">Category *</Label>
              <Select value={uploadForm.category} onValueChange={(value: string) => setUploadForm({ ...uploadForm, category: value })}>
                <SelectTrigger className="text-black focus:outline-none focus-visible:outline-none">
                  <SelectValue placeholder="Select category" className="text-black focus:outline-none focus-visible:outline-none" />
                </SelectTrigger>
                <SelectContent className="text-black focus:outline-none focus-visible:outline-none bg-white">
                  {categories.length > 0 ? categories.map(category => (
                    <SelectItem key={category} value={category} className="text-black focus:outline-none focus-visible:outline-none">{category}</SelectItem>
                  )) : (
                    <>
                      <SelectItem value="Utilities" className="text-black focus:outline-none focus-visible:outline-none">Utilities</SelectItem>
                      <SelectItem value="Equipment" className="text-black focus:outline-none focus-visible:outline-none">Equipment</SelectItem>
                      <SelectItem value="Services" className="text-black focus:outline-none focus-visible:outline-none">Services</SelectItem>
                      <SelectItem value="Software" className="text-black focus:outline-none focus-visible:outline-none">Software</SelectItem>
                      <SelectItem value="Travel" className="text-black focus:outline-none focus-visible:outline-none">Travel</SelectItem>
                      <SelectItem value="Office Supplies" className="text-black focus:outline-none focus-visible:outline-none">Office Supplies</SelectItem>
                      <SelectItem value="Other" className="text-black focus:outline-none focus-visible:outline-none">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bill_date" className="text-black mb-1">Bill Date</Label>
              <Input id="bill_date" type="date" value={uploadForm.bill_date} onChange={e => setUploadForm({ ...uploadForm, bill_date: e.target.value })} className="text-black focus:!border-none focus:!ring-2" />
            </div>
            <div>
              <Label htmlFor="due_date" className="text-black mb-1">Due Date</Label>
              <Input id="due_date" type="date" value={uploadForm.due_date} onChange={e => setUploadForm({ ...uploadForm, due_date: e.target.value })} className="text-black focus:!border-none focus:!ring-2" />
            </div>
          </div>
          <div>
            <Label htmlFor="vendor" className="text-black mb-1">Vendor *</Label>
            <Select value={uploadForm.vendor} onValueChange={(value: string) => setUploadForm({ ...uploadForm, vendor: value })}>
              <SelectTrigger className="text-black focus:outline-none focus-visible:outline-none">
                <SelectValue placeholder="Select vendor" className="text-black focus:outline-none focus-visible:outline-none" />
              </SelectTrigger>
              <SelectContent className="text-black focus:outline-none focus-visible:outline-none bg-white">
                {vendors.length > 0 ? vendors.map(vendor => (
                  <SelectItem key={vendor} value={vendor} className="text-black focus:outline-none focus-visible:outline-none">{vendor}</SelectItem>
                )) : (
                  <SelectItem value="" className="text-black focus:outline-none focus-visible:outline-none">Enter vendor manually</SelectItem>
                )}
              </SelectContent>
            </Select>
            {uploadForm.vendor === '' && (
              <Input
                className="mt-2 text-black focus:!border-none focus:!ring-2"
                placeholder="Vendor name"
                value={uploadForm.vendor}
                onChange={e => setUploadForm({ ...uploadForm, vendor: e.target.value })}
              />
            )}
          </div>
          <div>
            <Label htmlFor="description" className="text-black mb-1">Description</Label>
            <Textarea id="description" value={uploadForm.description} onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })} placeholder="Bill description" className="text-black placeholder:text-gray-500 focus:!border-none focus:!ring-2" />
          </div>
          <div>
            <Label htmlFor="notes" className="text-black mb-1">Notes</Label>
            <Textarea id="notes" value={uploadForm.notes} onChange={e => setUploadForm({ ...uploadForm, notes: e.target.value })} placeholder="Additional notes" className="text-black placeholder:text-gray-500 focus:!border-none focus:!ring-2" />
          </div>
          <div>
            <Label htmlFor="file" className="text-black mb-1">Bill File *</Label>
            <Input id="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileChange} className="text-black focus:!border-none focus:!ring-2" />
            {selectedFile && (
              <p className="text-sm text-black mt-1">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
            {previewUrl && (
              <Image src={previewUrl} alt="Preview" width={160} height={160} className="mt-2 rounded border max-h-40" />
            )}
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-black border-black bg-white hover:bg-gray-100 focus:outline-none focus-visible:outline-none">
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading} className="text-black bg-green-200 hover:bg-green-300 focus:outline-none focus-visible:outline-none">
            {uploading ? 'Uploading...' : 'Upload Bill'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 