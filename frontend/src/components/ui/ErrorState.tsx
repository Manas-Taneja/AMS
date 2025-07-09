import React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "./button"

interface ErrorStateProps {
  error: string
  onRetry?: () => void
  title?: string
  className?: string
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, title = "Error", className = "" }) => (
  <div className={`flex flex-col items-center justify-center h-full py-12 ${className}`}>
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="w-8 h-8 text-red-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6">{error}</p>
    {onRetry && (
      <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try Again
      </Button>
    )}
  </div>
)

export default ErrorState 