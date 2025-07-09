"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Project } from "../types/project"

interface ProjectsFiltersProps {
  search: string
  onSearchChange: (search: string) => void
  statusFilter: Project["status"] | "All"
  onStatusFilterChange: (status: Project["status"] | "All") => void
  activeFiltersCount: number
  onClearFilters: () => void
}

export function ProjectsFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  activeFiltersCount,
  onClearFilters,
}: ProjectsFiltersProps) {
  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Paused">Paused</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={onClearFilters} className="text-gray-600 bg-transparent">
              <X className="h-4 w-4 mr-1" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <span className="text-sm text-gray-600">Active filters:</span>
          {search && (
            <Badge variant="secondary">
              Search: "{search}"
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onSearchChange("")} />
            </Badge>
          )}
          {statusFilter !== "All" && (
            <Badge variant="secondary">
              Status: {statusFilter}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => onStatusFilterChange("All")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
