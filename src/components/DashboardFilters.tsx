import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { 
  LuCalendar, 
  LuMapPin, 
  LuFilter, 
  LuRefreshCw,
  LuX 
} from 'react-icons/lu';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export interface DashboardFilters {
  dateRange: string;
  region: string;
  category: string;
}

interface DashboardFiltersProps {
  onFiltersChange: (filters: DashboardFilters) => void;
  onRefresh?: () => void;
}

const dateRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

const regionOptions = [
  { value: 'all', label: 'All Regions' },
  { value: 'headquarters', label: 'Headquarters' },
  { value: 'bhopal', label: 'Bhopal' },
  { value: 'indore', label: 'Indore' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'bangalore', label: 'Bangalore' },
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'drones', label: 'Drones' },
  { value: 'it', label: 'IT Components' },
  { value: 'staff', label: 'Staff' },
  { value: 'training', label: 'Training' },
];

export const DashboardFiltersComponent: React.FC<DashboardFiltersProps> = ({ 
  onFiltersChange,
  onRefresh 
}) => {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: 'month',
    region: 'all',
    category: 'all',
  });
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange = (key: keyof DashboardFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: DashboardFilters = {
      dateRange: 'month',
      region: 'all',
      category: 'all',
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = filters.region !== 'all' || filters.category !== 'all' || filters.dateRange !== 'month';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-md border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <LuFilter className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Filters</h3>
              {hasActiveFilters && (
                <motion.span 
                  className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  Active
                </motion.span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  className="h-8"
                >
                  <LuRefreshCw className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8"
              >
                <LuX className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-0' : 'rotate-45'}`} />
              </Button>
            </div>
          </div>

          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <LuCalendar className="w-4 h-4" />
                  Date Range
                </label>
                <Select
                  value={filters.dateRange}
                  onValueChange={(value) => handleFilterChange('dateRange', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRangeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Region Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <LuMapPin className="w-4 h-4" />
                  Region
                </label>
                <Select
                  value={filters.region}
                  onValueChange={(value) => handleFilterChange('region', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <LuFilter className="w-4 h-4" />
                  Category
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-transparent">
                  Actions
                </label>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasActiveFilters}
                  className="w-full"
                >
                  <LuX className="w-4 h-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardFiltersComponent;
