import { useCallback } from 'react';
import { toast } from 'sonner';

interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
}

interface UseConfirmationReturn {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
  confirmDelete: (entityName: string, itemName?: string) => Promise<boolean>;
  confirmUpdate: (entityName: string, itemName?: string) => Promise<boolean>;
  confirmCreate: (entityName: string) => Promise<boolean>;
}

export function useConfirmation(): UseConfirmationReturn {
  const confirm = useCallback(async (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const {
        title = 'Confirm Action',
        message,
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        type = 'warning',
      } = options;

      const toastId = toast.custom((t) => (
        <div 
          className="flex flex-col gap-2 max-w-xs w-80 bg-gray-300 border border-gray-400 rounded-lg p-4"
          style={{ zIndex: 9999, pointerEvents: 'auto' }}
        >
          <div className="flex items-center gap-2">
            <span className={`text-lg ${
              type === 'success' ? 'text-green-600' :
              type === 'error' ? 'text-red-600' :
              type === 'warning' ? 'text-yellow-600' :
              'text-blue-600'}`}
            >
              {type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}
            </span>
            <span className="font-semibold text-gray-900">{title}</span>
          </div>
          <div className="text-gray-700 text-sm">{message}</div>
          <div className="flex gap-2 mt-2">
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type === 'error' ? 'red' : type === 'warning' ? 'yellow' : type === 'success' ? 'green' : 'blue'}-500 ${
                type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                type === 'error' ? 'bg-red-600 text-white hover:bg-red-700' :
                type === 'warning' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(t);
                resolve(true);
              }}
              autoFocus
            >
              {confirmText}
            </button>
            <button
              className="px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(t);
                resolve(false);
              }}
            >
              {cancelText}
            </button>
          </div>
        </div>
      ), {
        position: 'top-center',
        duration: 10000, // stays until user acts
        id: `confirm-${Math.random()}`,
        closeButton: false,
      });
    });
  }, []);

  const confirmDelete = useCallback(async (entityName: string, itemName?: string): Promise<boolean> => {
    const message = itemName 
      ? `Are you sure you want to delete ${entityName} "${itemName}"? This action cannot be undone.`
      : `Are you sure you want to delete this ${entityName}? This action cannot be undone.`;
    
    return confirm({
      title: 'Confirm Delete',
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'error'
    });
  }, [confirm]);

  const confirmUpdate = useCallback(async (entityName: string, itemName?: string): Promise<boolean> => {
    const message = itemName 
      ? `Are you sure you want to update ${entityName} "${itemName}"?`
      : `Are you sure you want to update this ${entityName}?`;
    
    return confirm({
      title: 'Confirm Update',
      message,
      confirmText: 'Update',
      cancelText: 'Cancel',
      type: 'warning'
    });
  }, [confirm]);

  const confirmCreate = useCallback(async (entityName: string): Promise<boolean> => {
    return confirm({
      title: 'Confirm Create',
      message: `Are you sure you want to create a new ${entityName}?`,
      confirmText: 'Create',
      cancelText: 'Cancel',
      type: 'info'
    });
  }, [confirm]);

  return {
    confirm,
    confirmDelete,
    confirmUpdate,
    confirmCreate,
  };
} 