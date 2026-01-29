import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { 
  LuPlus, 
  LuRefreshCw
} from 'react-icons/lu';

interface ChartEmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onRefresh?: () => void;
  showTabs?: boolean;
}

export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  title = 'No Data Available',
  description = 'There is no data to display for this chart. Try adjusting your filters or adding new data.',
  icon,
  actionLabel,
  onAction,
  onRefresh,
  showTabs = false
}) => {
  const DefaultIcon = icon || (
    <svg className="w-16 h-16 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {showTabs && (
          <div className="mb-4">
            <div className="flex gap-2 opacity-50 pointer-events-none">
              <div className="h-10 w-24 border border-border rounded-md" />
              <div className="h-10 w-24 border border-border rounded-md" />
              <div className="h-10 w-24 border border-border rounded-md" />
              <div className="h-10 w-24 border border-border rounded-md" />
            </div>
          </div>
        )}
        
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-muted-foreground">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div 
              className="flex flex-col items-center justify-center py-16 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="mb-6"
              >
                {DefaultIcon}
              </motion.div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Data to Display
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                {description}
              </p>
              
              <div className="flex gap-3">
                {onRefresh && (
                  <Button
                    variant="outline"
                    onClick={onRefresh}
                    className="gap-2"
                  >
                    <LuRefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                )}
                
                {onAction && actionLabel && (
                  <Button
                    onClick={onAction}
                    className="gap-2"
                  >
                    <LuPlus className="w-4 h-4" />
                    {actionLabel}
                  </Button>
                )}
              </div>

              {/* Decorative elements */}
              <div className="mt-8 flex gap-2 opacity-20">
                <div className="h-24 w-8 bg-primary rounded" />
                <div className="h-32 w-8 bg-primary rounded" />
                <div className="h-20 w-8 bg-primary rounded" />
                <div className="h-28 w-8 bg-primary rounded" />
                <div className="h-16 w-8 bg-primary rounded" />
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default ChartEmptyState;
