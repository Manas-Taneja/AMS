import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Grid3X3, List, SortAsc, SortDesc, Download, ArrowLeft } from "lucide-react"

export interface SortOption {
  key: string
  label: string
}

export interface FilterOption {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

export interface UnifiedHeaderProps {
  // Basic info
  title: string
  subtitle?: string
  
  // Count info
  totalCount?: number
  itemLabel?: string
  
  // Back navigation
  onBack?: () => void
  backLabel?: string
  
  // Actions
  onAdd?: () => void
  addLabel?: string
  onExport?: () => void
  exportLabel?: string
  
  // View mode
  viewMode?: "grid" | "list"
  onViewModeChange?: (mode: "grid" | "list") => void
  showViewToggle?: boolean
  
  // Sorting
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void
  sortOptions?: SortOption[]
  
  // Search
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  
  // Filters
  filters?: FilterOption[]
  
  // Logo
  showLogo?: boolean
  logoUrl?: string
  logoAlt?: string
  
  // Styling
  className?: string
}

export function UnifiedHeader({
  title,
  subtitle,
  totalCount,
  itemLabel = "items",
  onBack,
  backLabel = "Back",
  onAdd,
  addLabel = "Add",
  onExport,
  exportLabel = "Export",
  viewMode,
  onViewModeChange,
  showViewToggle = false,
  sortBy,
  sortOrder = "asc",
  onSortChange,
  sortOptions = [
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created Date" },
    { key: "updatedAt", label: "Last Updated" },
  ],
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  showLogo = false,
  logoUrl = "src/assets/logo.webp",
  logoAlt = "Logo",
  className = "",
}: UnifiedHeaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backLabel}
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            {showLogo && (
              <img
                src={logoUrl}
                alt={logoAlt}
                className="h-8 w-auto"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
              {totalCount !== undefined && (
                <p className="text-gray-600 mt-1">
                  {totalCount} {totalCount === 1 ? itemLabel.slice(0, -1) : itemLabel} total
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          {showViewToggle && viewMode && onViewModeChange && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewModeChange(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
          )}

          {/* Sort Dropdown */}
          {sortBy && sortOrder && onSortChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {sortOrder === "asc" ? <SortAsc className="h-4 w-4 mr-2" /> : <SortDesc className="h-4 w-4 mr-2" />}
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.key}
                    onClick={() => onSortChange(option.key, sortOrder)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export Button */}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              {exportLabel}
            </Button>
          )}

          {/* Add Button */}
          {onAdd && (
            <Button size="sm" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      {(onSearchChange || filters.length > 0) && (
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {onSearchChange && (
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full md:w-64 border rounded px-3 py-2"
            />
          )}
          {filters.map((filter) => (
            <select
              key={filter.label}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="w-full md:w-48 border rounded px-3 py-2"
            >
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  )
} 