import React from "react"
import { motion } from "framer-motion"
import { AppSidebar } from "./ui/app-sidebar"
import { SidebarProvider } from "./ui/sidebar"
import { Button } from "./ui/button"
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react"
import { pageVariants, pageTransition, loadingVariants } from "@/utils/animations"

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

interface LoadingStateProps {
  message?: string
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading..." }) => (
  <motion.div 
    className="flex items-center justify-center h-full"
    variants={loadingVariants}
    initial="initial"
    animate="in"
  >
    <div className="text-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        <div 
          className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin mx-auto" 
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>
      </div>
      <motion.p 
        className="mt-4 text-gray-600 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  </motion.div>
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
    className="flex items-center justify-center h-full"
    variants={loadingVariants}
    initial="initial"
    animate="in"
  >
    <div className="text-center">
      <motion.div 
        className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      >
        <AlertCircle className="w-8 h-8 text-red-600" />
      </motion.div>
      <motion.h3 
        className="text-xl font-semibold text-gray-900 mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>
      <motion.p 
        className="text-gray-600 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {error}
      </motion.p>
      {onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </motion.div>
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
      <div className="flex min-h-screen w-full">
        <aside className="w-8">
          <AppSidebar />
        </aside>
        <main className={`flex-1 bg-gray-50 overflow-x-auto ${className}`}>
          {showBackButton && onBack && (
            <motion.div 
              className="p-6 pb-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button variant="outline" onClick={onBack} className="mb-4">
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
        </main>
      </div>
    </SidebarProvider>
  )
}

// Export individual components for cases where they might be needed separately
export { LoadingState, ErrorState } 