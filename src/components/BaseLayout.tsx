import React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { AppSidebar } from "./ui/app-sidebar"
import { SidebarProvider } from "./ui/sidebar"
import { Button } from "./ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CommandPalette } from "@/components/CommandPalette"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  LuArrowLeft as ArrowLeft,
  LuTriangle as AlertCircle,
  LuRefreshCcw as RefreshCw,
  LuSearch
} from "react-icons/lu"
import { pageVariants, pageTransition } from "@/utils/animations"

// Helper component to access sidebar context - REMOVED SidebarTrigger
// const SidebarTrigger = () => {
//   const { toggleSidebar } = useSidebar()
//   return (
//     <Button 
//       variant="ghost" 
//       size="icon" 
//       onClick={toggleSidebar}
//       className="text-gray-500 hover:text-gray-900"
//     >
//       <LuPanelLeft className="h-5 w-5" />
//     </Button>
//   )
// }

interface BaseLayoutProps {
  children: React.ReactNode
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  showBackButton?: boolean
  onBack?: () => void
  backLabel?: string
  className?: string
}

const LoadingState: React.FC = () => (
  <div className="flex flex-col space-y-4 p-8 w-full max-w-7xl mx-auto h-full">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6">
       <Skeleton className="h-32 w-full rounded-xl" />
       <Skeleton className="h-32 w-full rounded-xl" />
       <Skeleton className="h-32 w-full rounded-xl" />
       <Skeleton className="h-32 w-full rounded-xl" />
    </div>

    <div className="space-y-4">
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  </div>
)

interface ErrorStateProps {
  error: string
  onRetry?: () => void
  title?: string
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  onRetry, 
  title = "Error Loading Content" 
}) => (
  <motion.div 
    className="flex items-center justify-center h-full min-h-[60vh]"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="text-center max-w-md mx-auto p-6 bg-card rounded-xl shadow-sm border border-red-100 dark:border-red-900/50">
      <div className="w-16 h-16 bg-red-50 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{error}</p>
      {onRetry && (
        <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  </motion.div>
)

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  loading = false,
  error = null,
  onRetry,
  showBackButton = false,
  onBack,
  backLabel = "Back",
  className = ""
}) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full text-green relative bg-background">
        <aside className="w-8 z-40">
          <AppSidebar />
        </aside>
        <main className={`flex-1 overflow-x-auto ${className}`}>
          {/* Top Bar with Command Palette and Theme Toggle - Hidden on Desktop */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur-sm md:hidden">
             {/* SidebarTrigger removed */}
             <div className="flex-1">
               {/* Spacer */}
             </div>
             {/* Mobile Command Palette Trigger */}
             <CommandPalette 
               customTrigger={
                 <Button variant="ghost" size="icon">
                   <LuSearch className="h-5 w-5" />
                 </Button>
               }
             />
             {/* Theme Toggle */}
             <ThemeToggle />
          </header>

          <div className="p-0">
            {showBackButton && onBack && (
              <motion.div 
                className="px-6 pt-6 pb-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button variant="ghost" onClick={onBack} className="mb-2 pl-0 hover:bg-transparent hover:text-blue-600 dark:hover:text-blue-400">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {backLabel}
                </Button>
              </motion.div>
            )}
            
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState error={error} onRetry={onRetry} />
            ) : (
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
              >
                {children}
              </motion.div>
            )}
          </div>
          
          {/* Watermark */}
          <div className="fixed bottom-4 right-4 pointer-events-none z-0">
            <Image
              src="/assets/PrakharLogo.png"
              alt="Watermark"
              width={100}
              height={100}
              className="opacity-"
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

// Export individual components for cases where they might be needed separately
export { LoadingState, ErrorState }
