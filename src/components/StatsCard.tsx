import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bgClass: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, bgClass }) => (
  <Card>
    <CardContent className="py-2">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgClass}`}>{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default StatsCard;