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
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {
          show: true,
          title: 'Save as Image',
          name: `regional_overview_${new Date().toISOString().split('T')[0]}`,
          pixelRatio: 2,
          backgroundColor: isDark ? '#0f172a' : '#ffffff'
        },
        restore: {
          show: true,
          title: 'Restore'
        },
        dataView: {
          show: true,
          title: 'Data View',
          readOnly: false,
          lang: ['Data View', 'Close', 'Refresh']
        }
      },
      iconStyle: {
        borderColor: textColor
      },
      emphasis: {
        iconStyle: {
          borderColor: '#3b82f6'
        }
      },
      right: 20,
      top: 10
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: textColor, fontSize: 13 },
      padding: [12, 16],
      extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);',
      formatter: function(params: { name: string; value: number[] }) {
        const values = params.value;
        return `<div style="font-weight: 600; margin-bottom: 8px;">${params.name}</div>
                <div style="margin: 4px 0;">Assets: <strong>${values[0]}</strong></div>
                <div style="margin: 4px 0;">Staff: <strong>${values[1]}</strong></div>
                <div style="margin: 4px 0;">Projects: <strong>${values[2]}</strong></div>
                <div style="margin: 4px 0;">Utilization: <strong>${values[3]}%</strong></div>`;
      }
    },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'center',
      textStyle: { color: textColor, fontSize: 13 },
      itemGap: 12,
      itemWidth: 18,
      itemHeight: 12
    },
    radar: {
      indicator: [
        { name: 'Assets', max: 250 },
        { name: 'Staff', max: 70 },
        { name: 'Projects', max: 15 },
        { name: 'Utilization %', max: 100 },
      ],
      shape: 'polygon',
      splitNumber: 5,
      radius: '65%',
      name: {
        textStyle: { 
          color: textColor,
          fontSize: 14,
          fontWeight: '500',
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)',
          borderRadius: 4,
          padding: [4, 8]
        }
      },
      splitLine: {
        lineStyle: { 
          color: isDark ? '#374151' : '#e5e7eb',
          width: 2
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: isDark 
            ? ['rgba(31, 41, 55, 0.2)', 'rgba(31, 41, 55, 0.3)', 'rgba(31, 41, 55, 0.4)']
            : ['rgba(229, 231, 235, 0.2)', 'rgba(229, 231, 235, 0.3)', 'rgba(229, 231, 235, 0.4)']
        }
      },
      axisLine: {
        lineStyle: { 
          color: isDark ? '#4b5563' : '#d1d5db',
          width: 2
        }
      }
    },
    series: [
      {
        name: 'Regional Metrics',
        type: 'radar',
        data: sortedData.map((region, idx) => ({
          value: [region.assets, region.staff, region.projects, region.utilization],
          name: region.region,
          lineStyle: {
            width: 3,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
            shadowBlur: 5,
            shadowOffsetY: 2
          },
          areaStyle: {
            opacity: 0.3
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: '#fff'
          },
          emphasis: {
            areaStyle: {
              opacity: 0.6
            },
            lineStyle: {
              width: 4,
              shadowBlur: 10
            }
          }
        })),
        animationDelay: (idx: number) => idx * 100,
      }
    ],
    color: [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#ec4899'
    ],
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  });

  // Assets comparison chart
  const getAssetsChartOption = () => ({
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {
          show: true,
          title: 'Save as Image',
          name: `regional_assets_${new Date().toISOString().split('T')[0]}`,
          pixelRatio: 2,
          backgroundColor: isDark ? '#0f172a' : '#ffffff'
        },
        restore: {
          show: true,
          title: 'Restore'
        },
        dataView: {
          show: true,
          title: 'Data View',
          readOnly: false
        },
        magicType: {
          show: true,
          type: ['line', 'bar'],
          title: {
            line: 'Line Chart',
            bar: 'Bar Chart'
          }
        }
      },
      iconStyle: {
        borderColor: textColor
      },
      emphasis: {
        iconStyle: {
          borderColor: '#3b82f6'
        }
      },
      right: 20,
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { 
        type: 'shadow',
        shadowStyle: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
        }
      },
      backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: textColor, fontSize: 13 },
      padding: [12, 16],
      extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);',
      formatter: function(params: { name: string; value: number }[]) {
        const item = params[0];
        return `<div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
                <div>Assets: <strong>${item.value}</strong></div>`;
      }
    },
    xAxis: {
      type: 'category',
      data: sortedData.map(d => d.region),
      axisLabel: {
        color: textColor,
        rotate: 25,
        interval: 0,
        fontSize: 12,
        fontWeight: '500'
      },
      axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db', width: 2 } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'Number of Assets',
      axisLabel: { color: textColor, fontSize: 12 },
      axisLine: { show: true, lineStyle: { color: isDark ? '#4b5563' : '#d1d5db', width: 2 } },
      nameTextStyle: { color: textColor, fontSize: 13 },
      splitLine: { lineStyle: { color: isDark ? '#374151' : '#e5e7eb', type: 'dashed' } }
    },
    series: [
      {
        name: 'Assets',
        type: 'bar',
        data: sortedData.map(d => d.assets),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#60a5fa' },
              { offset: 1, color: '#2563eb' }
            ]
          },
          borderRadius: [10, 10, 0, 0],
          shadowColor: 'rgba(37, 99, 235, 0.4)',
          shadowBlur: 8,
          shadowOffsetY: 3
        },
        barMaxWidth: 50,
        label: {
          show: true,
          position: 'top',
          color: textColor,
          fontSize: 12,
          fontWeight: 'bold',
          distance: 5
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowColor: 'rgba(37, 99, 235, 0.6)'
          }
        },
        animationDelay: (idx: number) => idx * 100,
      }
    ],
    grid: { left: 70, right: 40, bottom: 90, top: 60 },
    animationDuration: 800,
    animationEasing: 'cubicOut'
  });

  // Staff comparison chart
  const getStaffChartOption = () => ({
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {
          show: true,
          title: 'Save as Image',
          name: `regional_staff_${new Date().toISOString().split('T')[0]}`,
          pixelRatio: 2,
          backgroundColor: isDark ? '#0f172a' : '#ffffff'
        },
        restore: {
          show: true,
          title: 'Restore'
        },
        dataView: {
          show: true,
          title: 'Data View',
          readOnly: false
        }
      },
      iconStyle: {
        borderColor: textColor
      },
      emphasis: {
        iconStyle: {
          borderColor: '#3b82f6'
        }
      },
      right: 20,
      top: 10
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: textColor, fontSize: 13 },
      padding: [12, 16],
      extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);',
      formatter: '{b}: <strong>{c}</strong> staff ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: { color: textColor, fontSize: 13 },
      itemGap: 12,
      itemWidth: 18,
      itemHeight: 18
    },
    series: [
      {
        name: 'Staff Distribution',
        type: 'pie',
        radius: ['45%', '75%'],
        avoidLabelOverlap: true,
        center: ['50%', '55%'],
        itemStyle: {
          borderRadius: 8,
          borderColor: isDark ? '#0f172a' : '#ffffff',
          borderWidth: 3,
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{c} staff',
          fontSize: 12,
          color: textColor,
          fontWeight: '500'
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          lineStyle: { color: textColor, width: 2 },
          smooth: true
        },
        emphasis: {
          scale: true,
          scaleSize: 8,
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          },
          label: {
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: sortedData.map(d => ({ 
          value: d.staff, 
          name: d.region 
        })),
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: (idx: number) => idx * 100,
      }
    ],
    color: [
      { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#3b82f6'}, {offset: 1, color: '#1d4ed8'}] },
      { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#10b981'}, {offset: 1, color: '#059669'}] },
      { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#f59e0b'}, {offset: 1, color: '#d97706'}] },
      { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#ef4444'}, {offset: 1, color: '#dc2626'}] },
      { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#8b5cf6'}, {offset: 1, color: '#6d28d9'}] },
      { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#ec4899'}, {offset: 1, color: '#be185d'}] },
    ],
  });

  // Projects comparison chart
  const getProjectsChartOption = () => ({
    toolbox: {
      show: true,
      feature: {
        dataZoom: {
          show: true,
          title: {
            zoom: 'Zoom',
            back: 'Reset Zoom'
          },
          yAxisIndex: 'none'
        },
        saveAsImage: {
          show: true,
          title: 'Save as Image',
          name: `regional_projects_${new Date().toISOString().split('T')[0]}`,
          pixelRatio: 2,
          backgroundColor: isDark ? '#0f172a' : '#ffffff'
        },
        restore: {
          show: true,
          title: 'Restore'
        },
        dataView: {
          show: true,
          title: 'Data View',
          readOnly: false
        }
      },
      iconStyle: {
        borderColor: textColor
      },
      emphasis: {
        iconStyle: {
          borderColor: '#3b82f6'
        }
      },
      right: 20,
      top: 10
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { 
        type: 'cross',
        crossStyle: {
          color: isDark ? '#6b7280' : '#9ca3af'
        },
        lineStyle: {
          type: 'dashed'
        }
      },
      backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: textColor, fontSize: 13 },
      padding: [12, 16],
      extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);'
    },
    legend: {
      data: ['Projects', 'Utilization %'],
      top: 10,
      textStyle: { color: textColor, fontSize: 13 },
      itemGap: 20,
      itemWidth: 28,
      itemHeight: 14
    },
    xAxis: {
      type: 'category',
      data: sortedData.map(d => d.region),
      axisLabel: {
        color: textColor,
        rotate: 25,
        interval: 0,
        fontSize: 12,
        fontWeight: '500'
      },
      axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db', width: 2 } },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Projects',
        position: 'left',
        axisLabel: { color: textColor, fontSize: 12 },
        axisLine: { show: true, lineStyle: { color: isDark ? '#4b5563' : '#d1d5db', width: 2 } },
        nameTextStyle: { color: textColor, fontSize: 13 },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#e5e7eb', type: 'dashed' } }
      },
      {
        type: 'value',
        name: 'Utilization %',
        position: 'right',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
          color: textColor,
          fontSize: 12
        },
        axisLine: { show: true, lineStyle: { color: isDark ? '#4b5563' : '#d1d5db', width: 2 } },
        nameTextStyle: { color: textColor, fontSize: 13 },
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
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#34d399' },
              { offset: 1, color: '#10b981' }
            ]
          },
          borderRadius: [8, 8, 0, 0],
          shadowColor: 'rgba(16, 185, 129, 0.4)',
          shadowBlur: 8,
          shadowOffsetY: 3
        },
        barMaxWidth: 40,
        emphasis: {
          itemStyle: {
            shadowBlur: 15,
            shadowColor: 'rgba(16, 185, 129, 0.6)'
          }
        },
        animationDelay: (idx: number) => idx * 80,
      },
      {
        name: 'Utilization %',
        type: 'line',
        yAxisIndex: 1,
        data: sortedData.map(d => d.utilization),
        smooth: true,
        itemStyle: { 
          color: '#f59e0b',
          borderWidth: 3,
          borderColor: '#fff'
        },
        lineStyle: { 
          width: 4,
          shadowColor: 'rgba(245, 158, 11, 0.3)',
          shadowBlur: 10,
          shadowOffsetY: 3
        },
        symbol: 'circle',
        symbolSize: 10,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 158, 11, 0.2)' },
              { offset: 1, color: 'rgba(245, 158, 11, 0.05)' }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            borderWidth: 4,
            shadowBlur: 10,
            shadowColor: 'rgba(245, 158, 11, 0.5)'
          }
        },
        animationDelay: (idx: number) => idx * 80 + 200,
      }
    ],
    grid: { left: 70, right: 70, bottom: 90, top: 70 },
    animationDuration: 1000,
    animationEasing: 'cubicOut'
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
