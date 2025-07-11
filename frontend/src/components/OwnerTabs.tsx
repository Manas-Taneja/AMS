import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Users, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import EmptyState from "./ui/EmptyState";

interface OwnerTabsProps<T> {
  owners: string[];
  groupedByOwner: Record<string, T[]>;
  viewMode: 'grid' | 'list';
  renderGridItem: (item: T) => React.ReactNode;
  renderListItem: (item: T) => React.ReactNode;
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  gridCols?: string;
  className?: string;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function OwnerTabs<T>({
  owners,
  groupedByOwner,
  viewMode,
  renderGridItem,
  renderListItem,
  emptyStateIcon = <Users className="h-12 w-12 text-gray-400" />,
  emptyStateTitle = "No items found",
  emptyStateDescription = "Try adjusting your search or filters to find what you're looking for.",
  gridCols = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
  className = "w-full mt-6",
  onClearFilters,
  hasActiveFilters = false
}: OwnerTabsProps<T>) {
  console.log('OwnerTabs props:', { hasActiveFilters, onClearFilters: !!onClearFilters });
  
  return (
    <Tabs defaultValue={owners[0]} className={className}>
      <div className="flex items-center justify-between mb-4">
        <TabsList className="grid w-auto grid-cols-3 gap-1 h-auto p-1 bg-gray-100">
          {owners.map((owner) => (
            <TabsTrigger
              key={owner}
              value={owner}
              className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm focus:outline-1"
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">{owner}</span>
              <Badge variant="secondary" className="ml-1 text-sm bg-gray-200 mt-1">
                {groupedByOwner[owner]?.length || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
        {onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 bg-white"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </Button>
        )}
      </div>
      {owners.map((owner) => (
        <TabsContent key={owner} value={owner} className="mt-6">
          <AnimatePresence mode="wait">
            {groupedByOwner[owner] && groupedByOwner[owner].length > 0 ? (
              <motion.div
                key={`${owner}-${viewMode}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {viewMode === "grid" ? (
                  <div className={gridCols}>
                    {groupedByOwner[owner]!.map((item, index) => (
                      <React.Fragment key={index}>
                        {renderGridItem(item)}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groupedByOwner[owner]!.map((item, index) => (
                      <React.Fragment key={index}>
                        {renderListItem(item)}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <EmptyState
                  icon={emptyStateIcon}
                  title={emptyStateTitle}
                  description={emptyStateDescription}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      ))}
    </Tabs>
  );
} 