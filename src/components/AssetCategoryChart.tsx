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

const AssetCategoryChart: React.FC = () => {
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

  const getChartOption = (categories: Category[]) => ({
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {
          show: true,
          title: 'Save as Image',
          name: `asset_distribution_${new Date().toISOString().split('T')[0]}`,
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
      formatter: '{b}: {c} items ({d}%)',
      backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: textColor, fontSize: 13 },
      padding: [10, 15],
      extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: { fontSize: 14, color: textColor },
      itemGap: 12,
      itemWidth: 18,
      itemHeight: 18,
    },
    series: [
      {
        name: 'Distribution',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        center: ['50%', '55%'],
        itemStyle: {
          borderRadius: 8,
          borderColor: isDark ? '#0f172a' : '#ffffff',
          borderWidth: 3,
        },
        emphasis: {
          scale: true,
          scaleSize: 10,
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          },
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{c} ({d}%)',
          fontSize: 13,
          color: textColor,
          fontWeight: '500',
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          lineStyle: { color: textColor, width: 2 },
          smooth: true
        },
        data: categories.map(cat => ({ value: cat.count, name: cat.name })),
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: (idx: number) => idx * 100,
      },
    ],
    color: [
      { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#3b82f6'}, {offset: 1, color: '#1d4ed8'}] },
      { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#f59e0b'}, {offset: 1, color: '#d97706'}] },
      { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#10b981'}, {offset: 1, color: '#059669'}] },
      { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#f59e0b'}, {offset: 1, color: '#b45309'}] },
      { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#8b5cf6'}, {offset: 1, color: '#6d28d9'}] },
      { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{offset: 0, color: '#ec4899'}, {offset: 1, color: '#be185d'}] },
    ],
  });

  const currentData = sampleChartData[activeChartType as keyof typeof sampleChartData];

  return (
    <Card>
      <CardContent>
        <Tabs value={activeChartType} onValueChange={setActiveChartType} className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-4 gap-1">
            {chartTypes.map(chartType => (
              <TabsTrigger key={chartType.value} value={chartType.value} className='border-border data-[state=active]:text-foreground data-[state=active]:dark:text-foreground'>
                {chartType.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeChartType} className="mt-2">
            <Card className='bg-transparent border-0 shadow-none'>
              <CardHeader>
                <CardTitle>{currentData.title}</CardTitle>
                <CardDescription>{currentData.description} • Click on any segment to view details</CardDescription>
              </CardHeader>
              <CardContent>
                <ReactECharts 
                  option={getChartOption(currentData.categories)} 
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

export default AssetCategoryChart; 