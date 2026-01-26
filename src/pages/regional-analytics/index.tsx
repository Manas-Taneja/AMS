"use client"

import React from 'react';
import { BaseLayout } from '@/components/BaseLayout';
import { UnifiedHeader } from '@/components/UnifiedHeader';
import RegionalChart from '@/components/RegionalChart';
import RegionalDetailsChart from '@/components/RegionalDetailsChart';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/utils/animations';

const RegionalAnalyticsPage: React.FC = () => {
  const handleExport = () => {
    const csvContent = [
      ['Region', 'Assets', 'Staff', 'Projects', 'Utilization'],
      ['Headquarters', '245', '68', '12', '87.5%'],
      ['Bhopal', '156', '42', '8', '82.3%'],
      ['Indore', '198', '55', '10', '85.6%'],
      ['Delhi', '134', '38', '7', '79.2%'],
      ['Mumbai', '167', '45', '9', '83.8%'],
      ['Bangalore', '189', '52', '11', '86.4%'],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regional_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute>
      <BaseLayout className="p-6">
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="initial"
          animate="in"
        >
          <motion.div variants={itemVariants}>
            <UnifiedHeader
              title="Regional Analytics"
              subtitle="Comprehensive performance metrics for all regional centers"
              onExport={handleExport}
              exportLabel="Export Regional Data"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tabs defaultValue="overview" className="w-full">
              <div className="flex justify-center mb-6">
                <TabsList className="grid w-auto gap-2 bg-transparent p-0 border border-border rounded-lg">
                  <TabsTrigger value="overview" className='border-0 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:dark:text-primary-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted transition-colors'>Overview</TabsTrigger>
                  <TabsTrigger value="details" className='border-0 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:dark:text-primary-foreground data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground hover:bg-muted transition-colors'>Detailed View</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="space-y-6">
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  animate="in"
                >
                  <RegionalChart />
                </motion.div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                <motion.div
                  variants={itemVariants}
                  initial="initial"
                  animate="in"
                >
                  <RegionalDetailsChart />
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </BaseLayout>
    </ProtectedRoute>
  );
};

export default RegionalAnalyticsPage;
