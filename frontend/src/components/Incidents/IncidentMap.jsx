import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { INCIDENT_TYPES, TRAFFIC_DENSITY } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

// Custom icons for different incident types
const createIcon = (type, color) => {
  const iconHtml = `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    ">
      ${INCIDENT_TYPES[type]?.icon || '⚠️'}
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    popupAnchor: [0, -15]
  });
};

// Component to fit bounds
const FitBounds = ({ positions }) => {
  const map = useMap();
  
  useEffect(() => {
    if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, positions]);
  
  return null;
};

const IncidentMap = ({ 
  incidents = [], 
  zones = [], 
  center = [36.8065, 10.1815], 
  zoom = 12,
  showClusters = false,
  onMarkerClick = null,
  height = '500px'
}) => {
  const [mapRef, setMapRef] = useState(null);
  
  // Prepare positions for bounds fitting
  const allPositions = [
    ...incidents.map(i => [i.latitude, i.longitude]),
    ...zones.map(z => [z.centerLatitude, z.centerLongitude])
  ].filter(pos => pos[0] && pos[1]);

  const getIncidentColor = (type) => {
    const colors = {
      ACCIDENT: '#ef4444',
      ROADWORK: '#f59e0b',
      ROAD_CLOSED: '#dc2626',
      TRAFFIC_JAM: '#eab308'
    };
    return colors[type] || '#6b7280';
  };

  const getDensityColor = (density) => {
    const colors = {
      LOW: '#22c55e',
      MEDIUM: '#eab308',
      HIGH: '#ef4444'
    };
    return colors[density] || '#6b7280';
  };

  const getDensityRadius = (density) => {
    const radii = {
      LOW: 300,
      MEDIUM: 500,
      HIGH: 800
    };
    return radii[density] || 500;
  };

  return (
    <div className="relative" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {/* Traffic Zones */}
        {zones.map((zone) => (
          <Circle
            key={`zone-${zone.id}`}
            center={[zone.centerLatitude, zone.centerLongitude]}
            radius={getDensityRadius(zone.currentDensity)}
            pathOptions={{
              color: getDensityColor(zone.currentDensity),
              fillColor: getDensityColor(zone.currentDensity),
              fillOpacity: 0.2,
              weight: 2
            }}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <strong className="text-lg">{zone.name}</strong>
                <div className="mt-2 space-y-1">
                  <p>
                    <span className="font-medium">Densité:</span>{' '}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                      TRAFFIC_DENSITY[zone.currentDensity]?.bg
                    } ${TRAFFIC_DENSITY[zone.currentDensity]?.text}`}>
                      {TRAFFIC_DENSITY[zone.currentDensity]?.label}
                    </span>
                  </p>
                  {zone.description && <p className="text-gray-600">{zone.description}</p>}
                  <p className="text-xs text-gray-500">
                    Rayon: {zone.radiusMeters}m
                  </p>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}
        
        {/* Incidents */}
        {incidents.map((incident) => {
          const icon = createIcon(incident.type, getIncidentColor(incident.type));
          return (
            <Marker
              key={`incident-${incident.id}`}
              position={[incident.latitude, incident.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onMarkerClick?.(incident)
              }}
            >
              <Popup>
                <div className="text-sm min-w-[250px]">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{INCIDENT_TYPES[incident.type]?.icon}</span>
                    <strong className="text-lg">{incident.title}</strong>
                  </div>
                  <div className="space-y-1">
                    {incident.description && (
                      <p className="text-gray-600">{incident.description}</p>
                    )}
                    <p>
                      <span className="font-medium">Type:</span>{' '}
                      {INCIDENT_TYPES[incident.type]?.label}
                    </p>
                    <p>
                      <span className="font-medium">Statut:</span>{' '}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                        incident.status === 'REPORTED' ? 'bg-yellow-100 text-yellow-800' :
                        incident.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {incident.status === 'REPORTED' ? 'Signalé' :
                         incident.status === 'IN_PROGRESS' ? 'En cours' : 'Résolu'}
                      </span>
                    </p>
                    {incident.address && (
                      <p className="text-gray-600">{incident.address}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Signalé le {formatDate(incident.createdAt)}
                    </p>
                    {incident.resolvedAt && (
                      <p className="text-xs text-gray-500">
                        Résolu le {formatDate(incident.resolvedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Auto-fit bounds */}
        {allPositions.length > 0 && <FitBounds positions={allPositions} />}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs z-[1000]">
        <div className="space-y-2">
          <div className="font-semibold mb-1">Légende</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Accident</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Travaux</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>Route fermée</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Bouchon</span>
            </div>
          </div>
          <div className="border-t pt-2 mt-1">
            <div className="font-semibold mb-1">Densité trafic</div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-6 h-2 bg-green-500 rounded"></div>
                <span>Fluide</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-6 h-2 bg-yellow-500 rounded"></div>
                <span>Dense</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-6 h-2 bg-red-500 rounded"></div>
                <span>Congestionné</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentMap;