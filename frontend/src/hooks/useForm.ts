import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

interface ValidationRule<T> {
  field: keyof T;
  validator: (value: unknown, formData: T) => string | null;
  message?: string;
}

interface UseFormOptions<T> {
  initialData: T;
  validationRules?: ValidationRule<T>[];
  onSubmit?: (data: T) => Promise<void> | void;
  onReset?: () => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

interface UseFormReturn<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  setFieldValue: (field: keyof T, value: unknown) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  validateField: (field: keyof T) => string | null;
  validateForm: () => boolean;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
  resetField: (field: keyof T) => void;
}

export function useForm<T extends Record<string, unknown>>({
  initialData,
  validationRules = [],
  onSubmit,
  onReset,
  autoSave = false,
  autoSaveDelay = 1000,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalData] = useState<T>(initialData);

  // Check if form is dirty
  const isDirty = JSON.stringify(data) !== JSON.stringify(originalData);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || !isDirty || isSubmitting) return;

    const timeoutId = setTimeout(() => {
      // Auto-save logic could be implemented here
      console.log('Auto-saving...', data);
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [data, autoSave, autoSaveDelay, isDirty, isSubmitting]);

  // Validation function for a single field
  const validateField = useCallback((field: keyof T): string | null => {
    const fieldRules = validationRules.filter(rule => rule.field === field);
    
    for (const rule of fieldRules) {
      const error = rule.validator(data[field], data);
      if (error) {
        return rule.message || error;
      }
    }
    
    return null;
  }, [data, validationRules]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let hasErrors = false;

    validationRules.forEach(rule => {
      const error = rule.validator(data[rule.field], data);
      if (error) {
        newErrors[rule.field] = rule.message || error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  }, [data, validationRules]);

  // Set field value
  const setFieldValue = useCallback((field: keyof T, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Set field error
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  // Set field touched
  const setFieldTouched = useCallback((field: keyof T, touched = true) => {
    setTouched(prev => ({ ...prev, [field]: touched }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  }, [data, validateForm, onSubmit]);

  // Reset form
  const reset = useCallback(() => {
    setData(originalData);
    setErrors({});
    setTouched({});
    onReset?.();
  }, [originalData, onReset]);

  // Reset specific field
  const resetField = useCallback((field: keyof T) => {
    setData(prev => ({ ...prev, [field]: originalData[field] }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setTouched(prev => ({ ...prev, [field]: false }));
  }, [originalData]);

  return {
    data,
    errors,
    touched,
    isDirty,
    isValid,
    isSubmitting,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    resetField,
  };
}

// Common validation rules
export const validationRules = {
  required: <T extends Record<string, unknown>>(field: keyof T) => ({
    field,
    validator: (value: unknown) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${String(field)} is required`;
      }
      return null;
    },
  }),
  
  email: <T extends Record<string, unknown>>(field: keyof T) => ({
    field,
    validator: (value: unknown) => {
      if (typeof value === 'string' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return `${String(field)} must be a valid email address`;
      }
      return null;
    },
  }),
  
  minLength: <T extends Record<string, unknown>>(field: keyof T, min: number) => ({
    field,
    validator: (value: unknown) => {
      if (typeof value === 'string' && value.length < min) {
        return `${String(field)} must be at least ${min} characters long`;
      }
      return null;
    },
  }),
  
  maxLength: <T extends Record<string, unknown>>(field: keyof T, max: number) => ({
    field,
    validator: (value: unknown) => {
      if (typeof value === 'string' && value.length > max) {
        return `${String(field)} must be no more than ${max} characters long`;
      }
      return null;
    },
  }),
  
  number: <T extends Record<string, unknown>>(field: keyof T) => ({
    field,
    validator: (value: unknown) => {
      if (value && isNaN(Number(value))) {
        return `${String(field)} must be a valid number`;
      }
      return null;
    },
  }),
  
  positiveNumber: <T extends Record<string, unknown>>(field: keyof T) => ({
    field,
    validator: (value: unknown) => {
      if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
        return `${String(field)} must be a positive number`;
      }
      return null;
    },
  }),
  
  url: <T extends Record<string, unknown>>(field: keyof T) => ({
    field,
    validator: (value: unknown) => {
      if (typeof value === 'string' && value && !/^https?:\/\/.+/.test(value)) {
        return `${String(field)} must be a valid URL`;
      }
      return null;
    },
  }),
}; 