import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../components/ui/card';
import {
  LuUsers as Users,
  LuTriangle as AlertTriangle,
  LuCheck as CheckCircle,
  LuPlus as Plus,
  LuArrowRightLeft as Transfer,
} from 'react-icons/lu';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '../../components/ui/tabs';
import { BaseLayout } from "../../components/BaseLayout";
import { UnifiedHeader } from '../../components/UnifiedHeader';
import InteractiveMap from '../../components/InteractiveMap';
import AssetCategoryChart from '../../components/AssetCategoryChart';
import {
  containerVariants,
  itemVariants,
  fadeInUpVariants,
} from '@/utils/animations';
import IdleAssetCategoryChart from '../../components/IdleAssetCategoryChart';
import UtilizationChart from '@/components/UtilizationChart';
import IdleNotifications from '../../components/IdleNotifications';
import RegionalChart from '../../components/RegionalChart';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

// Mock data for the dashboard
const mockData = {
  totalAssets: 1247,
  totalValue: 2847500,
  activeAssets: 1189,
  maintenanceDue: 23,
  transferredAssets: 18,
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
    { id: 6, type: 'asset' as const, name: 'DJI Mavic 3 Pro', lastUsed: '35 days ago', location: 'Data Center' },
    { id: 7, type: 'asset' as const, name: 'Thermal Imaging Camera', lastUsed: '42 days ago', location: 'Branch Office A' },
    { id: 8, type: 'asset' as const, name: 'RTK GPS Module', lastUsed: '55 days ago', location: 'Headquarters' },
    { id: 9, type: 'location' as const, name: 'Conference Room B', lastUsed: '38 days ago', location: 'Conference Room B' },
    { id: 10, type: 'asset' as const, name: 'Network Switch 48-Port', lastUsed: '67 days ago', location: 'Warehouse' },
  ]
};

// Types for props
interface KeyMetricsProps {
  data: typeof mockData;
}
interface IdleItemWithDays {
  id: number;
  type: 'asset' | 'location';
  name: string;
  lastUsed: string;
  location: string;
  daysIdle: number;
}

// Helper function to calculate days idle from "X days ago" string
const calculateDaysIdle = (lastUsed: string | undefined): number => {
  if (!lastUsed) return 0;
  const match = lastUsed.match(/(\d+)\s*days?\s*ago/);
  return match ? parseInt(match[1]!, 10) : 0;
};

function KeyMetrics({ data }: KeyMetricsProps) {
  return (
    <>
      <motion.div variants={itemVariants}>
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500 h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">
              {data.activeAssets.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">{((data.activeAssets / data.totalAssets) * 100).toFixed(1)}% utilization</p>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500 h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {data.maintenanceDue}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">Requires attention</p>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-purple-500 h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Transferred Assets</CardTitle>
            <Transfer className="h-5 w-5 text-purple-500 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {data.transferredAssets}
            </div>
            <p className="text-xs text-muted-foreground font-medium">Currently at other locations</p>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}

function QuickActions({
  onAddNewAsset,
  onScheduleMaintenance,
  onAssignAsset,
  onReportIssue
}: {
  onAddNewAsset: () => void;
  onScheduleMaintenance: () => void;
  onAssignAsset: () => void;
  onReportIssue: () => void;
}) {
  return (
    <motion.div variants={fadeInUpVariants} initial="initial" animate="in">
      <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common asset management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              className="flex items-center gap-3 p-4 text-left !bg-transparent !border-2 border-green-500/30 text-green-600 dark:text-green-400 hover:!bg-green-500/10 hover:border-green-500 rounded-lg transition-all duration-200"
              onClick={onAddNewAsset}
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium text-sm">Add New Asset</span>
            </button>
            <button
              className="flex items-center gap-3 p-4 text-left !bg-transparent !border-2 border-blue-500/30 text-blue-500 dark:text-blue-400 hover:!bg-blue-500/10 hover:border-blue-500 rounded-lg transition-all duration-200"
              onClick={onScheduleMaintenance}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium text-sm">Schedule Maintenance</span>
            </button>
            <button
              className="flex items-center gap-3 p-4 text-left !bg-transparent !border-2 border-yellow-500/30 text-yellow-600 dark:text-yellow-400 hover:!bg-yellow-500/10 hover:border-yellow-500 rounded-lg transition-all duration-200"
              onClick={onAssignAsset}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium text-sm">Assign Asset</span>
            </button>
            <button
              className="flex items-center gap-3 p-4 text-left !bg-transparent !border-2 border-red-500/30 text-red-500 dark:text-red-400 hover:!bg-red-500/10 hover:border-red-500 rounded-lg transition-all duration-200"
              onClick={onReportIssue}
            >
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium text-sm">Report Issue</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  useAuth(); // ensure auth context initialized
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<number>>(new Set());

  // Transform idle assets to include days idle calculation
  const idleItemsWithDays: IdleItemWithDays[] = useMemo(() =>
    mockData.idleAssets.map(asset => ({
      ...asset,
      daysIdle: calculateDaysIdle(asset.lastUsed!)
    })), []
  );

  // Filter out dismissed notifications
  const activeIdleItems = useMemo(() =>
    idleItemsWithDays.filter(item => !dismissedNotifications.has(item.id)),
    [idleItemsWithDays, dismissedNotifications]
  );

  // Real API handlers
  const handleExport = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Assets', mockData.totalAssets],
      ['Active Assets', mockData.activeAssets],
      ['Total Value', `$${mockData.totalValue.toLocaleString()}`],
      ['Maintenance Due', mockData.maintenanceDue],
      ['Transferred Assets', mockData.transferredAssets],
      ['Export Date', new Date().toISOString().split('T')[0]],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Dashboard report exported successfully');
  };

  const handleAdd = () => {
    router.push('/items');
  };

  const handleAddNewAsset = () => {
    router.push('/items');
  };

  const handleScheduleMaintenance = () => {
    toast.info('Maintenance scheduling feature coming soon');
  };

  const handleAssignAsset = () => {
    toast.info('Asset assignment feature coming soon');
  };

  const handleReportIssue = () => {
    toast.info('Issue reporting feature coming soon');
  };

  const handleDismissNotification = (id: number) => {
    setDismissedNotifications(prev => new Set([...prev, id]));
  };

  return (
    <BaseLayout className="p-6">
      <motion.div
        className="space-y-6 overflow-x-auto"
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
            />
        </motion.div>

        {/* Idle Notifications - Toast Only */}
        <IdleNotifications
          idleItems={activeIdleItems}
          onDismiss={handleDismissNotification}
          onViewDetails={(id, type) => {
            if (type === 'asset') {
              router.push(`/items/${id}`);
            } else {
              router.push(`/location/${id}`);
            }
          }}
        />

        {/* <DashboardSearchFilter
            search={search}
            onSearchChange={handleSearchChange}
            onFilter={handleFilter}
            onAnalytics={handleAnalytics}
          /> */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="map" className="w-full" aria-label="Dashboard view selector">
            <div className="flex justify-center mb-6">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2" role="tablist">
                <TabsTrigger value="map" role="tab" aria-controls="map-panel">Map View</TabsTrigger>
                <TabsTrigger value="analytics" role="tab" aria-controls="analytics-panel">Analytics</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="map" className="space-y-6" role="tabpanel" id="map-panel" aria-labelledby="map-tab">
              <motion.div 
                variants={fadeInUpVariants} 
                initial="initial" 
                animate="in"
              >
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
                  <InteractiveMap />
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6" role="tabpanel" id="analytics-panel" aria-labelledby="analytics-tab">
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="initial"
                animate="in"
              >
                <motion.div 
                  variants={itemVariants}
                  role="region"
                  aria-label="Asset category distribution chart"
                >
                  <AssetCategoryChart />
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  role="region"
                  aria-label="Idle assets breakdown chart"
                >
                  <Card className="h-full shadow-md hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <CardTitle>Idle Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <IdleAssetCategoryChart />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  variants={itemVariants} 
                  className="lg:col-span-2"
                  role="region"
                  aria-label="Asset utilization and recovery chart"
                >
                  <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
                    <CardHeader>
                      <CardTitle>Recovered Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UtilizationChart />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  variants={itemVariants} 
                  className="lg:col-span-2"
                  role="region"
                  aria-label="Regional performance metrics chart"
                >
                  <RegionalChart />
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
        {/* Key Metrics - Top Priority */}
        <motion.div variants={itemVariants} className="w-full">
          <section aria-labelledby="key-metrics-heading" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <h2 id="key-metrics-heading" className="sr-only">Key Performance Metrics</h2>
            <KeyMetrics data={mockData} />
          </section>
        </motion.div>

        {/* Quick Actions - Secondary Priority */}
        <motion.div variants={itemVariants} className="w-full">
          <section aria-labelledby="quick-actions-heading">
            <h2 id="quick-actions-heading" className="sr-only">Quick Actions</h2>
            <QuickActions
            onAddNewAsset={handleAddNewAsset}
            onScheduleMaintenance={handleScheduleMaintenance}
            onAssignAsset={handleAssignAsset}
            onReportIssue={handleReportIssue}
          />
          </section>
        </motion.div>
      </motion.div>
    </BaseLayout>
  );
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
