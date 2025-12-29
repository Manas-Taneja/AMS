import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

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
  const [activeChartType, setActiveChartType] = useState('drones');

  const getChartOption = (data: UtilizationData[]) => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function(params: { dataIndex: number }[]) {
        const dataIndex = params[0]?.dataIndex;
        const item = data[dataIndex];
        if (!item) return '';
        return `${item.category}<br/>
                Recovery Rate: ${item.recoveryRate.toFixed(1)}%<br/>
                Recovered: ${item.recovered}/${item.totalIdle} assets`;
      }
    },
    legend: {
      data: ['Recovery Rate (%)', 'Total Idle', 'Recovered'],
      top: 10,
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.category),
      axisLabel: { 
        fontSize: 12,
        rotate: 30,
        interval: 0
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Recovery Rate (%)',
        min: 0,
        max: 100,
        position: 'left',
        axisLabel: { formatter: '{value}%' },
      },
      {
        type: 'value',
        name: 'Number of Assets',
        position: 'right',
        minInterval: 1,
      }
    ],
    series: [
      {
        name: 'Recovery Rate (%)',
        type: 'line',
        yAxisIndex: 0,
        data: data.map(item => item.recoveryRate),
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 8,
      },
      {
        name: 'Total Idle',
        type: 'bar',
        yAxisIndex: 1,
        data: data.map(item => item.totalIdle),
        itemStyle: { color: '#f59e0b', opacity: 0.7 },
        barMaxWidth: 30,
      },
      {
        name: 'Recovered',
        type: 'bar',
        yAxisIndex: 1,
        data: data.map(item => item.recovered),
        itemStyle: { color: '#3b82f6' },
        barMaxWidth: 30,
      }
    ],
    grid: { 
      left: 60, 
      right: 60, 
      bottom: 80, 
      top: 60 
    },
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
                    Utilization rate = (Recovered Assets / Total Idle Assets) × 100
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReactECharts 
                  option={getChartOption(currentData)} 
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

export default UtilizationChart; 