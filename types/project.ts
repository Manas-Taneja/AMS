export interface Project {
  id: string
  name: string
  description?: string
  status: "Active" | "Paused" | "Completed"
  thumbnailUrl?: string
  createdAt?: string
  updatedAt?: string
  tags?: string[]
  progress?: number
}

export interface ProjectsState {
  projects: Project[]
  loading: boolean
  error: string | null
  search: string
  statusFilter: Project["status"] | "All"
  sortBy: "name" | "status" | "createdAt" | "updatedAt"
  sortOrder: "asc" | "desc"
}
