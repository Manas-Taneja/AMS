"use client"

import React from "react"
import { Card, CardContent } from "./card"
import { Input } from "./input"
import { Button } from "./button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Search, Grid3X3, List, Filter } from "lucide-react"

export interface FilterOption {
  value: string
  label: string
}

export interface SearchAndFilterProps {
  // Search
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  
  // Filters
  filters?: {
    key: string
    label: string
    value: string
    options: FilterOption[]
    onValueChange: (value: string) => void
  }[]
  
  // View mode (optional)
  viewMode?: "grid" | "list"
  onViewModeChange?: (mode: "grid" | "list") => void
  showViewToggle?: boolean
  
  // Results summary
  totalCount: number
  filteredCount: number
  itemLabel?: string
  
  // Clear filters
  onClearFilters?: () => void
  hasActiveFilters?: boolean
  
  // Custom actions
  customActions?: React.ReactNode
  
  // Styling
  className?: string
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  viewMode,
  onViewModeChange,
  showViewToggle = false,
  totalCount,
  filteredCount,
  itemLabel = "items",
  onClearFilters,
  hasActiveFilters = false,
  customActions,
  className = "",
}) => {
  return (
    <Card className={`border-0 shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex gap-3">
            {/* Filters */}
            {filters.map((filter) => (
              <Select key={filter.key} value={filter.value} onValueChange={filter.onValueChange}>
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}

            {/* Custom Actions */}
            {customActions}

            {/* View Mode Toggle */}
            {showViewToggle && viewMode && onViewModeChange && (
              <div className="flex border rounded-lg p-1 bg-gray-100">
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

        {/* Results Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Showing {filteredCount} of {totalCount} {itemLabel}
          </p>
          {hasActiveFilters && onClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default SearchAndFilter 