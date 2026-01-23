import { Button } from "@/components/ui/button"
import { LuPlus as Plus, LuDownload as Download, LuChevronRight, LuHome } from "react-icons/lu"
import Image from 'next/image'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export interface UnifiedHeaderProps {
  // Basic info
  title: string
  subtitle?: string
  
  // Navigation
  breadcrumbs?: Array<{ label: string; href?: string }>
  
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
  breadcrumbs = [],
  onAdd,
  addLabel = "Add",
  onExport,
  exportLabel = "Export",
  showLogo = false,
  logoUrl = "",
  logoAlt = "Logo",
  className = "",
}: UnifiedHeaderProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1">
                  <LuHome className="h-3 w-3" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <div key={index} className="flex items-center gap-1.5">
                  <BreadcrumbItem>
                    {isLast || !crumb.href ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {showLogo && logoUrl && (
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={100}
                height={100}
                className="h-10 w-auto"
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
            <Button variant="outline" size="sm" onClick={onExport} className="text-white shadow-lg border-gray-800">
              <Download className="h-4 w-4 mr-2" />
              {exportLabel}
            </Button>
          )}

          {/* Add Button */}
          {onAdd && (
            <Button size="sm" onClick={onAdd} className="text-black shadow-lg border-gray-800">
              <Plus className="h-4 w-4 mr-2" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 