import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import IndiaMap from '../assets/IndiaMap.svg';
import { motion } from 'framer-motion';
import { LuMapPin } from 'react-icons/lu';
import { useRouter } from "next/navigation";

const InteractiveMap: React.FC = () => {
  const router = useRouter();
  const onViewDetails = (id: number) => router.push(`/location/${id}`);

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
    x: 400,
    y: 350,
    labelX: 40,
    labelY: 130,
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
    address: "456 Oak Ave, Mumbai",
    x: 415,
    y: 575,
    labelX: 700,
    labelY: 630,
  },
  {
    id: 3,
    name: "Manufacturing",
    city: "Dodi",
    assets: 189,
    owner: "IIDT",
    manager: "Mike Wilson",
    project: "Aerial Survey",
    team: 6,
    address: "789 Pine Rd, Chennai",
    x: 375,
    y: 575,
    labelX: 40,
    labelY: 790,
  },
  {
    id: 4,
    name: "Office",
    city: "Jaipur",
    assets: 257,
    owner: "PSSL",
    manager: "Lisa Chen",
    project: "Inventory Optimization",
    team: 10,
    address: "321 Storage Ln, Kolkata",
    x: 347,
    y: 430,
    labelX: 600,
    labelY: 130,
  }
];

const svgWidth = 1200;
const svgHeight = 1200;

return (
  <Card>
    <CardHeader>
      <CardTitle>Asset Locations</CardTitle>
      <CardDescription>Major locations and their assets</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="w-full flex justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width={800}
          height={734.75}
          className="bg-transparent rounded-lg"
        >
          {/* India outline as imported SVG image */}
          <image href={"/assets/IndiaMap.svg"} x="0" y="0" width={svgWidth} height={svgHeight} />

          {/* City dots and label lines */}
          {cityData.map((city, i) => (
            <motion.g
              key={city.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
            >
              {/* Line from city to label */}
              <line
                x1={city.x}
                y1={city.y}
                x2={city.labelX + (city.labelX > city.x ? -20 : city.labelX < city.x ? 20 : 0)}
                y2={city.labelY + (city.labelY > city.y ? -20 : city.labelY < city.y ? 20 : 0)}
                stroke="#2563eb"
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
              />
              {/* City dot */}
              <circle
                cx={city.x}
                cy={city.y}
                r={8}
                fill="#2563eb"
                stroke="#fff"
                strokeWidth={3}
              />
                             {/* Interactive button wrapper */}
               <foreignObject
                 x={city.labelX - 20}
                 y={city.labelY - 40}
                 width={270}
                 height={130}
                 requiredExtensions="http://www.w3.org/1999/xhtml"
               >
                 <button
                     onClick={() => onViewDetails(city.id)}
                     style={{
                     width: '100%',
                     height: '100%',
                     border: '1px solid #000',
                     borderRadius: '16px',
                     backgroundColor: '#fff',
                     cursor: 'pointer',
                     padding: '10px',
                     fontSize: 17,
                     fontWeight: 'bold',
                     color: '#222',
                     wordBreak: 'break-word',
                     textAlign: 'left',
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'center',
                     boxShadow: '0 1px 1px rgba(0, 0, 0, 0.08)',
                     transition: 'all 0.2s ease',
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.backgroundColor = '#f8f9fa';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.backgroundColor = '#fff';
                   }}
                 >
                   <div style={{ fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                     <LuMapPin size={24} style={{ marginRight: 6, color: '#2563eb' }} />
                     {city.name}
                   </div>
                   <div style={{ fontSize: 18, fontWeight: 400, color: '#444', marginBottom: 2 }}>
                     Assets: <strong className="text-green-500">{city.assets}</strong>
                   </div>
                   <div style={{ fontSize: 16, fontWeight: 400, color: '#666', marginBottom: 2 }}>
                     Owner: <strong className="text-blue-500">{city.owner}</strong>
                   </div>
                 </button>
               </foreignObject>
            </motion.g>
          ))}
          {/* Arrowhead marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,10 L10,5 z" fill="#2563eb" />
            </marker>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.08" />
            </filter>
          </defs>
        </svg>
      </div>
    </CardContent>
  </Card>
);
};

export default InteractiveMap; 