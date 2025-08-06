import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LuEye, LuPencil, LuTrash2, LuCheck, LuDownload } from 'react-icons/lu';
import type { Bill } from '../../interfaces/Bill';

interface BillCardProps {
  bill: Bill;
  onView: () => void;
  onApprove: () => void;
  onDelete: () => void;
  onEdit?: () => void;
  canApprove?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

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

export const BillCard: React.FC<BillCardProps> = ({ bill, onView, onApprove, onDelete, onEdit, canApprove, canEdit, canDelete }) => (
  <Card>
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
        </div>
      </div>
    </CardContent>
  </Card>
); 