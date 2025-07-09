import React from "react"

interface LoadingStateProps {
  message?: string
  className?: string
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading...", className = "" }) => (
  <div className={`flex flex-col items-center justify-center h-full py-12 ${className}`}>
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
      <div
        className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin mx-auto"
        style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
      ></div>
    </div>
    {message && <p className="mt-4 text-gray-600 font-medium">{message}</p>}
  </div>
)

export default LoadingState 