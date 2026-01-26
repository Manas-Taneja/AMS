import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LuTrendingUp, LuTrendingDown, LuMinus } from "react-icons/lu";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bgClass: string;
  trend?: {
    value: number;
    isPositive?: boolean;
    label?: string;
  };
  sparklineData?: number[];
  progressValue?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  icon, 
  label, 
  value, 
  bgClass, 
  trend,
  sparklineData,
  progressValue 
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value === 0) return <LuMinus className="w-3 h-3" />;
    if (trend.isPositive !== false && trend.value > 0) return <LuTrendingUp className="w-3 h-3" />;
    return <LuTrendingDown className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (!trend || trend.value === 0) return "text-muted-foreground";
    if (trend.isPositive !== false && trend.value > 0) return "text-green-600 dark:text-green-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-primary">
      <CardContent className="py-4 px-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-3 rounded-xl ${bgClass}`}>
              {icon}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
              <p className="text-3xl font-bold text-foreground">
                {value}
              </p>
                
                {trend && (
                  <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span>{Math.abs(trend.value)}%</span>
                    {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
                  </div>
                )}
              </div>
            </div>
            
            {sparklineData && sparklineData.length > 0 && (
              <div className="ml-2">
                <svg width="60" height="30" className="opacity-70">
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparklineData
                      .map((val, idx) => {
                        const x = (idx / (sparklineData.length - 1)) * 60;
                        const max = Math.max(...sparklineData);
                        const min = Math.min(...sparklineData);
                        const y = 30 - ((val - min) / (max - min)) * 30;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />
                </svg>
              </div>
            )}
          </div>
          
          {progressValue !== undefined && (
            <div className="mt-3">
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressValue}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
  );
};

export default StatsCard;