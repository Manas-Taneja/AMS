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
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} items ({d}%)',
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderColor: isDark ? '#374151' : '#e5e7eb',
      textStyle: { color: textColor }
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { fontSize: 14, color: textColor },
    },
    series: [
      {
        name: 'Distribution',
        type: 'pie',
        radius: ['30%', '50%'],
        avoidLabelOverlap: false,
        center: ['50%', '55%'],
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{c}',
          fontSize: 15,
          color: textColor,
        },
        labelLine: {
          show: true,
          lineStyle: { color: textColor }
        },
        data: categories.map(cat => ({ value: cat.count, name: cat.name })),
      },
    ],
    color: ['#2563eb', '#f59e42', '#10b981', '#fbbf24', '#6366f1', '#f43f5e'],
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