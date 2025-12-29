import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import type { Bill } from '../../interfaces/Bill';
import Image from 'next/image';

interface ViewBillDialogProps {
  bill: Bill | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const ViewBillDialog: React.FC<ViewBillDialogProps> = ({ bill, isOpen, onOpenChange }) => {
  if (!bill) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{bill.title}</DialogTitle>
          <DialogDescription>Details for bill from {bill.vendor}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div>
            <h4 className="font-semibold mb-2">Bill Details</h4>
            <div className="text-sm space-y-1">
              <p><strong>Amount:</strong> {bill.currency} {bill.amount.toFixed(2)}</p>
              <p><strong>Vendor:</strong> {bill.vendor}</p>
              <p><strong>Category:</strong> {bill.category}</p>
              <p><strong>Bill Date:</strong> {new Date(bill.bill_date).toLocaleDateString()}</p>
              {bill.due_date && <p><strong>Due Date:</strong> {new Date(bill.due_date).toLocaleDateString()}</p>}
              <p><strong>Status:</strong> {bill.status}</p>
              <p><strong>Uploaded:</strong> {new Date(bill.created_at).toLocaleDateString()}</p>
              {bill.notes && <p><strong>Notes:</strong> {bill.notes}</p>}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Bill Image/File</h4>
            {bill.file_url ? (
              <a href={bill.file_url} target="_blank" rel="noopener noreferrer">
                <Image
                  src={bill.file_url}
                  alt={`Bill for ${bill.title}`}
                  width={400}
                  height={400}
                  className="rounded-lg border object-contain max-h-80 w-full"
                />
              </a>
            ) : (
              <p className="text-muted-foreground">No image available.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 