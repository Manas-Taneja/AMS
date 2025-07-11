import React from 'react';
import { motion } from 'framer-motion';
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
import { 
  cardVariants, 
  containerVariants, 
  itemVariants, 
  fadeInUpVariants,
  chartVariants,
  buttonVariants
} from '@/utils/animations';
import { sampleChartData } from '../data/sampleChartData';
import IdleAssetCategoryChart from '../components/IdleAssetCategoryChart';
import UtilizationChart from '@/components/UtilizationChart';

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
    <motion.div 
      className="space-y-6 min-w-0"
      variants={containerVariants}
      initial="initial"
      animate="in"
    >
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
            <CheckCircle className="h-10 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeAssets.toLocaleString()}</div>
            <p className="text-xs text-green-600">{((data.activeAssets / data.totalAssets) * 100).toFixed(1)}% utilization</p>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
            <AlertTriangle className="h-10 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.maintenanceDue}</div>
            <p className="text-xs text-red-600">Requires attention</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function QuickActions() {
  return (
    <motion.div variants={fadeInUpVariants} initial="initial" animate="in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common asset management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="space-y-3"
            variants={containerVariants}
            initial="initial"
            animate="in"
          >
            <motion.button 
              className="w-full flex items-center gap-3 p-3 text-left !bg-transparent !border !border-black text-green-600 hover:!bg-gray-200  rounded-lg transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Add New Asset</span>
            </motion.button>
            <motion.button 
              className="w-full flex items-center gap-3 p-3 text-left !bg-transparent !border !border-black text-blue-500 hover:!bg-gray-200  rounded-lg transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Schedule Maintenance</span>
            </motion.button>
            <motion.button 
              className="w-full flex items-center gap-3 p-3 text-left !bg-transparent !border !border-black text-yellow-600 hover:!bg-gray-200  rounded-lg transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">Assign Asset</span>
            </motion.button>
            <motion.button 
              className="w-full flex items-center gap-3 p-3 text-left !bg-transparent !border !border-black text-red-500 hover:!bg-gray-200  rounded-lg transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Report Issue</span>
            </motion.button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
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
      <motion.div 
        className="space-y-6 text-black overflow-x-auto"
        variants={containerVariants}
        initial="initial"
        animate="in"
      >
        <motion.div variants={itemVariants}>
          <UnifiedHeader
              title="Asset Management System"
              subtitle="Overview of your organization's assets and activities"
              onExport={handleExport}
              onAdd={handleAdd}
            showLogo={true}
            addLabel="Add Asset"
            exportLabel="Export Report"
            />
        </motion.div>
          {/* <DashboardSearchFilter
            search={search}
            onSearchChange={handleSearchChange}
            onFilter={handleFilter}
            onAnalytics={handleAnalytics}
          /> */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0"
            variants={itemVariants}
          >
            <motion.div variants={fadeInUpVariants} initial="initial" animate="in">
              <InteractiveMap />
            </motion.div>
            <motion.div variants={fadeInUpVariants} initial="initial" animate="in">
              <AssetCategoryChart />
            </motion.div>
          </motion.div>
          <motion.div variants={fadeInUpVariants} initial="initial" animate="in" className="grid grid-cols-2 lg:grid-cols-2 gap-6 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle>Idle Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <IdleAssetCategoryChart />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recovered Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <UtilizationChart />
            </CardContent>
          </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-2 gap-8 min-w-0">
              {/* Left column: QuickActions */}
              <div>
                <QuickActions />
              </div>
              {/* Right column: KeyMetrics in 2 rows */}
              <div className="h-full">
                <KeyMetrics data={mockData} />
              </div>
            </div>
          </motion.div>
      </motion.div>
    </BaseLayout>
  );
};

export default Dashboard;
