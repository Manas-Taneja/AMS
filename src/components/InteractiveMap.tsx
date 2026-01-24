import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import dynamic from 'next/dynamic';

// Dynamically import the MapComponent with no SSR
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-muted flex items-center justify-center rounded-lg">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <p className="text-muted-foreground text-sm">Loading map...</p>
      </div>
    </div>
  )
});

const InteractiveMap: React.FC = () => {
  // Complete unified location data from ALL files across the codebase
  const cityData = [
    {
      id: 1,
      name: "Headquarters",
      city: "Delhi",
      assets: 567,
      owner: "PSSL",
      manager: "John Smith",
      project: "Urban Surveillance",
      team: 12,
      address: "123 Main St, Delhi",
      lat: 28.6139,
      lng: 77.2090
    },
    {
      id: 2,
      name: "Training Center",
      city: "Bhopal",
      assets: 234,
      owner: "Prakhar Aviation",
      manager: "Sarah Johnson",
      project: "Autonomous Delivery",
      team: 8,
      address: "456 Oak Ave, Bhopal",
      lat: 23.2599,
      lng: 77.4126
    },
    {
      id: 3,
      name: "Manufacturing",
      city: "Chennai",
      assets: 189,
      owner: "IIDT",
      manager: "Mike Wilson",
      project: "Aerial Survey",
      team: 6,
      address: "789 Pine Rd, Chennai",
      lat: 13.0827,
      lng: 80.2707
    },
    {
      id: 4,
      name: "Office",
      city: "Kolkata",
      assets: 257,
      owner: "PSSL",
      manager: "Lisa Chen",
      project: "Inventory Optimization",
      team: 10,
      address: "321 Storage Ln, Kolkata",
      lat: 22.5726,
      lng: 88.3639
    }
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Asset Locations</CardTitle>
        <CardDescription>Major locations and their assets</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[600px] p-0 overflow-hidden rounded-b-lg relative">
        <div className="absolute inset-0">
          <MapComponent locations={cityData} />
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap; 