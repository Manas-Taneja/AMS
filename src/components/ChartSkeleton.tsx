import React from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

interface ChartSkeletonProps {
  type?: 'pie' | 'bar' | 'line' | 'radar' | 'mixed';
  showTabs?: boolean;
  height?: number;
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ 
  type = 'bar',
  showTabs = false,
  height = 400 
}) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {showTabs && (
          <div className="mb-4">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        )}
        
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-center gap-2" style={{ height: `${height}px` }}>
              {type === 'bar' && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <Skeleton 
                        className="w-full animate-pulse" 
                        style={{ 
                          height: `${Math.random() * 60 + 40}%`,
                          animationDelay: `${i * 0.1}s`
                        }} 
                      />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </>
              )}
              
              {type === 'pie' && (
                <div className="flex items-center gap-8">
                  <div className="flex flex-col gap-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-sm" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ))}
                  </div>
                  <Skeleton className="h-64 w-64 rounded-full" />
                </div>
              )}
              
              {type === 'line' && (
                <div className="w-full h-full flex flex-col justify-end">
                  <svg width="100%" height="100%" className="overflow-visible">
                    <defs>
                      <linearGradient id="shimmer" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
                        <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
                        <animateTransform
                          attributeName="gradientTransform"
                          type="translate"
                          from="-1 0"
                          to="1 0"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0,80 Q 25,60 50,70 T 100,50 T 150,60 T 200,40 T 250,50 T 300,30"
                      fill="none"
                      stroke="url(#shimmer)"
                      strokeWidth="3"
                      className="text-muted-foreground"
                    />
                  </svg>
                </div>
              )}
              
              {type === 'radar' && (
                <Skeleton className="h-80 w-80 rounded-full" />
              )}
              
              {type === 'mixed' && (
                <div className="w-full h-full flex items-end gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <Skeleton 
                        className="w-full" 
                        style={{ height: `${Math.random() * 60 + 40}%` }} 
                      />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default ChartSkeleton;
