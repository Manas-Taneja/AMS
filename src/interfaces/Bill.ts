export interface Bill {
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
  file_url: string; // for image preview
  file_size: number;
  uploaded_by: number;
  approved_by?: number;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
} 