import React from 'react';
// import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus
} from 'lucide-react';
import { BaseLayout } from "../components/BaseLayout";
import { UnifiedHeader } from '../components/UnifiedHeader';
import InteractiveMap from '../components/InteractiveMap';
import AssetCategoryChart from '../components/AssetCategoryChart';
import ReactECharts from 'echarts-for-react';

// Mock data for the dashboard
const mockData = {
  totalAssets: 1247,
  totalValue: 2847500,
  activeAssets: 1189,
  maintenanceDue: 23,
  assetCategories: [
    { name: 'Computers', count: 456, value: 890000 },
    { name: 'Servers', count: 89, value: 1250000 },
    { name: 'Network Equipment', count: 234, value: 567000 },
    { name: 'Mobile Devices', count: 468, value: 139500 },
  ],
  locations: [
    { name: 'Headquarters', assets: 567, value: 1200000, coordinates: { lat: 28.6139, lng: 77.2090 } }, // Delhi
    { name: 'Branch Office A', assets: 234, value: 450000, coordinates: { lat: 19.0760, lng: 72.8777 } }, // Mumbai
    { name: 'Branch Office B', assets: 189, value: 380000, coordinates: { lat: 13.0827, lng: 80.2707 } }, // Chennai
    { name: 'Warehouse', assets: 257, value: 817500, coordinates: { lat: 22.5726, lng: 88.3639 } }, // Kolkata
  ],
  idleAssets: [
    { id: 1, type: 'asset' as const, name: 'Printer HP LaserJet', lastUsed: '15 days ago', location: 'Branch Office A' },
    { id: 2, type: 'asset' as const, name: 'Monitor Dell 24"', lastUsed: '22 days ago', location: 'Headquarters' },
    { id: 3, type: 'asset' as const, name: 'Router Cisco 2900', lastUsed: '30 days ago', location: 'Warehouse' },
    { id: 4, type: 'location' as const, name: 'Training Centre - South', lastUsed: '45 days ago', location: 'Training Centre - South' },
    { id: 5, type: 'location' as const, name: 'Branch Office C', lastUsed: '60 days ago', location: 'Branch Office C' },
  ]
};

// Types for props
interface KeyMetricsProps {
  data: typeof mockData;
}

interface IdleAsset {
  id: number;
  type: 'asset' | 'location';
  name: string;
  lastUsed: string;
  location: string;
}

function KeyMetrics({ data }: KeyMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 min-w-0">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.activeAssets.toLocaleString()}</div>
          <p className="text-xs text-green-600">{((data.activeAssets / data.totalAssets) * 100).toFixed(1)}% utilization</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{data.maintenanceDue}</div>
          <p className="text-xs text-red-600">Requires attention</p>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common asset management tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <button className="w-full flex items-center gap-3 p-3 text-left !bg-transparent !border !border-black text-green-600 hover:!bg-gray-200  rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span className="font-medium">Add New Asset</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-left !bg-transparent !border !border-black text-blue-500 hover:!bg-gray-200  rounded-lg transition-colors">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Schedule Maintenance</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-left !bg-transparent !border !border-black text-yellow-600 hover:!bg-gray-200  rounded-lg transition-colors">
            <Users className="w-4 h-4" />
            <span className="font-medium">Assign Asset</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-left !bg-transparent !border !border-black text-red-500 hover:!bg-gray-200  rounded-lg transition-colors">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Report Issue</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function IdleAssets({ items }: { items: IdleAsset[] }) {
  // Parse days from 'lastUsed' string (e.g., '15 days ago' -> 15)
  const data = items.map(item => ({
    name: item.name,
    days: parseInt(item.lastUsed)
  }));

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params: unknown) {
        const p = Array.isArray(params) ? params[0] : (params as { name: string; value: number });
        return `${p.name}: ${p.value} days idle`;
      }
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: { rotate: 0, fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: 'Days Idle',
      minInterval: 1
    },
    series: [
      {
        data: data.map(d => d.days),
        type: 'line',
        smooth: false,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: { width: 3 },
        itemStyle: { color: '#f59e42' },
        areaStyle: { color: 'rgba(245,158,66,0.15)' }
      }
    ],
    grid: { left: 40, right: 20, bottom: 60, top: 40 }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Idle Assets
        </CardTitle>
        <CardDescription>
          Assets that have not been used in 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-gray-500 text-sm">No idle assets or locations found.</div>
        ) : (
          <ReactECharts option={option} style={{ height: 350, width: '100%' }} className="bg-transparent border rounded-lg p-2" />
        )}
      </CardContent>
    </Card>
  );
}

const Dashboard: React.FC = () => {
  // const [search, setSearch] = useState('');

  // Placeholder handlers
  const handleExport = () => alert('Export Report clicked');
  const handleAdd = () => alert('Add Asset clicked');
  // const handleFilter = () => alert('Filter clicked');
  // const handleAnalytics = () => alert('Analytics clicked');
  // const handleSearchChange = (value: string) => setSearch(value);

  return (
    <BaseLayout className="p-6">
      <div className="space-y-6 text-black overflow-x-auto">
        <UnifiedHeader
          title="Asset Management System"
          subtitle="Overview of your organization's assets and activities"
          onExport={handleExport}
          onAdd={handleAdd}
          showLogo={true}
          addLabel="Add Asset"
          exportLabel="Export Report"
        />
        {/* <DashboardSearchFilter
          search={search}
          onSearchChange={handleSearchChange}
          onFilter={handleFilter}
          onAnalytics={handleAnalytics}
        /> */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
          <InteractiveMap />
          <AssetCategoryChart categories={mockData.assetCategories} />
        </div>
        <IdleAssets items={mockData.idleAssets} />
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 min-w-0">
          <div className="lg:col-span-2">
            <QuickActions />
          </div>
        </div>
        <KeyMetrics data={mockData} />
      </div>
    </BaseLayout>
  );
};

export default Dashboard;
