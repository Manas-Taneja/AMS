import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { sampleChartData } from '../data/sampleChartData';

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
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: '{b}: {c} items',
    },
    xAxis: {
      type: 'category',
      data: categories.map(cat => cat.name),
      axisLabel: { fontSize: 12, interval: 0, rotate: 15 },
    },
    yAxis: {
      type: 'value',
      name: 'Count',
      minInterval: 1,
    },
    series: [
      {
        name: 'Idle Assets',
        type: 'bar',
        data: categories.map(cat => cat.count),
        itemStyle: { color: '#2563eb' },
        barMaxWidth: 60,
      },
    ],
    grid: { left: 60, right: 0, bottom: 60, top: 40 },
    color: ['#2563eb'],
  });

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