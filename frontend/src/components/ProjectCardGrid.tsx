"use client"

import { ProjectCard } from "./ProjectCard"
import type { Project } from "../types/project"

interface ProjectCardGridProps {
  projects?: Project[]
  viewMode?: "grid" | "list"
}

export default function ProjectCardGrid({ projects = [], viewMode = "grid" }: ProjectCardGridProps) {
  // Safety check - ensure projects is always an array
  const safeProjects = Array.isArray(projects) ? projects : []

  if (safeProjects.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No projects to display</p>
      </div>
    )
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {safeProjects.map((project) => (
          <ProjectCard key={project.id || Math.random()} project={project} viewMode="list" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {safeProjects.map((project) => (
        <ProjectCard key={project.id || Math.random()} project={project} viewMode="grid" />
      ))}
    </div>
  )
}
