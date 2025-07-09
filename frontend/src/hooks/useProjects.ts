"use client"

import { useState, useEffect, useCallback } from "react"
import type { Project } from "../types/project"

interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useProjects(token: string | null): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]) // Initialize as empty array
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    if (!token) {
      setLoading(false)
      setError("No authentication token available")
      setProjects([]) // Ensure empty array
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("Fetching projects with token:", token ? "Present" : "Missing")

      const response = await fetch("http://localhost:8000/api/projects", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText || "Failed to fetch projects"}`)
      }

      const data = await response.json()
      console.log("Fetched data:", data)

      // Ensure data is an array before processing
      if (!Array.isArray(data)) {
        console.warn("API returned non-array data:", data)
        setProjects([])
        return
      }

      // Transform backend data to frontend format
      const transformedProjects: Project[] = data.map((p: any) => ({
        id: p.id || String(Math.random()),
        name: p.name || "Untitled Project",
        description: p.description || "",
        status: p.status || "Active",
        thumbnailUrl: p.thumbnail_url || p.thumbnailUrl,
        createdAt: p.created_at || p.createdAt,
        updatedAt: p.updated_at || p.updatedAt,
        tags: Array.isArray(p.tags) ? p.tags : [],
        progress: typeof p.progress === "number" ? p.progress : 0,
      }))

      setProjects(transformedProjects)
    } catch (err) {
      console.error("Fetch error:", err)
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      setProjects([]) // Ensure empty array on error
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return { projects, loading, error, refetch: fetchProjects }
}
