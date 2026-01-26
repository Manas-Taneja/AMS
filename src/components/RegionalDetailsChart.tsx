import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { useTheme } from '@/context/ThemeContext';
import { LuMapPin, LuUsers, LuPackage, LuActivity } from 'react-icons/lu';

interface CenterDetails {
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

const centerDetailsData: Record<string, CenterDetails> = {
  'Headquarters': {
    name: 'Headquarters',
    type: 'headquarters',
    status: 'active',
    address: 'New Delhi, India',
    manager: 'Rajesh Kumar',
    assets: {
      total: 245,
      drones: 65,
      itComponents: 120,
      equipment: 45,
      vehicles: 15,
    },
    staff: {
      total: 68,
      technical: 35,
      administrative: 20,
      management: 13,
    },
    projects: {
      active: 12,
      completed: 45,
      pending: 8,
    },
    utilization: 87.5,
    performance: [
      { month: 'Jan', efficiency: 85, incidents: 2 },
      { month: 'Feb', efficiency: 87, incidents: 1 },
      { month: 'Mar', efficiency: 86, incidents: 3 },
      { month: 'Apr', efficiency: 88, incidents: 1 },
      { month: 'May', efficiency: 89, incidents: 2 },
      { month: 'Jun', efficiency: 87, incidents: 1 },
    ]
  },
  'Bhopal': {
    name: 'Bhopal',
    type: 'branch',
    status: 'active',
    address: 'Bhopal, Madhya Pradesh',
    manager: 'Amit Sharma',
    assets: {
      total: 156,
      drones: 42,
      itComponents: 75,
      equipment: 28,
      vehicles: 11,
    },
    staff: {
      total: 42,
      technical: 22,
      administrative: 14,
      management: 6,
    },
    projects: {
      active: 8,
      completed: 28,
      pending: 5,
    },
    utilization: 82.3,
    performance: [
      { month: 'Jan', efficiency: 80, incidents: 3 },
      { month: 'Feb', efficiency: 82, incidents: 2 },
      { month: 'Mar', efficiency: 81, incidents: 4 },
      { month: 'Apr', efficiency: 83, incidents: 2 },
      { month: 'May', efficiency: 84, incidents: 1 },
      { month: 'Jun', efficiency: 82, incidents: 2 },
    ]
  },
  'Indore': {
    name: 'Indore',
    type: 'branch',
    status: 'active',
    address: 'Indore, Madhya Pradesh',
    manager: 'Priya Verma',
    assets: {
      total: 198,
      drones: 55,
      itComponents: 95,
      equipment: 35,
      vehicles: 13,
    },
    staff: {
      total: 55,
      technical: 28,
      administrative: 18,
      management: 9,
    },
    projects: {
      active: 10,
      completed: 35,
      pending: 6,
    },
    utilization: 85.6,
    performance: [
      { month: 'Jan', efficiency: 83, incidents: 2 },
      { month: 'Feb', efficiency: 85, incidents: 1 },
      { month: 'Mar', efficiency: 84, incidents: 2 },
      { month: 'Apr', efficiency: 86, incidents: 1 },
      { month: 'May', efficiency: 87, incidents: 2 },
      { month: 'Jun', efficiency: 86, incidents: 1 },
    ]
  },
};

interface RegionalDetailsChartProps {
  centerName?: string;
}

const RegionalDetailsChart: React.FC<RegionalDetailsChartProps> = ({ 
  centerName = 'Headquarters' 
}) => {
  const [selectedCenter, setSelectedCenter] = useState(centerName);
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const textColor = isDark ? '#e5e7eb' : '#374151';

  const centerData = centerDetailsData[selectedCenter] || centerDetailsData['Headquarters'];

  // Asset Distribution Pie Chart
  const getAssetDistributionOption = () => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      textStyle: { color: textColor }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: textColor }
    },
    series: [
      {
        name: 'Assets',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{c}',
          fontSize: 12,
          color: textColor,
        },
        labelLine: {
          show: true,
          lineStyle: { color: textColor }
        },
        data: [
          { value: centerData.assets.drones, name: 'Drones' },
          { value: centerData.assets.itComponents, name: 'IT Components' },
          { value: centerData.assets.equipment, name: 'Equipment' },
          { value: centerData.assets.vehicles, name: 'Vehicles' },
        ],
      }
    ],
    color: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'],
  });

  // Staff Distribution Bar Chart
  const getStaffDistributionOption = () => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      textStyle: { color: textColor }
    },
    xAxis: {
      type: 'category',
      data: ['Technical', 'Administrative', 'Management'],
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } }
    },
    yAxis: {
      type: 'value',
      name: 'Staff Count',
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } },
      nameTextStyle: { color: textColor },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#e5e7eb' } }
    },
    series: [
      {
        name: 'Staff',
        type: 'bar',
        data: [
          centerData.staff.technical,
          centerData.staff.administrative,
          centerData.staff.management,
        ],
        itemStyle: {
          color: '#10b981',
          borderRadius: [8, 8, 0, 0]
        },
        barMaxWidth: 60,
        label: {
          show: true,
          position: 'top',
          color: textColor,
          fontSize: 12
        }
      }
    ],
    grid: { left: 60, right: 40, bottom: 60, top: 60 }
  });

  // Performance Trend Chart
  const getPerformanceTrendOption = () => ({
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      textStyle: { color: textColor }
    },
    legend: {
      data: ['Efficiency (%)', 'Incidents'],
      top: 10,
      textStyle: { color: textColor }
    },
    xAxis: {
      type: 'category',
      data: centerData.performance.map(p => p.month),
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Efficiency (%)',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
          color: textColor
        },
        axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } },
        nameTextStyle: { color: textColor },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#e5e7eb' } }
      },
      {
        type: 'value',
        name: 'Incidents',
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } },
        nameTextStyle: { color: textColor },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Efficiency (%)',
        type: 'line',
        yAxisIndex: 0,
        data: centerData.performance.map(p => p.efficiency),
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 8,
      },
      {
        name: 'Incidents',
        type: 'bar',
        yAxisIndex: 1,
        data: centerData.performance.map(p => p.incidents),
        itemStyle: { 
          color: '#ef4444',
          borderRadius: [8, 8, 0, 0]
        },
        barMaxWidth: 30,
      }
    ],
    grid: { left: 60, right: 60, bottom: 60, top: 60 }
  });

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Center Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Regional Center</CardTitle>
          <CardDescription>Choose a center to view detailed metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.keys(centerDetailsData).map((center) => (
              <button
                key={center}
                onClick={() => setSelectedCenter(center)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCenter === center
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {center}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Center Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{centerData.name}</CardTitle>
              <CardDescription className="mt-2 flex items-center gap-2">
                <LuMapPin className="h-4 w-4" />
                {centerData.address}
              </CardDescription>
            </div>
            <Badge className={getStatusBadgeColor(centerData.status)}>
              {centerData.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <LuPackage className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Assets</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">{centerData.assets.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <LuUsers className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">Total Staff</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-200">{centerData.staff.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <LuActivity className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Active Projects</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-200">{centerData.projects.active}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <LuActivity className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Utilization</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">{centerData.utilization}%</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Center Manager</p>
              <p className="font-semibold">{centerData.manager}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Center Type</p>
              <p className="font-semibold capitalize">{centerData.type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Distribution</CardTitle>
            <CardDescription>Breakdown of assets by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts 
              option={getAssetDistributionOption()} 
              style={{ height: 400, width: '100%' }} 
              className='bg-transparent rounded-lg' 
            />
          </CardContent>
        </Card>

        {/* Staff Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Distribution</CardTitle>
            <CardDescription>Staff allocation by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts 
              option={getStaffDistributionOption()} 
              style={{ height: 400, width: '100%' }} 
              className='bg-transparent rounded-lg' 
            />
          </CardContent>
        </Card>

        {/* Performance Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Trend (Last 6 Months)</CardTitle>
            <CardDescription>Efficiency and incident tracking over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts 
              option={getPerformanceTrendOption()} 
              style={{ height: 400, width: '100%' }} 
              className='bg-transparent rounded-lg' 
            />
          </CardContent>
        </Card>
      </div>

      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Project Summary</CardTitle>
          <CardDescription>Overview of project status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">Active Projects</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {centerData.projects.active}
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">Completed Projects</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {centerData.projects.completed}
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-300 font-medium mb-1">Pending Projects</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {centerData.projects.pending}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionalDetailsChart;
