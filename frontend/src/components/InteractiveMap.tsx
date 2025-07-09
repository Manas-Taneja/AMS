import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import IndiaMap from '../assets/IndiaMap.svg';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

// SVG coordinates for cities (approximate, relative to the SVG viewBox 880x880)
const cityData = [
  {
    name: "Headquarters",
    city: "Delhi",
    assets: 567,
    value: 1200000,
    x: 400,
    y: 350,
    labelX: 540,
    labelY: 120,
  },
  {
    name: "Branch A",
    city: "Mumbai",
    assets: 234,
    value: 450000,
    x: 370,
    y: 520,
    labelX: 40,
    labelY: 340,
  },
  {
    name: "Branch B",
    city: "Chennai",
    assets: 189,
    value: 380000,
    x: 650,
    y: 700,
    labelX: 700,
    labelY: 760,
  },
  {
    name: "Warehouse",
    city: "Kolkata",
    assets: 257,
    value: 817500,
    x: 800,
    y: 560,
    labelX: 870,
    labelY: 480,
  },
];

const svgWidth = 1200;
const svgHeight = 1200;

const InteractiveMap: React.FC = () => (
  <Card>
    <CardHeader>
      <CardTitle>India Asset Map</CardTitle>
      <CardDescription>Major locations and their assets</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="w-full flex justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width={600}
          height={600}
          className="bg-transparent rounded-lg border"
        >
          {/* India outline as imported SVG image */}
          <image href={IndiaMap} x="0" y="0" width={svgWidth} height={svgHeight} />

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
                r={12}
                fill="#2563eb"
                stroke="#fff"
                strokeWidth={3}
              />
              {/* Label box */}
              <rect
                x={city.labelX - 20}
                y={city.labelY - 40}
                width={270}
                height={110}
                rx={16}
                fill="#fff"
                stroke="#000"
                strokeWidth={1}
                filter="url(#shadow)"

              />
              {/* Label text using foreignObject for wrapping */}
              <foreignObject
                x={city.labelX - 10}
                y={city.labelY - 30}
                width={230}
                height={90}
                requiredExtensions="http://www.w3.org/1999/xhtml"
              >
                <div
                  style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '2px 2px',
                    fontSize: 17,
                    fontWeight: 'bold',
                    color: '#222',
                    wordBreak: 'break-word',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MapPin size={24} style={{ marginRight: 6, color: '#2563eb' }} />
                    {city.name}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 400, color: '#444', marginBottom: 2 }}>Assets: <strong className="text-green-500">{city.assets}</strong></div>
                </div>
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

export default InteractiveMap; 