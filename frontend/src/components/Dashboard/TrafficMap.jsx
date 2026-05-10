import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getIncidentColor = (type) => {
  const colors = {
    ACCIDENT: '#ef4444',
    ROADWORK: '#f59e0b',
    ROAD_CLOSED: '#dc2626',
    TRAFFIC_JAM: '#eab308',
  };
  return colors[type] || '#6b7280';
};

const getDensityColor = (density) => {
  const colors = {
    LOW: '#22c55e',
    MEDIUM: '#eab308',
    HIGH: '#ef4444',
  };
  return colors[density] || '#6b7280';
};

const TrafficMap = ({ incidents = [], zones = [] }) => {
  const [center] = useState([36.8065, 10.1815]); // Tunis center

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Carte du Trafic</h3>
      <div className="h-96 rounded-lg overflow-hidden">
        <MapContainer
          center={center}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url={process.env.REACT_APP_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          
          {/* Traffic Zones */}
          {zones.map((zone) => (
            <Circle
              key={zone.id}
              center={[zone.centerLatitude, zone.centerLongitude]}
              radius={500}
              pathOptions={{
                color: getDensityColor(zone.currentDensity),
                fillColor: getDensityColor(zone.currentDensity),
                fillOpacity: 0.3,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{zone.name}</strong>
                  <br />
                  Densité: {zone.currentDensity}
                </div>
              </Popup>
            </Circle>
          ))}
          
          {/* Incidents */}
          {incidents.map((incident) => (
            <Marker
              key={incident.id}
              position={[incident.latitude, incident.longitude]}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{incident.title}</strong>
                  <br />
                  Type: {incident.type}
                  <br />
                  Status: {incident.status}
                  <br />
                  {incident.address}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default TrafficMap;