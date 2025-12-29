
import { LuBuilding, LuMapPin, LuUsers } from "react-icons/lu";
import { locationStatusConfig } from "./statusColors";

export const getStatusColor = (status: string) => {
  return locationStatusConfig[status as keyof typeof locationStatusConfig]?.color || locationStatusConfig.inactive.color;
};

export const getTypeIcon = (type: string) => {
  switch (type) {
    case "headquarters":
      return <LuBuilding className="h-4 w-4 text-blue-600" />;
    case "branch":
      return <LuMapPin className="h-4 w-4 text-green-600" />;
    case "training":
      return <LuUsers className="h-4 w-4 text-purple-600" />;
    default:
      return <LuMapPin className="h-4 w-4 text-gray-600" />;
  }
};