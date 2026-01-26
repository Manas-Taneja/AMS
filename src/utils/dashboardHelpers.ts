// Dashboard helper functions for trends, sparklines, and data generation

export interface TrendData {
  value: number;
  isPositive?: boolean;
  label?: string;
}

/**
 * Generate mock sparkline data for visualization
 */
export const generateSparklineData = (points: number = 10, min: number = 0, max: number = 100): number[] => {
  const data: number[] = [];
  let current = Math.random() * (max - min) + min;
  
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * 20;
    current = Math.max(min, Math.min(max, current + change));
    data.push(Math.round(current));
  }
  
  return data;
};

/**
 * Calculate trend from sparkline data
 */
export const calculateTrend = (data: number[]): TrendData => {
  if (data.length < 2) {
    return { value: 0, isPositive: true, label: 'No data' };
  }
  
  const first = data[0];
  const last = data[data.length - 1];
  const change = ((last - first) / first) * 100;
  
  return {
    value: Math.abs(change),
    isPositive: change >= 0,
    label: 'vs last period'
  };
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Generate mock dashboard metrics with trends
 */
export const generateDashboardMetrics = () => {
  const totalAssetsSparkline = generateSparklineData(12, 1200, 1300);
  const activeAssetsSparkline = generateSparklineData(12, 1100, 1250);
  const maintenanceSparkline = generateSparklineData(12, 15, 30);
  const transferredSparkline = generateSparklineData(12, 10, 25);
  
  return {
    totalAssets: {
      value: totalAssetsSparkline[totalAssetsSparkline.length - 1],
      sparkline: totalAssetsSparkline,
      trend: calculateTrend(totalAssetsSparkline),
      progress: 85
    },
    activeAssets: {
      value: activeAssetsSparkline[activeAssetsSparkline.length - 1],
      sparkline: activeAssetsSparkline,
      trend: calculateTrend(activeAssetsSparkline),
      progress: 92
    },
    maintenance: {
      value: maintenanceSparkline[maintenanceSparkline.length - 1],
      sparkline: maintenanceSparkline,
      trend: { 
        ...calculateTrend(maintenanceSparkline),
        isPositive: false // Lower maintenance is positive
      },
      progress: 23
    },
    transferred: {
      value: transferredSparkline[transferredSparkline.length - 1],
      sparkline: transferredSparkline,
      trend: calculateTrend(transferredSparkline),
      progress: 18
    }
  };
};

/**
 * Generate color class based on value and thresholds
 */
export const getStatusColor = (value: number, thresholds: { success: number; warning: number }): string => {
  if (value >= thresholds.success) return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
  if (value >= thresholds.warning) return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
  return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
};
