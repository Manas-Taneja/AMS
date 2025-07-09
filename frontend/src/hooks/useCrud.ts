import { useState, useCallback } from 'react';
import { apiService, ApiError } from '../services/api';
import { toast } from 'sonner';

interface UseCrudOptions<T> {
  endpoint: string;
  token?: string;
  entityName?: string;
  onSuccess?: (operation: 'create' | 'update' | 'delete', data?: T) => void;
  onError?: (error: ApiError, operation: 'create' | 'update' | 'delete') => void;
  transformData?: (data: any) => T;
  transformCreateData?: (data: Partial<T>) => any;
  transformUpdateData?: (data: Partial<T>) => any;
}

interface UseCrudReturn<T> {
  create: (data: Partial<T>) => Promise<T | null>;
  update: (id: string | number, data: Partial<T>) => Promise<T | null>;
  remove: (id: string | number) => Promise<boolean>;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  loading: boolean;
  error: string;
  clearError: () => void;
}

export function useCrud<T = any>({
  endpoint,
  token,
  entityName = 'item',
  onSuccess,
  onError,
  transformData,
  transformCreateData,
  transformUpdateData,
}: UseCrudOptions<T>): UseCrudReturn<T> {
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const create = useCallback(async (data: Partial<T>): Promise<T | null> => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    setCreating(true);
    setError('');

    try {
      const transformedData = transformCreateData ? transformCreateData(data) : data;
      const response = await apiService.post<T>(endpoint, transformedData, token);
      
      const result = transformData ? transformData(response) : response;
      
      toast.success(`${entityName} created successfully`);
      onSuccess?.('create', result);
      
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError({
        message: `Failed to create ${entityName}`,
        status: 0,
        details: err,
      });

      setError(apiError.message);
      toast.error(apiError.message);
      onError?.(apiError, 'create');
      
      return null;
    } finally {
      setCreating(false);
    }
  }, [endpoint, token, entityName, onSuccess, onError, transformData, transformCreateData]);

  const update = useCallback(async (id: string | number, data: Partial<T>): Promise<T | null> => {
    if (!token) {
      toast.error('Authentication required');
      return null;
    }

    setUpdating(true);
    setError('');

    try {
      const transformedData = transformUpdateData ? transformUpdateData(data) : data;
      const response = await apiService.put<T>(`${endpoint}/${id}`, transformedData, token);
      
      const result = transformData ? transformData(response) : response;
      
      toast.success(`${entityName} updated successfully`);
      onSuccess?.('update', result);
      
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError({
        message: `Failed to update ${entityName}`,
        status: 0,
        details: err,
      });

      setError(apiError.message);
      toast.error(apiError.message);
      onError?.(apiError, 'update');
      
      return null;
    } finally {
      setUpdating(false);
    }
  }, [endpoint, token, entityName, onSuccess, onError, transformData, transformUpdateData]);

  const remove = useCallback(async (id: string | number): Promise<boolean> => {
    if (!token) {
      toast.error('Authentication required');
      return false;
    }

    setDeleting(true);
    setError('');

    try {
      await apiService.delete(`${endpoint}/${id}`, token);
      
      toast.success(`${entityName} deleted successfully`);
      onSuccess?.('delete');
      
      return true;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError({
        message: `Failed to delete ${entityName}`,
        status: 0,
        details: err,
      });

      setError(apiError.message);
      toast.error(apiError.message);
      onError?.(apiError, 'delete');
      
      return false;
    } finally {
      setDeleting(false);
    }
  }, [endpoint, token, entityName, onSuccess, onError]);

  const loading = creating || updating || deleting;

  return {
    create,
    update,
    remove,
    creating,
    updating,
    deleting,
    loading,
    error,
    clearError,
  };
}

// Specialized CRUD hooks for common entities
export function useStaffCrud(token?: string) {
  return useCrud({
    endpoint: '/staff',
    token,
    entityName: 'staff member',
    transformData: (data) => ({
      ...data,
      initials: data.name ? data.name.split(" ").map((n: string) => n[0]).join("") : "?",
      avatar: data.avatar || "/placeholder.svg?height=40&width=40",
      status: data.status || "active",
      department: data.department || "Operations",
      experience: data.experience || "-",
      joinDate: data.joinDate || data.created_at || "",
      currentProjects: data.currentProjects || 0,
      completedTasks: data.completedTasks || 0,
    }),
    transformCreateData: (data) => ({
      ...data,
      skills: Array.isArray(data.skills) ? data.skills : data.skills?.split(",").map((s: string) => s.trim()) || [],
    }),
    transformUpdateData: (data) => ({
      ...data,
      skills: Array.isArray(data.skills) ? data.skills : data.skills?.split(",").map((s: string) => s.trim()) || [],
    }),
  });
}

export function useLocationsCrud(token?: string) {
  return useCrud({
    endpoint: '/locations',
    token,
    entityName: 'location',
    transformData: (data) => ({
      ...data,
      pointOfContact: data.manager,
      status: "active",
      type: "branch",
      assetCount: 0,
      avatar: data.manager ? data.manager.split(" ").map((n: string) => n[0]).join("") : "?",
    }),
    transformCreateData: (data) => ({
      ...data,
      team: Number(data.team),
    }),
    transformUpdateData: (data) => ({
      ...data,
      team: Number(data.team),
    }),
  });
}

export function useComponentsCrud(token?: string) {
  return useCrud({
    endpoint: '/components',
    token,
    entityName: 'component',
  });
}

export function useProjectsCrud(token?: string) {
  return useCrud({
    endpoint: '/projects',
    token,
    entityName: 'project',
  });
} 