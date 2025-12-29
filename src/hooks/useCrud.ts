import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService, ApiError } from '@/services/api';
import { supabase, getTableNameFromEndpoint, supabaseEnabled } from '@/lib/supabaseClient';
import { SUPABASE_CONFIG } from '@/config';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '@/config';

interface UseCrudOptions<T> {
  endpoint: string;
  token?: string;
  entityName?: string;
  onSuccess?: (operation: 'create' | 'update' | 'delete', data?: T) => void;
  onError?: (error: ApiError, operation: 'create' | 'update' | 'delete') => void;
  transformData?: (data: unknown) => T;
  transformCreateData?: (data: Partial<T>) => T;
  transformUpdateData?: (data: Partial<T>) => T;
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

// Type guard for string
function isString(val: unknown): val is string {
  return typeof val === 'string';
}

export function useCrud<T = Record<string, unknown>>({
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

  // Use refs to store the latest functions without causing re-renders
  const transformDataRef = useRef(transformData);
  const transformCreateDataRef = useRef(transformCreateData);
  const transformUpdateDataRef = useRef(transformUpdateData);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Update refs when functions change
  useEffect(() => {
    transformDataRef.current = transformData;
  }, [transformData]);

  useEffect(() => {
    transformCreateDataRef.current = transformCreateData;
  }, [transformCreateData]);

  useEffect(() => {
    transformUpdateDataRef.current = transformUpdateData;
  }, [transformUpdateData]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const useSupabase = SUPABASE_CONFIG.USE_SUPABASE && supabaseEnabled && supabase;
  const tableName = getTableNameFromEndpoint(endpoint);

  const supabaseCreate = useCallback(
    async (data: Partial<T>) => {
      const client = supabase;
      if (!client) throw new ApiError({ message: 'Supabase not configured', status: 0 });
      const { data: inserted, error } = await client.from(tableName).insert(data).select().single();
      if (error) throw new ApiError({ message: error.message, status: error.code as unknown as number, details: error });
      return inserted as T;
    },
    [tableName]
  );

  const supabaseUpdate = useCallback(
    async (id: string | number, data: Partial<T>) => {
      const client = supabase;
      if (!client) throw new ApiError({ message: 'Supabase not configured', status: 0 });
      const { data: updated, error } = await client.from(tableName).update(data).eq('id', id).select().single();
      if (error) throw new ApiError({ message: error.message, status: error.code as unknown as number, details: error });
      return updated as T;
    },
    [tableName]
  );

  const supabaseDelete = useCallback(
    async (id: string | number) => {
      const client = supabase;
      if (!client) throw new ApiError({ message: 'Supabase not configured', status: 0 });
      const { error } = await client.from(tableName).delete().eq('id', id);
      if (error) throw new ApiError({ message: error.message, status: error.code as unknown as number, details: error });
      return true;
    },
    [tableName]
  );

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const create = useCallback(async (data: Partial<T>): Promise<T | null> => {
    if (!useSupabase && !token) {
      toast.error('Authentication required');
      return null;
    }

    setCreating(true);
    setError('');

    try {
      if (typeof data === 'object' && data !== null) {
        const transformedData = transformCreateDataRef.current ? transformCreateDataRef.current(data) : data;
        const response = useSupabase
          ? await supabaseCreate(transformedData)
          : await apiService.post<T>(endpoint, transformedData, token);
        
        const result = transformDataRef.current ? transformDataRef.current(response) : response;
        
        onSuccessRef.current?.('create', result);
        
        return result;
      }
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError({
        message: `Failed to create ${entityName}`,
        status: 0,
        details: err,
      });

      setError(apiError.message);
      toast.error(apiError.message);
      onErrorRef.current?.(apiError, 'create');
      
      return null;
    } finally {
      setCreating(false);
    }
    return null;
  }, [endpoint, token, entityName, supabaseCreate, useSupabase]);

  const update = useCallback(async (id: string | number, data: Partial<T>): Promise<T | null> => {
    if (!useSupabase && !token) {
      toast.error('Authentication required');
      return null;
    }

    setUpdating(true);
    setError('');

    try {
      if (typeof data === 'object' && data !== null) {
        const transformedData = transformUpdateDataRef.current ? transformUpdateDataRef.current(data) : data;
        const response = useSupabase
          ? await supabaseUpdate(id, transformedData)
          : await apiService.put<T>(`${endpoint}/${id}`, transformedData, token);
        
        const result = transformDataRef.current ? transformDataRef.current(response) : response;
        
        onSuccessRef.current?.('update', result);
        
        return result;
      }
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError({
        message: `Failed to update ${entityName}`,
        status: 0,
        details: err,
      });

      setError(apiError.message);
      toast.error(apiError.message);
      onErrorRef.current?.(apiError, 'update');
      
      return null;
    } finally {
      setUpdating(false);
    }
    return null;
  }, [endpoint, token, entityName, supabaseUpdate, useSupabase]);

  const remove = useCallback(async (id: string | number): Promise<boolean> => {
    if (!useSupabase && !token) {
      toast.error('Authentication required');
      return false;
    }

    setDeleting(true);
    setError('');

    try {
      if (useSupabase) {
        await supabaseDelete(id);
      } else {
        await apiService.delete(`${endpoint}/${id}`, token);
      }
      
      onSuccessRef.current?.('delete');
      
      return true;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError({
        message: `Failed to delete ${entityName}`,
        status: 0,
        details: err,
      });

      setError(apiError.message);
      toast.error(apiError.message);
      onErrorRef.current?.(apiError, 'delete');
      
      return false;
    } finally {
      setDeleting(false);
    }
  }, [endpoint, token, entityName, supabaseDelete, useSupabase]);

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
    endpoint: API_ENDPOINTS.STAFF,
    token,
    entityName: 'staff member',
    transformData: (data) => {
      // Handle wrapped response format from backend
      let staffData = data;
      if (typeof data === 'object' && data !== null) {
        const response = data as Record<string, unknown>;
        if (response.success && response.data) {
          staffData = response.data;
        }
      }
      
      if (typeof staffData === 'object' && staffData !== null) {
        const d = staffData as Record<string, unknown>;
        return {
          ...d,
          initials: typeof d.name === 'string' ? d.name.split(" ").map((n: string) => n[0]).join("") : "?",
          avatar: d.avatar || "/placeholder.svg?height=40&width=40",
          status: d.status || "active",
          department: d.department || "Operations",
          experience: d.experience || "-",
          joinDate: d.joinDate || d.created_at || "",
          currentProjects: d.currentProjects || 0,
          completedTasks: d.completedTasks || 0,
        };
      }
      return staffData;
    },
    transformCreateData: (data) => {
      if (typeof data === 'object' && data !== null) {
        const d = data as Record<string, unknown>;
        let parsedSkills: unknown;
        if (Array.isArray(d.skills)) {
          parsedSkills = d.skills;
        } else if (isString(d.skills)) {
          parsedSkills = d.skills.split(',').map((s) => s.trim());
        } else {
          parsedSkills = [];
        }
        return {
          ...d,
          skills: parsedSkills,
        };
      }
      return data;
    },
    transformUpdateData: (data) => {
      if (typeof data === 'object' && data !== null) {
        const d = data as Record<string, unknown>;
        let parsedSkills: unknown;
        if (Array.isArray(d.skills)) {
          parsedSkills = d.skills;
        } else if (isString(d.skills)) {
          parsedSkills = d.skills.split(',').map((s) => s.trim());
        } else {
          parsedSkills = [];
        }
        return {
          ...d,
          skills: parsedSkills,
        };
      }
      return data;
    },
  });
}

export function useLocationsCrud(token?: string) {
  return useCrud({
    endpoint: API_ENDPOINTS.LOCATIONS,
    token,
    entityName: 'location',
    transformData: (data) => {
      // Handle wrapped response format from backend
      let locationData = data;
      if (typeof data === 'object' && data !== null) {
        const response = data as Record<string, unknown>;
        if (response.success && response.data) {
          locationData = response.data;
        }
      }
      
      if (typeof locationData === 'object' && locationData !== null) {
        const d = locationData as Record<string, unknown>;
        return {
          ...d,
          // Ensure all required fields are present with defaults
          pointOfContact: d.pointOfContact || d.manager || "",
          status: d.status || "active",
          type: d.type || "branch",
          assetCount: d.assetCount || 0,
          avatar: d.avatar || (isString(d.manager) ? d.manager.split(" ").map((n: string) => n[0]).join("") : "?"),
        };
      }
      return locationData;
    },
    transformCreateData: (data) => {
      if (typeof data === 'object' && data !== null) {
        const d = data as Record<string, unknown>;
        return {
          ...d,
          team: Number(d.team),
          // Ensure required fields have defaults
          status: d.status || "active",
          type: d.type || "branch",
          pointOfContact: d.pointOfContact || d.manager || "",
          assetCount: d.assetCount || 0,
        };
      }
      return data;
    },
    transformUpdateData: (data) => {
      if (typeof data === 'object' && data !== null) {
        const d = data as Record<string, unknown>;
        return {
          ...d,
          team: Number(d.team),
          // Ensure required fields have defaults
          status: d.status || "active",
          type: d.type || "branch",
          pointOfContact: d.pointOfContact || d.manager || "",
          assetCount: d.assetCount || 0,
        };
      }
      return data;
    },
  });
}

export function useComponentsCrud(token?: string) {
  return useCrud({
    endpoint: API_ENDPOINTS.COMPONENTS,
    token,
    entityName: 'component',
    transformData: (data) => {
      // Handle wrapped response format from backend
      let componentData = data;
      if (typeof data === 'object' && data !== null) {
        const response = data as Record<string, unknown>;
        if (response.success && response.data) {
          componentData = response.data;
        }
      }
      
      if (typeof componentData === 'object' && componentData !== null) {
        const d = componentData as Record<string, unknown>;
        return {
          ...d,
          status: d.status || "Active",
          category: d.category || "Equipment",
          location: d.location || "Unknown",
          project: d.project || "General",
          owner: d.owner || "Unknown",
          description: d.description || "",
          serial_number: d.serial_number || "",
          purchase_date: d.purchase_date || "",
          warranty_expiry: d.warranty_expiry || "",
          created_at: d.created_at || new Date().toISOString(),
          updated_at: d.updated_at || new Date().toISOString(),
        };
      }
      return componentData;
    },
    transformCreateData: (data) => {
      if (typeof data === 'object' && data !== null) {
        const d = data as Record<string, unknown>;
        // Convert date strings to ISO format for backend
        const transformedData = { ...d };
        
        if (typeof d.purchase_date === 'string' && d.purchase_date) {
          transformedData.purchase_date = new Date(d.purchase_date).toISOString();
        }
        
        if (typeof d.warranty_expiry === 'string' && d.warranty_expiry) {
          transformedData.warranty_expiry = new Date(d.warranty_expiry).toISOString();
        }
        
        return transformedData;
      }
      return data;
    },
    transformUpdateData: (data) => {
      if (typeof data === 'object' && data !== null) {
        const d = data as Record<string, unknown>;
        // Convert date strings to ISO format for backend
        const transformedData = { ...d };
        
        if (typeof d.purchase_date === 'string' && d.purchase_date) {
          transformedData.purchase_date = new Date(d.purchase_date).toISOString();
        }
        
        if (typeof d.warranty_expiry === 'string' && d.warranty_expiry) {
          transformedData.warranty_expiry = new Date(d.warranty_expiry).toISOString();
        }
        
        return transformedData;
      }
      return data;
    },
  });
}

export function useProjectsCrud(token?: string) {
  return useCrud({
    endpoint: API_ENDPOINTS.PROJECTS,
    token,
    entityName: 'project',
    transformData: (data) => {
      // Handle wrapped response format from backend
      let projectData = data;
      if (typeof data === 'object' && data !== null) {
        const response = data as Record<string, unknown>;
        if (response.success && response.data) {
          projectData = response.data;
        }
      }
      
      if (typeof projectData === 'object' && projectData !== null) {
        const d = projectData as Record<string, unknown>;
        return {
          ...d,
          status: d.status || "Active",
          progress: typeof d.progress === "number" ? d.progress : 0,
          description: d.description || "",
          tags: Array.isArray(d.tags) ? d.tags : [],
          createdAt: d.createdAt || d.created_at || new Date().toISOString(),
          updatedAt: d.updatedAt || d.updated_at || new Date().toISOString(),
        };
      }
      return projectData;
    },
  });
} 