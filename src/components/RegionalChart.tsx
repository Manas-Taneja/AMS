import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { useTheme } from '@/context/ThemeContext';

interface RegionalData {
  region: string;
  assets: number;
  staff: number;
  projects: number;
  utilization: number;
  status: 'active' | 'maintenance' | 'inactive';
}

// Sample regional data for different centers
const regionalData: RegionalData[] = [
  {
    region: 'Headquarters',
    assets: 245,
    staff: 68,
    projects: 12,
    utilization: 87.5,
    status: 'active'
  },
  {
    region: 'Bhopal',
    assets: 156,
    staff: 42,
    projects: 8,
    utilization: 82.3,
    status: 'active'
  },
  {
    region: 'Indore',
    assets: 198,
    staff: 55,
    projects: 10,
    utilization: 85.6,
    status: 'active'
  },
  {
    region: 'Delhi',
    assets: 134,
    staff: 38,
    projects: 7,
    utilization: 79.2,
    status: 'active'
  },
  {
    region: 'Mumbai',
    assets: 167,
    staff: 45,
    projects: 9,
    utilization: 83.8,
    status: 'active'
  },
  {
    region: 'Bangalore',
    assets: 189,
    staff: 52,
    projects: 11,
    utilization: 86.4,
    status: 'active'
  },
];

const chartTypes = [
  { value: 'overview', label: 'Overview' },
  { value: 'assets', label: 'Assets' },
  { value: 'staff', label: 'Staff' },
  { value: 'projects', label: 'Projects' },
];

const RegionalChart: React.FC = () => {
  const router = useRouter();
  const [activeChartType, setActiveChartType] = useState('overview');
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const textColor = isDark ? '#e5e7eb' : '#374151';

  // Sort data by region name for consistent display
  const sortedData = useMemo(() => 
    [...regionalData].sort((a, b) => a.region.localeCompare(b.region)),
    []
  );

  const handleChartClick = (params: { name?: string; dataIndex?: number }) => {
    const regionName = params.name || sortedData[params.dataIndex || 0]?.region;
    if (regionName) {
      // Navigate to location page filtered by region
      router.push(`/location?search=${encodeURIComponent(regionName)}`);
    }
  };

  // Overview chart - showing all metrics in a radar chart
  const getOverviewChartOption = () => ({
    tooltip: {
      trigger: 'item',
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
    radar: {
      indicator: [
        { name: 'Assets', max: 250 },
        { name: 'Staff', max: 70 },
        { name: 'Projects', max: 15 },
        { name: 'Utilization %', max: 100 },
      ],
      shape: 'circle',
      splitNumber: 5,
      name: {
        textStyle: { color: textColor }
      },
      splitLine: {
        lineStyle: { color: isDark ? '#374151' : '#e5e7eb' }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: isDark 
            ? ['rgba(31, 41, 55, 0.1)', 'rgba(31, 41, 55, 0.2)']
            : ['rgba(229, 231, 235, 0.1)', 'rgba(229, 231, 235, 0.2)']
        }
      },
      axisLine: {
        lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' }
      }
    },
    series: [
      {
        name: 'Regional Metrics',
        type: 'radar',
        data: sortedData.map(region => ({
          value: [region.assets, region.staff, region.projects, region.utilization],
          name: region.region,
        })),
      }
    ],
    color: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  });

  // Assets comparison chart
  const getAssetsChartOption = () => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      textStyle: { color: textColor },
      formatter: function(params: { name: string; value: number }[]) {
        const item = params[0];
        return `${item.name}<br/>Assets: ${item.value}`;
      }
    },
    xAxis: {
      type: 'category',
      data: sortedData.map(d => d.region),
      axisLabel: {
        color: textColor,
        rotate: 30,
        interval: 0,
      },
      axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } }
    },
    yAxis: {
      type: 'value',
      name: 'Number of Assets',
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } },
      nameTextStyle: { color: textColor },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#e5e7eb' } }
    },
    series: [
      {
        name: 'Assets',
        type: 'bar',
        data: sortedData.map(d => d.assets),
        itemStyle: {
          color: '#2563eb',
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
    grid: { left: 60, right: 40, bottom: 80, top: 60 }
  });

  // Staff comparison chart
  const getStaffChartOption = () => ({
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      textStyle: { color: textColor },
      formatter: '{b}: {c} staff ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { color: textColor }
    },
    series: [
      {
        name: 'Staff Distribution',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        center: ['50%', '55%'],
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{c} staff',
          fontSize: 13,
          color: textColor,
        },
        labelLine: {
          show: true,
          lineStyle: { color: textColor }
        },
        data: sortedData.map(d => ({ 
          value: d.staff, 
          name: d.region 
        })),
      }
    ],
    color: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  });

  // Projects comparison chart
  const getProjectsChartOption = () => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      textStyle: { color: textColor }
    },
    legend: {
      data: ['Projects', 'Utilization %'],
      top: 10,
      textStyle: { color: textColor }
    },
    xAxis: {
      type: 'category',
      data: sortedData.map(d => d.region),
      axisLabel: {
        color: textColor,
        rotate: 30,
        interval: 0,
      },
      axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Projects',
        position: 'left',
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } },
        nameTextStyle: { color: textColor },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#e5e7eb' } }
      },
      {
        type: 'value',
        name: 'Utilization %',
        position: 'right',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
          color: textColor
        },
        axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db' } },
        nameTextStyle: { color: textColor },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Projects',
        type: 'bar',
        yAxisIndex: 0,
        data: sortedData.map(d => d.projects),
        itemStyle: { 
          color: '#10b981',
          borderRadius: [8, 8, 0, 0]
        },
        barMaxWidth: 40,
      },
      {
        name: 'Utilization %',
        type: 'line',
        yAxisIndex: 1,
        data: sortedData.map(d => d.utilization),
        itemStyle: { color: '#f59e0b' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 8,
      }
    ],
    grid: { left: 60, right: 60, bottom: 80, top: 60 }
  });

  const getChartOption = () => {
    switch(activeChartType) {
      case 'overview':
        return getOverviewChartOption();
      case 'assets':
        return getAssetsChartOption();
      case 'staff':
        return getStaffChartOption();
      case 'projects':
        return getProjectsChartOption();
      default:
        return getOverviewChartOption();
    }
  };

  const getChartDescription = () => {
    switch(activeChartType) {
      case 'overview':
        return 'Comprehensive view of all metrics across regions';
      case 'assets':
        return 'Asset distribution across different centers';
      case 'staff':
        return 'Staff allocation by regional centers';
      case 'projects':
        return 'Active projects and utilization rates by region';
      default:
        return 'Regional performance metrics';
    }
  };

  return (
    <Card>
      <CardContent>
        <Tabs value={activeChartType} onValueChange={setActiveChartType} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-4 gap-2 bg-transparent p-0 border border-border rounded-lg">
            {chartTypes.map(chartType => (
              <TabsTrigger 
                key={chartType.value} 
                value={chartType.value} 
                className='border-0 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:dark:text-primary-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted transition-colors'
              >
                {chartType.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeChartType} className="mt-2">
            <Card className='bg-transparent border-0 shadow-none'>
              <CardHeader>
                <CardTitle>Regional Center Performance</CardTitle>
                <CardDescription>
                  {getChartDescription()} • Click on any region to view details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReactECharts 
                  option={getChartOption()} 
                  style={{ height: 618.75, width: '100%' }} 
                  className='bg-transparent rounded-lg p-4 cursor-pointer' 
                  onEvents={{
                    click: handleChartClick
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RegionalChart;
