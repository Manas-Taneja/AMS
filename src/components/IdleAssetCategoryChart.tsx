import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { sampleChartData } from '../data/sampleChartData';
import { useTheme } from '@/context/ThemeContext';

interface Category {
  name: string;
  count: number;
  value: number;
}

const chartTypes = [
  { value: 'drones', label: 'Drones' },
  { value: 'staff', label: 'Staff' },
  { value: 'training', label: 'Training' },
  { value: 'itComponents', label: 'IT Components' },
];

const IdleAssetCategoryChart: React.FC = () => {
  const router = useRouter();
  const [activeChartType, setActiveChartType] = useState('drones');
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const textColor = isDark ? '#e5e7eb' : '#374151';

  const handleChartClick = (params: { name: string }) => {
    const categoryName = params.name;
    
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

  const getChartOption = (categories: Category[]) => {
    const maxValue = Math.max(...categories.map(cat => cat.count));
    
    return {
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Save as Image',
            name: `idle_assets_${new Date().toISOString().split('T')[0]}`,
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
      tooltip: {
        trigger: 'axis',
        axisPointer: { 
          type: 'shadow',
          shadowStyle: {
            color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
          }
        },
        formatter: '{b}: <strong>{c}</strong> items',
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        textStyle: { color: textColor, fontSize: 13 },
        padding: [10, 15],
        extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);'
      },
      xAxis: {
        type: 'category',
        data: categories.map(cat => cat.name),
        axisLabel: { 
          fontSize: 12, 
          interval: 0, 
          rotate: 20, 
          color: textColor,
          fontWeight: '500'
        },
        axisLine: { lineStyle: { color: isDark ? '#4b5563' : '#d1d5db', width: 2 } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: 'Idle Count',
        minInterval: 1,
        axisLabel: { color: textColor, fontSize: 12 },
        axisLine: { show: true, lineStyle: { color: isDark ? '#4b5563' : '#d1d5db', width: 2 } },
        nameTextStyle: { color: textColor, fontSize: 13, padding: [0, 0, 0, 0] },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#e5e7eb', type: 'dashed' } }
      },
      series: [
        {
          name: 'Idle Assets',
          type: 'bar',
          data: categories.map((cat, idx) => ({
            value: cat.count,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: idx % 2 === 0 ? '#3b82f6' : '#6366f1' },
                  { offset: 1, color: idx % 2 === 0 ? '#1d4ed8' : '#4f46e5' }
                ]
              },
              borderRadius: [8, 8, 0, 0],
              shadowColor: 'rgba(59, 130, 246, 0.4)',
              shadowBlur: 8,
              shadowOffsetY: 3,
              opacity: 0.85 + (cat.count / maxValue) * 0.15
            }
          })),
          barMaxWidth: 50,
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            color: textColor,
            fontSize: 12,
            fontWeight: 'bold',
            distance: 5
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              opacity: 1,
              shadowBlur: 15,
              shadowColor: 'rgba(59, 130, 246, 0.6)'
            }
          },
          animationDelay: (idx: number) => idx * 80,
        },
      ],
      grid: { left: 60, right: 30, bottom: 80, top: 50 },
      animationDuration: 800,
      animationEasing: 'elasticOut'
    };
  };

  const currentData = sampleChartData[activeChartType as keyof typeof sampleChartData];

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
                <CardTitle>{currentData.title}</CardTitle>
                <CardDescription>{currentData.description} • Click on any bar to view details</CardDescription>
              </CardHeader>
              <CardContent>
                <ReactECharts 
                  option={getChartOption(currentData.categories)} 
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

export default IdleAssetCategoryChart; 