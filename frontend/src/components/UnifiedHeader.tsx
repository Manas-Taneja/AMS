import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"

export interface UnifiedHeaderProps {
  // Basic info
  title: string
  subtitle?: string
  
  // Actions
  onAdd?: () => void
  addLabel?: string
  onExport?: () => void
  exportLabel?: string
  
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
  onAdd,
  addLabel = "Add",
  onExport,
  exportLabel = "Export",
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
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
    </div>
  )
} 