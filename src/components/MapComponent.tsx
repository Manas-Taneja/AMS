import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { LuMapPin } from 'react-icons/lu';
import { renderToStaticMarkup } from 'react-dom/server';
import { useRouter } from 'next/navigation';

// Create a custom icon using React Icon
const iconMarkup = renderToStaticMarkup(
  <div style={{ 
    color: '#2563eb', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))'
  }}>
    <svg 
      width="32" 
      height="32" 
      viewBox="0 0 24 24" 
      fill="#2563eb" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" fill="white" />
    </svg>
  </div>
);

const customIcon = new L.DivIcon({
  html: iconMarkup,
  className: 'custom-marker-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
});

interface City {
  id: number;
  name: string;
  city: string;
  assets: number;
  owner: string;
  lat: number;
  lng: number;
}

interface MapComponentProps {
  locations: City[];
}

const MapComponent: React.FC<MapComponentProps> = ({ locations }) => {
  const router = useRouter();

  return (
    <MapContainer 
      center={[23.5937, 78.9629]} // Center of India
      zoom={5} 
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem', zIndex: 0 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      {locations.map((city) => (
        <Marker 
          key={city.id} 
          position={[city.lat, city.lng]} 
          icon={customIcon}
        >
          <Popup className="custom-popup">
            <div className="min-w-[200px] p-1">
              <div className="flex items-center gap-2 mb-3 border-b pb-2">
                <LuMapPin className="text-blue-600 w-5 h-5" />
                <h3 className="font-bold text-base m-0">{city.name}</h3>
              </div>
              <div className="space-y-1.5 mb-3">
                <p className="text-sm text-gray-600 m-0 flex justify-between">
                  <span>City:</span>
                  <span className="font-semibold text-gray-900">{city.city}</span>
                </p>
                <p className="text-sm text-gray-600 m-0 flex justify-between">
                  <span>Assets:</span>
                  <span className="text-green-600 font-bold">{city.assets}</span>
                </p>
                <p className="text-sm text-gray-600 m-0 flex justify-between">
                  <span>Owner:</span>
                  <span className="text-blue-600 font-semibold">{city.owner}</span>
                </p>
              </div>
              <button 
                onClick={() => router.push(`/location/${city.id}`)}
                className="w-full bg-blue-600 text-white py-1.5 rounded-md hover:bg-blue-700 transition-colors text-xs font-medium uppercase tracking-wide"
              >
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
