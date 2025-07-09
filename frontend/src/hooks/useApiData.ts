import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService, ApiError } from '../services/api';
import { toast } from 'sonner';

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

  const fetchData = useCallback(async () => {
    console.log('fetchData called', { endpoint, token });
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response: T[];
      
      if (Object.keys(queryParams as object).length > 0) {
        response = await apiService.getWithQuery<T[]>(endpoint, queryParams as Record<string, unknown>, token);
      } else {
        response = await apiService.get<T[]>(endpoint, token);
      }

      const transformedData = transformData ? transformData(response) : response;
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
      if (onError) {
        onError(apiError);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, token, queryParams, transformData, onError]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch, ...dependencies]);

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
    () => (data: unknown) =>
      Array.isArray(data)
        ? data.map((staff: any) => ({
            ...staff,
            initials: staff.name ? staff.name.split(" ").map((n: string) => n[0]).join("") : "?",
            avatar: staff.avatar || "/placeholder.svg?height=40&width=40",
            status: staff.status || "active",
            department: staff.department || "Operations",
            experience: staff.experience || "-",
            joinDate: staff.joinDate || staff.created_at || "",
            currentProjects: staff.currentProjects || 0,
            completedTasks: staff.completedTasks || 0,
          }))
        : [],
    []
  );

  return useApiData({
    endpoint: '/staff',
    token,
    queryParams,
    transformData,
  });
}

export function useLocationsData(token?: string, queryParams?: Record<string, unknown>) {
  return useApiData({
    endpoint: '/locations',
    token,
    queryParams,
    transformData: (data: unknown) => (Array.isArray(data) ? data.map((location: any) => ({
      ...location,
      pointOfContact: location.manager,
      status: "active", // TODO: Map real status if available
      type: "branch", // TODO: Map real type if available
      assetCount: 0, // TODO: Fetch asset count if available
      avatar: location.manager ? location.manager.split(" ").map((n: string) => n[0]).join("") : "?",
    })) : []),
  });
}

export function useComponentsData(token?: string, queryParams?: Record<string, unknown>) {
  return useApiData({
    endpoint: '/components',
    token,
    queryParams,
  });
}

export function useProjectsData(token?: string, queryParams?: Record<string, unknown>) {
  return useApiData({
    endpoint: '/projects',
    token,
    queryParams,
  });
} 