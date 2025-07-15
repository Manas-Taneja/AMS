
import { Building, MapPin, Users } from "lucide-react";
import { locationStatusConfig } from "./statusColors";

export const getStatusColor = (status: string) => {
  return locationStatusConfig[status as keyof typeof locationStatusConfig]?.color || locationStatusConfig.inactive.color;
};

export const getTypeIcon = (type: string) => {
  switch (type) {
    case "headquarters":
      return <Building className="h-4 w-4 text-blue-600" />;
    case "branch":
      return <MapPin className="h-4 w-4 text-green-600" />;
    case "training":
      return <Users className="h-4 w-4 text-purple-600" />;
    default:
      return <MapPin className="h-4 w-4 text-gray-600" />;
  }
};