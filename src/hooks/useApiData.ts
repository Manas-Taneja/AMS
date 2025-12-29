import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { apiService, ApiError } from '@/services/api';
import { toast } from 'sonner';
import { API_ENDPOINTS, SUPABASE_CONFIG } from '@/config';
import { supabase, getTableNameFromEndpoint, supabaseEnabled } from '@/lib/supabaseClient';

const EMPTY_OBJECT = {};

interface UseApiDataOptions<T, Q = Record<string, unknown>> {
  endpoint: string;
  token?: string;
  queryParams?: Q;
  transformData?: (data: unknown) => T[];
  onError?: (error: ApiError) => void;
  autoFetch?: boolean;
  dependencies?: unknown[];
}

interface UseApiDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
  setData: (data: T[]) => void;
  clearError: () => void;
}

export function useApiData<T = unknown, Q = Record<string, unknown>>({
  endpoint,
  token,
  queryParams = EMPTY_OBJECT as Q,
  transformData,
  onError,
  autoFetch = true,
  dependencies = [],
}: UseApiDataOptions<T, Q>): UseApiDataReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const useSupabase = SUPABASE_CONFIG.USE_SUPABASE && supabaseEnabled && supabase;
  const fetchingRef = useRef(false);

  // Use refs to store the latest functions without causing re-renders
  const transformDataRef = useRef(transformData);
  const onErrorRef = useRef(onError);

  // Update refs when functions change
  useEffect(() => {
    transformDataRef.current = transformData;
  }, [transformData]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Memoize queryParams to prevent unnecessary re-renders
  const queryParamsString = useMemo(() => JSON.stringify(queryParams), [queryParams]);

  const fetchData = useCallback(async () => {
    if (!useSupabase && !token) {
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) {
      return;
    }

    fetchingRef.current = true;
    setLoading(true);
    setError('');

    try {
      let response: T[];
      if (useSupabase && supabase) {
        const table = getTableNameFromEndpoint(endpoint);
        let query = supabase.from(table).select('*');
        // Apply simple equality filters from queryParams
        const params = JSON.parse(queryParamsString) as Record<string, unknown>;
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value as string | number | boolean);
          }
        });
        const { data: rows, error } = await query;
        if (error) throw new ApiError({ message: error.message, status: error.code as unknown as number, details: error });
        response = (rows || []) as T[];
      } else {
        const params = JSON.parse(queryParamsString) as Record<string, unknown>;
        if (Object.keys(params).length > 0) {
          response = await apiService.getWithQuery<T[]>(endpoint, params, token);
        } else {
          response = await apiService.get<T[]>(endpoint, token);
        }
      }

      const transformedData = transformDataRef.current ? transformDataRef.current(response) : response;
      setData(transformedData);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError({
        message: 'Failed to fetch data',
        status: 0,
        details: err,
      });

      const errorMessage = apiError.message;
      setError(errorMessage);
      
      // Show toast notification
      toast.error(errorMessage);
      
      // Call custom error handler if provided
      if (onErrorRef.current) {
        onErrorRef.current(apiError);
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [endpoint, token, queryParamsString, useSupabase]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Memoize dependencies string to prevent unnecessary re-renders
  const dependenciesString = useMemo(() => JSON.stringify(dependencies), [dependencies]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch, dependenciesString]);

  return {
    data,
    loading,
    error,
    refetch,
    setData,
    clearError,
  };
}

// Specialized hooks for common entities
export function useStaffData(token?: string, queryParams?: Record<string, unknown>) {
  const transformData = useMemo(
    () => (data: unknown) => {
      // Handle wrapped response format from backend
      let staffArray: unknown[] = [];
      if (typeof data === 'object' && data !== null) {
        const response = data as Record<string, unknown>;
        if (response.success && Array.isArray(response.data)) {
          staffArray = response.data;
        } else if (Array.isArray(data)) {
          // Fallback for direct array response
          staffArray = data;
        }
      }
      
      return staffArray.map((staff: unknown) => {
        if (typeof staff === 'object' && staff !== null) {
          const s = staff as Record<string, unknown>;
          return {
            ...s,
            initials: typeof s.name === 'string' ? s.name.split(" ").map((n: string) => n[0]).join("") : "?",
            avatar: s.avatar || "/placeholder.svg?height=40&width=40",
            status: s.status || "active",
            department: s.department || "Operations",
            experience: s.experience || "-",
            joinDate: s.joinDate || s.created_at || "",
            currentProjects: s.currentProjects || 0,
            completedTasks: s.completedTasks || 0,
          };
        }
        return staff;
      });
    },
    []
  );

  return useApiData({
    endpoint: API_ENDPOINTS.STAFF,
    token,
    queryParams,
    transformData,
  });
}

export function useLocationsData(token?: string, queryParams?: Record<string, unknown>) {
  const transformData = useMemo(
    () => (data: unknown) => {
      // Handle wrapped response format from backend
      let locationsArray: unknown[] = [];
      if (typeof data === 'object' && data !== null) {
        const response = data as Record<string, unknown>;
        if (response.success && Array.isArray(response.data)) {
          locationsArray = response.data;
        } else if (Array.isArray(data)) {
          // Fallback for direct array response
          locationsArray = data;
        }
      }
      
      return locationsArray.map((location: unknown) => {
        if (typeof location === 'object' && location !== null) {
          const loc = location as Record<string, unknown>;
          return {
            ...loc,
            pointOfContact: loc.manager,
            status: "active",
            type: "branch",
            assetCount: 0,
            avatar: typeof loc.manager === 'string' ? loc.manager.split(" ").map((n: string) => n[0]).join("") : "?",
          };
        }
        return location;
      });
    },
    []
  );

  return useApiData({
    endpoint: API_ENDPOINTS.LOCATIONS,
    token,
    queryParams,
    transformData,
  });
}

export function useComponentsData(token?: string, queryParams?: Record<string, unknown>) {
  const transformData = useMemo(
    () => (data: unknown) => {
      // Handle wrapped response format from backend
      let componentsArray: unknown[] = [];
      if (typeof data === 'object' && data !== null) {
        const response = data as Record<string, unknown>;
        if (response.success && Array.isArray(response.data)) {
          componentsArray = response.data;
        } else if (Array.isArray(data)) {
          // Fallback for direct array response
          componentsArray = data;
        }
      }
      
      return componentsArray.map((component: unknown) => {
        if (typeof component === 'object' && component !== null) {
          const c = component as Record<string, unknown>;
          return {
            ...c,
            status: c.status || "Active",
            category: c.category || "Equipment",
            location: c.location || "Unknown",
            project: c.project || "General",
            owner: c.owner || "Unknown",
          };
        }
        return component;
      });
    },
    []
  );

  return useApiData({
    endpoint: API_ENDPOINTS.COMPONENTS,
    token,
    queryParams,
    transformData,
  });
}

export function useProjectsData(token?: string, queryParams?: Record<string, unknown>) {
  const transformData = useMemo(
    () => (data: unknown) => {
      // Handle wrapped response format from backend
      let projectsArray: unknown[] = [];
      if (typeof data === 'object' && data !== null) {
        const response = data as Record<string, unknown>;
        if (response.success && Array.isArray(response.data)) {
          projectsArray = response.data;
        } else if (Array.isArray(data)) {
          // Fallback for direct array response
          projectsArray = data;
        }
      }
      
      return projectsArray.map((project: unknown) => {
        if (typeof project === 'object' && project !== null) {
          const p = project as Record<string, unknown>;
          return {
            ...p,
            status: p.status || "Active",
            progress: typeof p.progress === "number" ? p.progress : 0,
            description: p.description || "",
            tags: Array.isArray(p.tags) ? p.tags : [],
            createdAt: p.createdAt || p.created_at || new Date().toISOString(),
            updatedAt: p.updatedAt || p.updated_at || new Date().toISOString(),
          };
        }
        return project;
      });
    },
    []
  );

  return useApiData({
    endpoint: API_ENDPOINTS.PROJECTS,
    token,
    queryParams,
    transformData,
  });
} 