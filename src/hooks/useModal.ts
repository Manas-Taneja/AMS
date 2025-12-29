import { useState, useCallback } from 'react';

interface UseModalOptions {
  initialOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useModal({ 
  initialOpen = false, 
  onOpen, 
  onClose 
}: UseModalOptions = {}): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

// Confirmation dialog hook
interface UseConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

interface UseConfirmReturn {
  isOpen: boolean;
  open: (options?: UseConfirmOptions) => void;
  close: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'default' | 'destructive';
}

export function useConfirm({
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
}: UseConfirmOptions = {}): UseConfirmReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<UseConfirmOptions>({
    title,
    message,
    confirmText,
    cancelText,
    variant,
  });

  const open = useCallback((options?: UseConfirmOptions) => {
    setConfirmOptions(prev => ({ ...prev, ...options }));
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    open,
    close,
    title: confirmOptions.title || title,
    message: confirmOptions.message || message,
    confirmText: confirmOptions.confirmText || confirmText,
    cancelText: confirmOptions.cancelText || cancelText,
    variant: confirmOptions.variant || variant,
  };
}

// Form modal hook
interface UseFormModalOptions<T> {
  initialData?: T;
  onSave?: (data: T) => Promise<void> | void;
  onCancel?: () => void;
}

interface UseFormModalReturn<T> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  save: (data: T) => Promise<void>;
  cancel: () => void;
}

export function useFormModal<T = unknown>({
  initialData,
  onSave,
  onCancel,
}: UseFormModalOptions<T> = {}): UseFormModalReturn<T> {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(initialData || null);

  const open = useCallback((newData?: T) => {
    setData(newData || initialData || null);
    setIsOpen(true);
  }, [initialData]);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const save = useCallback(async (formData: T) => {
    if (onSave) {
      await onSave(formData);
    }
    close();
  }, [onSave, close]);

  const cancel = useCallback(() => {
    onCancel?.();
    close();
  }, [onCancel, close]);

  return {
    isOpen,
    data,
    open,
    close,
    save,
    cancel,
  };
}

// Multi-step modal hook
interface UseMultiStepModalOptions {
  steps: string[];
  initialStep?: number;
}

interface UseMultiStepModalReturn {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  stepName: string;
  isFirstStep: boolean;
  isLastStep: boolean;
  open: () => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
}

export function useMultiStepModal({
  steps,
  initialStep = 0,
}: UseMultiStepModalOptions): UseMultiStepModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(initialStep);

  const open = useCallback(() => {
    setIsOpen(true);
    setCurrentStep(initialStep);
  }, [initialStep]);

  const close = useCallback(() => {
    setIsOpen(false);
    setCurrentStep(initialStep);
  }, [initialStep]);

  const next = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  const reset = useCallback(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  return {
    isOpen,
    currentStep,
    totalSteps: steps.length,
    stepName: steps[currentStep] || '',
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    open,
    close,
    next,
    prev,
    goToStep,
    reset,
  };
} 