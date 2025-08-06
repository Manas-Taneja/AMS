import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input as ShadInput } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";

export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "tel";
  required?: boolean;
  options?: { value: string; label: string }[]; // for select
  placeholder?: string;
  min?: number | string;
  max?: number | string;
  pattern?: string; // for input pattern validation
};

interface EntityModalProps<T extends Record<string, unknown> = Record<string, unknown>> {
  open: boolean;
  onClose: () => void;
  /**
   * Called when the form is submitted. Should return a Promise<boolean>:
   *   - true: close the modal
   *   - false: keep the modal open
   */
  onSubmit: (data: T) => Promise<boolean>;
  loading?: boolean;
  title: string;
  buttonText: string;
  fields: FieldConfig[];
  initialValues?: T;
}

export function EntityModal<T extends Record<string, unknown> = Record<string, unknown>>({ open, onClose, onSubmit, loading, title, buttonText, fields, initialValues = {} as T }: EntityModalProps<T>) {
  const [form, setForm] = useState<T>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const prevInitialValues = useRef<T>(initialValues);

  useEffect(() => {
    // Update form when modal opens or initialValues change
    if (open) {
      // Only update if initialValues have actually changed
      const currentInitialValuesStr = JSON.stringify(initialValues);
      const prevInitialValuesStr = JSON.stringify(prevInitialValues.current);
      
      if (currentInitialValuesStr !== prevInitialValuesStr) {
        setForm(initialValues || {} as T);
        prevInitialValues.current = initialValues;
      }
    }
  }, [initialValues, open]);

  const handleChange = (name: string, value: unknown) => {
    setForm(f => ({ ...f, [name]: value } as T));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Real-time email validation
    if (name === 'email' && typeof value === 'string' && value) {
      if (!value.includes('@')) {
        setErrors(prev => ({ ...prev, [name]: 'Invalid email' }));
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setErrors(prev => ({ ...prev, [name]: 'Please enter a valid email address' }));
        } else {
          setErrors(prev => ({ ...prev, [name]: '' }));
        }
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      const value = form[field.name];
      
      // Required validation
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }
      
      // Number validation
      if (field.type === 'number' && value) {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          newErrors[field.name] = `${field.label} must be a valid number`;
          return;
        }
        if (field.min !== undefined && typeof field.min === 'number' && numValue < field.min) {
          newErrors[field.name] = `${field.label} must be at least ${field.min}`;
          return;
        }
        if (field.max !== undefined && typeof field.max === 'number' && numValue > field.max) {
          newErrors[field.name] = `${field.label} must be no more than ${field.max}`;
          return;
        }
      }
      
      // Email validation
      if (field.name === 'email' && value && typeof value === 'string') {
        if (!value.includes('@')) {
          newErrors[field.name] = 'Invalid email';
          return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.name] = 'Please enter a valid email address';
          return;
        }
      }
      
      // Date validation - join date cannot be in the future
      if (field.name === 'joinDate' && value && typeof value === 'string') {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Set to end of today to allow today's date
        
        if (selectedDate > today) {
          newErrors[field.name] = 'Join date cannot be in the future';
          return;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setSubmitting(true);
    try {
      const shouldClose = await onSubmit(form);
      setSubmitting(false);
      if (shouldClose) {
        onClose();
      }
    } catch (error) {
      setSubmitting(false);
      console.error('Modal submission error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="bg-white text-black max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2">
          {fields.map(field => (
            <div key={field.name}>
              <Label htmlFor={field.name}>{field.label}{field.required && ' *'}</Label>
              {field.type === "select" ? (
                <Select
                  value={String(form[field.name] ?? "")}
                  onValueChange={(value: string) => handleChange(field.name, value)}
                >
                  <SelectTrigger className={`focus:!ring-1 text-black data-[placeholder]:text-black ${errors[field.name] ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {field.options?.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-black">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  required={field.required}
                  value={String(form[field.name] ?? '')}
                  onChange={e => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className={`focus:!ring-1 w-full border rounded p-2 min-h-[80px] ${errors[field.name] ? 'border-red-500' : ''}`}
                />
              ) : (
                <ShadInput
                  id={field.name}
                  type={field.type}
                  required={field.required}
                  min={field.min}
                  max={field.max}
                  pattern={field.pattern}
                  value={form[field.name] as string | number | undefined}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (field.type === 'tel') {
                      // Allow: backspace, delete, tab, escape, enter, and navigation keys
                      if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode) ||
                          // Allow: numbers, space, dash, parentheses, plus sign
                          /[\d\s\-\(\)\+]/.test(e.key)) {
                        return;
                      }
                      // Prevent all other keys
                      e.preventDefault();
                    } else if (field.type === 'number') {
                      // Allow: backspace, delete, tab, escape, enter, navigation keys, and numbers
                      if ([8, 9, 27, 13, 46, 37, 38, 39, 40].includes(e.keyCode) ||
                          // Allow: numbers, decimal point, minus sign
                          /[\d\.\-]/.test(e.key)) {
                        return;
                      }
                      // Prevent all other keys
                      e.preventDefault();
                    }
                  }}
                  onChange={e => {
                    if (field.type === 'tel') {
                      // For tel inputs, only allow numbers, spaces, dashes, parentheses, and plus sign
                      const value = e.target.value;
                      const phoneRegex = /^[\d\s\-\(\)\+]*$/;
                      if (phoneRegex.test(value) || value === '') {
                        handleChange(field.name, value);
                      }
                    } else if (field.type === 'number') {
                      // For number inputs, only allow numbers, decimal point, and minus sign
                      const value = e.target.value;
                      const numberRegex = /^[\d\.\-]*$/;
                      if (numberRegex.test(value) || value === '') {
                        handleChange(field.name, value);
                      }
                    } else if (field.name === 'serial_number') {
                      // Auto-capitalize serial number input
                      const value = e.target.value.toUpperCase();
                      handleChange(field.name, value);
                    } else {
                      handleChange(field.name, e.target.value);
                    }
                  }}
                  placeholder={field.placeholder}
                  className={`focus:!ring-1 ${errors[field.name] ? 'border-red-500' : ''}`}
                />
              )}
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}
          
          {/* Form buttons inside the form */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" className="bg-white text-black border-black" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || loading}>
              {submitting || loading ? `${buttonText}...` : buttonText}
            </Button>
          </div>
        </form>
        <DialogFooter className="flex-shrink-0">
          {/* Empty footer - buttons moved inside form */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 