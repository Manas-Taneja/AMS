import React from "react";
import { Card, CardContent } from "./ui/card";
import { ManagerOrAdmin } from "./RoleBasedComponent";

interface StatsCard {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  bgClass?: string;
}

interface StatsCardsProps {
  cards: StatsCard[];
  className?: string;
  gridCols?: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ 
  cards, 
  className = "grid grid-cols-1 md:grid-cols-3 gap-4",
  gridCols 
}) => {
  const gridClassName = gridCols || className;

  return (
    <ManagerOrAdmin>
      <div className={gridClassName}>
        {cards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`${card.bgClass || 'bg-muted'} p-2 rounded-lg dark:bg-secondary`}>
                  {card.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <p className={`text-2xl font-bold ${card.color || 'text-foreground'}`}>
                    {card.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ManagerOrAdmin>
  );
}; 