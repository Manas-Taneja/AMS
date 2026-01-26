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
    <motion.div
      className="space-y-6 min-w-0"
      variants={containerVariants}
      initial="initial"
      animate="in"
    >
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
            <CheckCircle className="h-10 w-4 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{data.activeAssets.toLocaleString()}</div>
            <p className="text-xs text-green-600 dark:text-green-400">{((data.activeAssets / data.totalAssets) * 100).toFixed(1)}% utilization</p>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
            <AlertTriangle className="h-10 w-4 text-orange-500 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{data.maintenanceDue}</div>
            <p className="text-xs text-red-600 dark:text-red-400">Requires attention</p>
          </CardContent>
        </Card>
      </motion.div>
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Transferred Assets</CardTitle>
            <Transfer className="h-10 w-4 text-orange-500 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{data.transferredAssets}</div>
            <p className="text-xs text-muted-foreground">Currently at other locations</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
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
              className="w-full flex items-center gap-3 p-3 text-left !bg-transparent !border border-border text-green-600 dark:text-green-400 hover:!bg-accent rounded-lg transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddNewAsset}
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Add New Asset</span>
            </motion.button>
            <motion.button
              className="w-full flex items-center gap-3 p-3 text-left !bg-transparent !border border-border text-blue-500 dark:text-blue-400 hover:!bg-accent rounded-lg transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onScheduleMaintenance}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Schedule Maintenance</span>
            </motion.button>
            <motion.button
              className="w-full flex items-center gap-3 p-3 text-left !bg-transparent !border border-border text-yellow-600 dark:text-yellow-400 hover:!bg-accent rounded-lg transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAssignAsset}
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">Assign Asset</span>
            </motion.button>
            <motion.button
              className="w-full flex items-center gap-3 p-3 text-left !bg-transparent !border border-border text-red-500 dark:text-red-400 hover:!bg-accent rounded-lg transition-colors"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onReportIssue}
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
          <Tabs defaultValue="map" className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                <TabsTrigger value="map">Map View</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="map" className="space-y-6">
              <motion.div variants={fadeInUpVariants} initial="initial" animate="in">
                <InteractiveMap />
              </motion.div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <motion.div 
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="initial"
                animate="in"
              >
                <motion.div variants={itemVariants}>
                  <AssetCategoryChart />
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Idle Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <IdleAssetCategoryChart />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recovered Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UtilizationChart />
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants} className="lg:col-span-2">
                  <RegionalChart />
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 gap-8 min-w-0">
            {/* Left column: QuickActions */}
            <div>
              <QuickActions
                onAddNewAsset={handleAddNewAsset}
                onScheduleMaintenance={handleScheduleMaintenance}
                onAssignAsset={handleAssignAsset}
                onReportIssue={handleReportIssue}
              />
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

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
