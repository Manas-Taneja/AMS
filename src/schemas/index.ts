/**
 * Validation Schemas using Zod
 * 
 * Centralized validation schemas for all forms in the application
 */

import { z } from 'zod';

// =======================
// Authentication Schemas
// =======================

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(1, 'Full name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// =======================
// Training Schemas
// =======================

export const trainingSchema = z.object({
  name: z.string().min(1, 'Course name is required').max(200),
  institution: z.string().min(1, 'Institution is required').max(200),
  duration: z.string().min(1, 'Duration is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).catch('beginner'),
  description: z.string().optional(),
  full_description: z.string().optional(),
  prerequisites: z.string().optional(),
  learning_objectives: z.string().optional(),
  course_outline: z.string().optional(),
  instructor_name: z.string().optional(),
  instructor_credentials: z.string().optional(),
  instructor_experience: z.string().optional(),
  instructor_image: z.string().url().optional().or(z.literal('')),
  schedule_start_date: z.string().optional(),
  schedule_end_date: z.string().optional(),
  schedule_format: z.string().optional(),
  schedule_location: z.string().optional(),
  pricing_amount: z.number().min(0).optional().or(z.string()),
  pricing_currency: z.string().default('USD'),
  pricing_includes: z.string().optional(),
  enrolled_count: z.number().int().min(0).default(0),
  completed_count: z.number().int().min(0).default(0),
  max_capacity: z.number().int().min(1).optional(),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  category: z.string().optional(),
  tags: z.string().optional(),
});

// =======================
// Staff Schemas
// =======================

export const staffSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().refine(
    (val) => !val || /^[\+]?[1-9][\d\-\s\(\)]{7,20}$/.test(val.replace(/[\s\-\(\)]/g, '')),
    'Invalid phone number'
  ),
  department: z.string().min(1, 'Department is required'),
  status: z.enum(['active', 'inactive', 'on-leave', 'terminated']).default('active'),
  designation: z.string().min(1, 'Designation is required'),
  skills: z.string().min(1, 'Skills are required'),
  location: z.string().min(1, 'Location is required'),
  availability: z.string().min(1, 'Availability is required'),
  project: z.string().min(1, 'Project is required'),
  company: z.string().min(1, 'Company is required'),
  reports_to: z.string().optional(),
  experience: z.string().optional(),
  join_date: z.string().optional(),
});

// =======================
// Component/Asset Schemas
// =======================

export const componentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  category: z.string().min(1, 'Category is required'),
  status: z.string().min(1, 'Status is required'),
  location: z.string().min(1, 'Location is required'),
  project: z.string().min(1, 'Project is required'),
  owner: z.string().min(1, 'Owner is required'),
  description: z.string().optional(),
  serial_number: z.string().optional(),
  purchase_date: z.string().optional(),
  warranty_expiry: z.string().optional(),
});

// =======================
// Location Schemas
// =======================

export const locationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(200),
  address: z.string().min(1, 'Address is required').max(500),
  team: z.number().int().min(0, 'Team size must be positive'),
  manager: z.string().min(1, 'Manager is required'),
  project: z.string().min(1, 'Project is required'),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
  type: z.enum(['branch', 'office', 'warehouse', 'remote']).default('branch'),
  point_of_contact: z.string().default(''),
  asset_count: z.number().int().min(0).default(0),
  avatar: z.string().url().optional().or(z.literal('')),
});

// =======================
// Project Schemas
// =======================

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  status: z.enum(['active', 'planned', 'on-hold', 'completed', 'cancelled']).default('active'),
  progress: z.number().int().min(0).max(100, 'Progress must be between 0 and 100'),
  category: z.string().optional(),
  funding_type: z.string().optional(),
  funding_body: z.string().optional(),
  funding_received: z.number().min(0).optional(),
  report_links: z.string().optional(),
  thumbnail_url: z.string().url().optional().or(z.literal('')),
});

// =======================
// Bill Schemas
// =======================

export const billSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  amount: z.number().min(0, 'Amount must be positive'),
  currency: z.string().default('USD'),
  bill_date: z.string().min(1, 'Bill date is required'),
  due_date: z.string().optional(),
  vendor: z.string().min(1, 'Vendor is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['pending', 'approved', 'rejected', 'paid']).default('pending'),
  notes: z.string().optional(),
});

// =======================
// Transfer/Action Schemas
// =======================

export const transferAssetSchema = z.object({
  assetId: z.number().int().positive(),
  fromLocation: z.string().min(1),
  toLocation: z.string().min(1),
  transferDate: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.fromLocation !== data.toLocation, {
  message: "Cannot transfer to the same location",
  path: ["toLocation"],
});

// =======================
// Type Exports
// =======================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TrainingInput = z.infer<typeof trainingSchema>;
export type StaffInput = z.infer<typeof staffSchema>;
export type ComponentInput = z.infer<typeof componentSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type BillInput = z.infer<typeof billSchema>;
export type TransferAssetInput = z.infer<typeof transferAssetSchema>;

// =======================
// Helper Functions
// =======================

/**
 * Validate data against a schema
 * Returns { success: true, data } or { success: false, errors }
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true as const, data: result.data };
  }
  
  return {
    success: false as const,
    errors: result.error.flatten().fieldErrors,
  };
}

/**
 * Get error message from Zod error
 */
export function getZodErrorMessage(error: z.ZodError): string {
  const firstError = error.issues[0];
  return firstError?.message || 'Validation error';
}
