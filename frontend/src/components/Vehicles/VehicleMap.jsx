import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const VehicleMap = ({ position }) => {
  const center = position 
    ? [position.latitude, position.longitude] 
    : [36.8065, 10.1815];

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden">
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {position && (
          <Marker position={[position.latitude, position.longitude]} icon={customIcon}>
            <Popup>
              <div className="text-sm">
                <strong>Position actuelle</strong><br />
                Vitesse: {position.speed} km/h<br />
                {new Date(position.recordedAt).toLocaleString()}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default VehicleMap;