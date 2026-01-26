import { useState, useEffect, useMemo } from 'react';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

// Interface for regional metrics from API
export interface RegionalMetrics {
  region: string;
  assets: number;
  staff: number;
  projects: number;
  utilization: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface CenterMetrics {
  name: string;
  type: string;
  status: 'active' | 'maintenance' | 'inactive';
  address: string;
  manager: string;
  assets: {
    total: number;
    drones: number;
    itComponents: number;
    equipment: number;
    vehicles: number;
  };
  staff: {
    total: number;
    technical: number;
    administrative: number;
    management: number;
  };
  projects: {
    active: number;
    completed: number;
    pending: number;
  };
  utilization: number;
  performance: {
    month: string;
    efficiency: number;
    incidents: number;
  }[];
}

interface UseRegionalDataOptions {
  token?: string;
  autoFetch?: boolean;
}

/**
 * Custom hook for fetching regional analytics data
 * 
 * Usage:
 * ```typescript
 * const { regionalData, centerDetails, loading, error, refetch } = useRegionalData({ token });
 * ```
 */
export function useRegionalData(options: UseRegionalDataOptions = {}) {
  const { token, autoFetch = true } = options;
  const [regionalData, setRegionalData] = useState<RegionalMetrics[]>([]);
  const [centerDetails, setCenterDetails] = useState<Record<string, CenterMetrics>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch regional summary data
  const fetchRegionalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Replace with your actual API endpoint
      const data = await apiService.get<RegionalMetrics[]>(
        '/api/regional/metrics',
        token
      );

      setRegionalData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch regional data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed center data
  const fetchCenterDetails = async (centerName: string) => {
    try {
      // Replace with your actual API endpoint
      const data = await apiService.get<CenterMetrics>(
        `/api/regional/centers/${encodeURIComponent(centerName)}`,
        token
      );

      setCenterDetails(prev => ({
        ...prev,
        [centerName]: data
      }));

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch data for ${centerName}`;
      toast.error(errorMessage);
      throw err;
    }
  };

  // Memoized sorted regional data
  const sortedRegionalData = useMemo(() => 
    [...regionalData].sort((a, b) => a.region.localeCompare(b.region)),
    [regionalData]
  );

  // Summary statistics
  const summary = useMemo(() => ({
    totalCenters: regionalData.length,
    totalAssets: regionalData.reduce((sum, center) => sum + center.assets, 0),
    totalStaff: regionalData.reduce((sum, center) => sum + center.staff, 0),
    totalProjects: regionalData.reduce((sum, center) => sum + center.projects, 0),
    averageUtilization: regionalData.length > 0 
      ? regionalData.reduce((sum, center) => sum + center.utilization, 0) / regionalData.length 
      : 0,
    activeCenters: regionalData.filter(c => c.status === 'active').length,
  }), [regionalData]);

  // Fetch data on mount if autoFetch is enabled
  useEffect(() => {
    if (autoFetch && token) {
      fetchRegionalData();
    }
  }, [autoFetch, token]);

  // Refetch function
  const refetch = async () => {
    await fetchRegionalData();
  };

  return {
    regionalData: sortedRegionalData,
    centerDetails,
    loading,
    error,
    summary,
    refetch,
    fetchCenterDetails,
  };
}

/**
 * Hook for fetching data for a specific center
 * 
 * Usage:
 * ```typescript
 * const { centerData, loading, error } = useCenterData('Headquarters', { token });
 * ```
 */
export function useCenterData(centerName: string, options: UseRegionalDataOptions = {}) {
  const { token, autoFetch = true } = options;
  const [centerData, setCenterData] = useState<CenterMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Replace with your actual API endpoint
      const data = await apiService.get<CenterMetrics>(
        `/api/regional/centers/${encodeURIComponent(centerName)}`,
        token
      );

      setCenterData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch data for ${centerName}`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && token && centerName) {
      fetchData();
    }
  }, [autoFetch, token, centerName]);

  const refetch = async () => {
    await fetchData();
  };

  return {
    centerData,
    loading,
    error,
    refetch,
  };
}

/**
 * Transform raw API data to chart-friendly format
 */
export const transformRegionalDataForChart = (data: RegionalMetrics[]) => {
  return data.map(center => ({
    region: center.region,
    assets: center.assets,
    staff: center.staff,
    projects: center.projects,
    utilization: center.utilization,
    status: center.status,
  }));
};

/**
 * Export regional data as CSV
 */
export const exportRegionalDataAsCSV = (data: RegionalMetrics[], filename: string = 'regional_data') => {
  const csvContent = [
    ['Region', 'Assets', 'Staff', 'Projects', 'Utilization (%)', 'Status'],
    ...data.map(center => [
      center.region,
      center.assets.toString(),
      center.staff.toString(),
      center.projects.toString(),
      center.utilization.toFixed(1),
      center.status,
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  toast.success('Regional data exported successfully');
};
