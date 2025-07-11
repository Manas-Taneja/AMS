import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import AssetCategoryChart from './AssetCategoryChart';
import { sampleChartData } from '../data/sampleChartData';

const ChartDemo: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState('drones');

  const chartOptions = [
    { value: 'drones', label: 'Drones by Project Type' },
    { value: 'staff', label: 'Staff by Job Title' },
    { value: 'training', label: 'Training Personnel Distribution' },
    { value: 'itComponents', label: 'IT Components by Type' },
  ];

  const currentData = sampleChartData[selectedChart as keyof typeof sampleChartData];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Asset Category Charts Demo</CardTitle>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Select Chart Type:</label>
            <Select value={selectedChart} onValueChange={setSelectedChart}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a chart type" />
              </SelectTrigger>
              <SelectContent>
                {chartOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Description:</strong> {currentData.description}</p>
              <p><strong>Total Items:</strong> {currentData.categories.reduce((sum, cat) => sum + cat.count, 0)}</p>
            </div>
            
            <AssetCategoryChart />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentData.categories.map((category) => (
                <div key={category.name} className="flex justify-between items-center p-2 bg-muted rounded">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">{category.count} items</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subcategory Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {currentData.subcategories.slice(0, 10).map((subcategory) => (
                <div key={subcategory.name} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                  <div>
                    <span className="font-medium">{subcategory.name}</span>
                    <span className="text-muted-foreground ml-2">({subcategory.category})</span>
                  </div>
                  <span className="text-muted-foreground">{subcategory.count}</span>
                </div>
              ))}
              {currentData.subcategories.length > 10 && (
                <div className="text-center text-sm text-muted-foreground p-2">
                  ... and {currentData.subcategories.length - 10} more subcategories
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChartDemo; 