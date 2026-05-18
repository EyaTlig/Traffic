import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Marqueur rouge avec animation ping
const createPinIcon = () => L.divIcon({
  className: '',
  html: `
    <style>
      @keyframes map-ping {
        0%   { transform: translate(-50%,-50%) scale(0.5); opacity:1; }
        100% { transform: translate(-50%,-50%) scale(2.5); opacity:0; }
      }
      .map-ping-ring {
        position:absolute; top:50%; left:50%;
        width:38px; height:38px; border-radius:50%;
        background:rgba(239,68,68,0.3);
        animation: map-ping 1.4s ease-out infinite;
      }
    </style>
    <div style="position:relative;width:36px;height:48px;">
      <div class="map-ping-ring"></div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="36" height="48"
           style="position:absolute;top:0;left:0;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4))">
        <path d="M12 0C7.589 0 4 3.589 4 8c0 5.5 8 24 8 24s8-18.5 8-24c0-4.411-3.589-8-8-8z" fill="#ef4444"/>
        <circle cx="12" cy="8" r="4" fill="white"/>
        <circle cx="12" cy="8" r="2.5" fill="#ef4444"/>
      </svg>
    </div>
  `,
  iconSize: [36, 48],
  iconAnchor: [18, 48],
  popupAnchor: [0, -50],
});

// Capture clics carte
const ClickHandler = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

/**
 * MapPicker — cliquez sur la carte pour choisir une position
 * Props:
 *   value    : { lat, lng } | null
 *   onChange : (pos | null) => void
 *   center   : [lat, lng]
 *   zoom     : number
 *   height   : string  (CSS)
 */
const MapPicker = ({
  value,
  onChange,
  center = [36.8065, 10.1815],
  zoom = 9,
  height = '320px',
}) => {
  const pinIcon = createPinIcon();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div
        style={{
          height,
          borderRadius: '0.75rem',
          overflow: 'hidden',
          border: value ? '2px solid #3b82f6' : '2px dashed #d1d5db',
          cursor: 'crosshair',
          transition: 'border-color 0.2s',
          position: 'relative',
        }}
      >
        {/* Instruction overlay quand pas de valeur */}
        {!value && (
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            zIndex: 1000, background: 'rgba(255,255,255,0.92)', borderRadius: '999px',
            padding: '6px 14px', fontSize: '12px', color: '#374151',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)', whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}>
            👆 Cliquez pour placer le marqueur
          </div>
        )}

        <MapContainer
          center={value ? [value.lat, value.lng] : center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ClickHandler onPick={onChange} />

          {/* ✅ Marqueur rouge animé — apparaît immédiatement au clic */}
          {value && (
            <Marker position={[value.lat, value.lng]} icon={pinIcon}>
              <Popup>
                <div style={{ textAlign: 'center', fontSize: '13px' }}>
                  <strong>📍 Position sélectionnée</strong><br />
                  Lat: {value.lat.toFixed(6)}<br />
                  Lng: {value.lng.toFixed(6)}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Bandeau coordonnées sous la carte */}
      {value ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: '0.5rem', fontSize: '13px',
        }}>
          <span style={{ color: '#1d4ed8', fontWeight: 600 }}>
            📍 {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{
              marginLeft: '12px', color: '#ef4444', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            }}
          >
            ✕ Effacer
          </button>
        </div>
      ) : (
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>
          Aucune position sélectionnée
        </p>
      )}
    </div>
  );
};

export default MapPicker;