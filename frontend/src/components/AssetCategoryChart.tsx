import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
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

const AssetCategoryChart: React.FC = () => {
  const [activeChartType, setActiveChartType] = useState('drones');

  const getChartOption = (categories: Category[]) => ({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} items ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { fontSize: 14 },
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
        },
        labelLine: {
          show: true,
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
              <TabsTrigger key={chartType.value} value={chartType.value}>
                {chartType.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeChartType} className="mt-2">
            <Card>
              <CardHeader>
                <CardTitle>{currentData.title}</CardTitle>
                <CardDescription>{currentData.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ReactECharts 
                  option={getChartOption(currentData.categories)} 
                  style={{ height: 600, width: '100%' }} 
                  className='bg-transparent rounded-lg p-4' 
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