import React from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Users, Grid3X3, List, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import EmptyState from "./ui/EmptyState";

export interface FilterOption {
  value: string;
  label: string;
}

export interface SearchFilterTabsProps<T> {
  // Search
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Filters
  filters?: {
    key: string;
    label: string;
    value: string;
    options: FilterOption[];
    onValueChange: (value: string) => void;
  }[];

  // View mode
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  showViewToggle?: boolean;

  // Owner tabs
  owners: string[];
  groupedByOwner: Record<string, T[]>;

  // Render functions
  renderGridItem: (item: T) => React.ReactNode;
  renderListItem: (item: T) => React.ReactNode;

  // Empty state
  emptyStateIcon?: React.ReactNode;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  gridCols?: string;
  className?: string;

  // Results summary
  totalCount: number;
  filteredCount: number;
  itemLabel?: string;

  // Clear filters
  onClearFilters: () => void;

  // New props
  activeTab?: string;
  onTabChange?: (tab: string) => void;

  // All items
  allItems: T[];
}

export function SearchFilterTabs<T>({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  viewMode,
  onViewModeChange,
  showViewToggle = true,
  owners,
  groupedByOwner,
  renderGridItem,
  renderListItem,
  emptyStateIcon = <Users className="h-12 w-12 text-gray-400" />,
  emptyStateTitle = "No items found",
  emptyStateDescription = "Try adjusting your search or filters to find what you're looking for.",
  gridCols = "grid grid-cols-3 gap-6",
  className = "w-full mt-6",
  totalCount,
  filteredCount,
  itemLabel = "items",
  onClearFilters,
  activeTab,
  onTabChange,
  allItems,
}: SearchFilterTabsProps<T>) {
  return (
    <Card className={`border-0 shadow-sm ${className}`}>
      <CardContent className="p-6">
        {/* Search, Filters, View Toggle */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Grid3X3 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          {/* Filters and Actions */}
          <div className="flex gap-3">
            {filters.map((filter) => (
              <Select key={filter.key} value={filter.value} onValueChange={filter.onValueChange}>
                <SelectTrigger className="w-auto ">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
            {showViewToggle && (
              <div className="flex border rounded-lg p-1 bg-gray-100 border-none">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        {/* Results Summary and Clear Filters */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Showing {filteredCount} of {totalCount} {itemLabel}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onClearFilters();
            }}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 bg-white"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </Button>
        </div>
        {/* Owner Tabs */}
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full mt-6">
          <div className="items-center justify-between mb-4">
            <TabsList className="grid w-auto grid-cols-4 gap-1 h-auto p-1 bg-gray-100">
              <TabsTrigger
                value="all"
                className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm focus:outline-1"
              >
                <Users className="w-4 h-4" />
                <span className="font-medium">All</span>
                <Badge variant="secondary" className="ml-1 text-sm bg-gray-200 mt-1">
                  {allItems.length}
                </Badge>
              </TabsTrigger>
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
          </div>
          
          {/* All items tab */}
          <TabsContent value="all" className="mt-6">
            <AnimatePresence mode="wait">
              {allItems.length > 0 ? (
                <motion.div
                  key={`all-${viewMode}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {viewMode === "grid" ? (
                    <div className={gridCols}>
                      {allItems.map((item, index) => (
                        <React.Fragment key={index}>
                          {renderGridItem(item)}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {allItems.map((item, index) => (
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
          
          {/* Render content based on active tab */}
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
      </CardContent>
    </Card>
  );
}

export default SearchFilterTabs; 