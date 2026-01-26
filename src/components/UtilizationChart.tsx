import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { useTheme } from '@/context/ThemeContext';

interface UtilizationData {
  category: string;
  totalIdle: number;
  recovered: number;
  recoveryRate: number;
}

// Sample utilization data for different asset categories
const utilizationData: Record<string, UtilizationData[]> = {
  drones: [
    { category: 'Aerial Photography', totalIdle: 45, recovered: 38, recoveryRate: 84.4 },
    { category: 'Surveying & Mapping', totalIdle: 32, recovered: 28, recoveryRate: 87.5 },
    { category: 'Search & Rescue', totalIdle: 28, recovered: 25, recoveryRate: 89.3 },
    { category: 'Agricultural Monitoring', totalIdle: 22, recovered: 18, recoveryRate: 81.8 },
    { category: 'Infrastructure Inspection', totalIdle: 18, recovered: 15, recoveryRate: 83.3 },
    { category: 'Security & Surveillance', totalIdle: 15, recovered: 12, recoveryRate: 80.0 },
  ],
  staff: [
    { category: 'Management', totalIdle: 25, recovered: 22, recoveryRate: 88.0 },
    { category: 'Technical Staff', totalIdle: 68, recovered: 58, recoveryRate: 85.3 },
    { category: 'Administrative', totalIdle: 42, recovered: 35, recoveryRate: 83.3 },
    { category: 'Sales & Marketing', totalIdle: 35, recovered: 30, recoveryRate: 85.7 },
    { category: 'Support Staff', totalIdle: 28, recovered: 24, recoveryRate: 85.7 },
    { category: 'Research & Development', totalIdle: 22, recovered: 19, recoveryRate: 86.4 },
  ],
  training: [
    { category: 'Instructors', totalIdle: 35, recovered: 30, recoveryRate: 85.7 },
    { category: 'Teachers', totalIdle: 28, recovered: 24, recoveryRate: 85.7 },
    { category: 'Students', totalIdle: 156, recovered: 140, recoveryRate: 89.7 },
    { category: 'Training Coordinators', totalIdle: 12, recovered: 10, recoveryRate: 83.3 },
    { category: 'Curriculum Developers', totalIdle: 8, recovered: 7, recoveryRate: 87.5 },
  ],
  itComponents: [
    { category: 'Servers', totalIdle: 45, recovered: 38, recoveryRate: 84.4 },
    { category: 'Network Equipment', totalIdle: 38, recovered: 32, recoveryRate: 84.2 },
    { category: 'Workstations', totalIdle: 125, recovered: 110, recoveryRate: 88.0 },
    { category: 'Storage Devices', totalIdle: 32, recovered: 28, recoveryRate: 87.5 },
    { category: 'Security Equipment', totalIdle: 28, recovered: 24, recoveryRate: 85.7 },
    { category: 'Peripherals', totalIdle: 85, recovered: 75, recoveryRate: 88.2 },
  ],
};

const chartTypes = [
  { value: 'drones', label: 'Drones' },
  { value: 'staff', label: 'Staff' },
  { value: 'training', label: 'Training' },
  { value: 'itComponents', label: 'IT Components' },
];

const UtilizationChart: React.FC = () => {
  const router = useRouter();
  const [activeChartType, setActiveChartType] = useState('drones');
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const textColor = isDark ? '#e5e7eb' : '#374151';

  const handleChartClick = (params: { dataIndex: number }) => {
    const dataIndex = params.dataIndex;
    const currentData = utilizationData[activeChartType] || [];
    const categoryName = currentData[dataIndex]?.category;
    
    if (!categoryName) return;
    
    // Map chart types to routes and filters
    switch(activeChartType) {
      case 'drones':
        // Navigate to items page with Drones category
        router.push(`/items?category=Drones&subcategory=${encodeURIComponent(categoryName)}`);
        break;
      case 'staff':
        // Navigate to staff page with job title filter
        router.push(`/staff?category=${encodeURIComponent(categoryName)}`);
        break;
      case 'training':
        // Navigate to training page with role filter
        router.push(`/training?category=${encodeURIComponent(categoryName)}`);
        break;
      case 'itComponents':
        // Navigate to items page with IT Components category
        router.push(`/items?category=${encodeURIComponent(categoryName)}`);
        break;
    }
  };

  const getChartOption = (data: UtilizationData[]) => ({
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
          name: `utilization_chart_${new Date().toISOString().split('T')[0]}`,
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
          lang: ['Data View', 'Close', 'Refresh'],
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          textareaColor: isDark ? '#374151' : '#f9fafb',
          textareaBorderColor: isDark ? '#4b5563' : '#d1d5db',
          textColor: textColor,
          buttonColor: '#3b82f6',
          buttonTextColor: '#ffffff'
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
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true
      },
      {
        type: 'slider',
        show: true,
        start: 0,
        end: 100,
        height: 20,
        bottom: 20,
        borderColor: isDark ? '#4b5563' : '#d1d5db',
        fillerColor: 'rgba(59, 130, 246, 0.2)',
        handleStyle: {
          color: '#3b82f6'
        },
        textStyle: {
          color: textColor
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      axisPointer: { 
        type: 'cross',
        crossStyle: {
          color: isDark ? '#6b7280' : '#9ca3af'
        },
        lineStyle: {
          type: 'dashed',
          width: 1
        }
      },
      backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: textColor, fontSize: 13 },
      padding: [12, 16],
      extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);',
      formatter: function(params: { dataIndex: number; seriesName: string; value: number; color: string }[]) {
        const dataIndex = params[0]?.dataIndex;
        const item = data[dataIndex];
        if (!item) return '';
        return `<div style="font-weight: 600; margin-bottom: 8px;">${item.category}</div>
                <div style="display: flex; align-items: center; margin: 4px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981; margin-right: 8px;"></span>
                  Recovery Rate: <strong>${item.recoveryRate.toFixed(1)}%</strong>
                </div>
                <div style="display: flex; align-items: center; margin: 4px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #3b82f6; margin-right: 8px;"></span>
                  Recovered: <strong>${item.recovered}</strong> assets
                </div>
                <div style="display: flex; align-items: center; margin: 4px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; margin-right: 8px;"></span>
                  Total Idle: <strong>${item.totalIdle}</strong> assets
                </div>`;
      }
    },
    legend: {
      data: ['Recovery Rate (%)', 'Total Idle', 'Recovered'],
      top: 10,
      textStyle: { color: textColor, fontSize: 13 },
      itemGap: 20,
      itemWidth: 28,
      itemHeight: 14
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.category),
      axisLabel: { 
        fontSize: 12,
        rotate: 30,
        interval: 0,
        color: textColor,
        fontWeight: '500'
      },
      axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db', width: 2 } },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Recovery Rate (%)',
        min: 0,
        max: 100,
        position: 'left',
        axisLabel: { formatter: '{value}%', color: textColor, fontSize: 12 },
        axisLine: { show: true, lineStyle: { color: isDark ? '#4b5563' : '#d1d5db', width: 2 } },
        nameTextStyle: { color: textColor, fontSize: 13, padding: [0, 0, 0, 0] },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#e5e7eb', type: 'dashed' } }
      },
      {
        type: 'value',
        name: 'Number of Assets',
        position: 'right',
        minInterval: 1,
        axisLabel: { color: textColor, fontSize: 12 },
        axisLine: { show: true, lineStyle: { color: isDark ? '#4b5563' : '#d1d5db', width: 2 } },
        nameTextStyle: { color: textColor, fontSize: 13 },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Recovery Rate (%)',
        type: 'line',
        yAxisIndex: 0,
        data: data.map(item => item.recoveryRate),
        smooth: true,
        itemStyle: { 
          color: '#10b981',
          borderWidth: 3,
          borderColor: '#fff'
        },
        lineStyle: { width: 4, shadowColor: 'rgba(16, 185, 129, 0.3)', shadowBlur: 10, shadowOffsetY: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ]
          }
        },
        symbol: 'circle',
        symbolSize: 10,
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderWidth: 4,
            shadowBlur: 10,
            shadowColor: 'rgba(16, 185, 129, 0.5)'
          }
        },
        animationDelay: (idx: number) => idx * 50,
      },
      {
        name: 'Total Idle',
        type: 'bar',
        yAxisIndex: 1,
        data: data.map(item => item.totalIdle),
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#fbbf24' },
              { offset: 1, color: '#f59e0b' }
            ]
          },
          borderRadius: [6, 6, 0, 0],
          shadowColor: 'rgba(245, 158, 11, 0.3)',
          shadowBlur: 5,
          shadowOffsetY: 2
        },
        barMaxWidth: 30,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(245, 158, 11, 0.5)'
          }
        },
        animationDelay: (idx: number) => idx * 50 + 100,
      },
      {
        name: 'Recovered',
        type: 'bar',
        yAxisIndex: 1,
        data: data.map(item => item.recovered),
        itemStyle: { 
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#60a5fa' },
              { offset: 1, color: '#3b82f6' }
            ]
          },
          borderRadius: [6, 6, 0, 0],
          shadowColor: 'rgba(59, 130, 246, 0.3)',
          shadowBlur: 5,
          shadowOffsetY: 2
        },
        barMaxWidth: 30,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(59, 130, 246, 0.5)'
          }
        },
        animationDelay: (idx: number) => idx * 50 + 150,
      }
    ],
    grid: { 
      left: 70, 
      right: 70, 
      bottom: 120, 
      top: 70,
      containLabel: false
    },
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  });

  const currentData = utilizationData[activeChartType] || [];

  return (
    <Card className='bg-transparent border-0 shadow-none'>
      <CardContent>
        <Tabs value={activeChartType} onValueChange={setActiveChartType} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-4 gap-1">
            {chartTypes.map(chartType => (
              <TabsTrigger key={chartType.value} value={chartType.value}>
                {chartType.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeChartType} className="mt-2">
            <Card className='bg-transparent border-0 shadow-none'>
              <CardHeader>
                <CardTitle>Asset Utilization</CardTitle>
                <CardDescription>
                    Utilization rate = (Recovered Assets / Total Idle Assets) × 100 • Click on any category to view details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReactECharts 
                  option={getChartOption(currentData)} 
                  style={{ height: 600, width: '100%' }} 
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

export default UtilizationChart; 