import React, { useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Icône centre de zone ──────────────────────────────────────
const centerIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width:16px; height:16px; border-radius:50%;
      background:#3b82f6; border:3px solid white;
      box-shadow:0 2px 8px rgba(59,130,246,0.6);
      transform:translate(-50%,-50%);
    "></div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// ── Handler de clic sur la carte ──────────────────────────────
const ClickHandler = ({ onPick, enabled }) => {
  useMapEvents({
    click(e) {
      if (enabled) onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const ZoneForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    radiusMeters: 500,
  });
  const [center, setCenter] = useState(null); // { lat, lng }
  const [step, setStep] = useState(1); // 1=infos, 2=carte

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!center) return;
    onSubmit({
      name: formData.name,
      description: formData.description || undefined,
      centerLatitude: center.lat,
      centerLongitude: center.lng,
      radiusMeters: parseFloat(formData.radiusMeters),
    });
  };

  // ── Couleur selon rayon ───────────────────────────────────
  const getRadiusColor = (r) => {
    if (r <= 300) return '#22c55e';
    if (r <= 800) return '#eab308';
    return '#ef4444';
  };
  const color = getRadiusColor(formData.radiusMeters);

  return (
    <div className="space-y-4">

      {/* ── Étape 1 : Informations ────────────────────────── */}
      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la zone *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
                placeholder="Ex: Centre Ville, Autoroute A1..."
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnel)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="2"
                placeholder="Description de la zone"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rayon de surveillance :&nbsp;
                <span style={{ color, fontWeight: 700 }}>{formData.radiusMeters} m</span>
              </label>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={formData.radiusMeters}
                onChange={(e) => setFormData({ ...formData, radiusMeters: parseInt(e.target.value) })}
                className="w-full"
                style={{ accentColor: color }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>100 m (quartier)</span>
                <span>1 km (zone)</span>
                <span>5 km (secteur)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              Suivant → Placer sur la carte
            </button>
          </div>
        </form>
      )}

      {/* ── Étape 2 : Dessin sur la carte ────────────────── */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Récapitulatif */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ background: color }}
            />
            <div className="flex-1 text-sm">
              <span className="font-semibold text-blue-900">{formData.name}</span>
              <span className="text-blue-600 ml-2">— rayon {formData.radiusMeters} m</span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-blue-500 hover:underline"
            >
              ✏️ Modifier
            </button>
          </div>

          {/* Instruction */}
          <div className="text-sm text-gray-600 flex items-center gap-2">
            {center ? (
              <span className="text-green-700 font-medium">
                ✅ Zone placée — déplacez le clic pour la repositionner
              </span>
            ) : (
              <span>👆 Cliquez sur la carte pour placer le centre de la zone</span>
            )}
          </div>

          {/* Carte */}
          <div
            style={{
              height: '420px',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              border: center ? `2px solid ${color}` : '2px dashed #d1d5db',
              cursor: 'crosshair',
              transition: 'border-color 0.2s',
            }}
          >
            <MapContainer
              center={[36.8065, 10.1815]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <ClickHandler onPick={setCenter} enabled={true} />

              {center && (
                <>
                  {/* Cercle de la zone */}
                  <Circle
                    center={[center.lat, center.lng]}
                    radius={formData.radiusMeters}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.15,
                      weight: 2,
                    }}
                  />
                  {/* Point central */}
                  <Marker
                    position={[center.lat, center.lng]}
                    icon={centerIcon}
                  />
                </>
              )}
            </MapContainer>
          </div>

          {/* Coordonnées affichées */}
          {center && (
            <div className="flex items-center justify-between p-3 rounded-lg text-sm"
              style={{ background: '#eff6ff', border: `1px solid ${color}40` }}
            >
              <span style={{ color: '#1d4ed8', fontWeight: 600 }}>
                📍 {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
              </span>
              <button
                type="button"
                onClick={() => setCenter(null)}
                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
              >
                ✕ Effacer
              </button>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary">
              ← Retour
            </button>
            <button
              type="submit"
              disabled={!center}
              className={`btn-primary ${!center ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {center ? '✅ Créer la zone' : '👆 Cliquez d\'abord sur la carte'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ZoneForm;