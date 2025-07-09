import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

interface Category {
  name: string;
  count: number;
  value: number;
}

interface AssetCategoryChartProps {
  categories: Category[];
}

const AssetCategoryChart: React.FC<AssetCategoryChartProps> = ({ categories }) => {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} assets ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      textStyle: { fontSize: 14 },
    },
    series: [
      {
        name: 'Assets by Category',
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assets by Category</CardTitle>
        <CardDescription>Distribution of assets across categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ReactECharts option={option} style={{ height: 600, width: '100%' }} className='bg-transparent border rounded-lg p-4' />
      </CardContent>
    </Card>
  );
};

export default AssetCategoryChart; 