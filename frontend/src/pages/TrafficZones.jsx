import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { PlusIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ZoneForm from '../components/Traffic/ZoneForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

// ── Queries / Mutations ───────────────────────────────────────
const TRAFFIC_ZONES_QUERY = gql`
  query TrafficZones {
    trafficZones {
      id
      name
      description
      centerLatitude
      centerLongitude
      radiusMeters
      currentDensity
      isActive
      createdAt
    }
  }
`;

const CREATE_ZONE = gql`
  mutation CreateTrafficZone(
    $name: String!
    $description: String
    $centerLatitude: Float!
    $centerLongitude: Float!
    $radiusMeters: Float!
  ) {
    createTrafficZone(
      name: $name
      description: $description
      centerLatitude: $centerLatitude
      centerLongitude: $centerLongitude
      radiusMeters: $radiusMeters
    ) {
      id
      name
      currentDensity
    }
  }
`;

const MEASURE_TRAFFIC = gql`
  mutation MeasureTraffic(
    $zoneId: ID!
    $vehicleCount: Int!
    $averageSpeed: Float
    $notes: String
  ) {
    measureTraffic(
      zoneId: $zoneId
      vehicleCount: $vehicleCount
      averageSpeed: $averageSpeed
      notes: $notes
    ) {
      id
      density
      vehicleCount
      averageSpeed
      measuredAt
    }
  }
`;

// ── Constantes densité ────────────────────────────────────────
const DENSITY = {
  LOW:    { label: 'Fluide',        color: '#22c55e', bg: 'bg-green-100',  text: 'text-green-800',  emoji: '🟢' },
  MEDIUM: { label: 'Dense',         color: '#eab308', bg: 'bg-yellow-100', text: 'text-yellow-800', emoji: '🟡' },
  HIGH:   { label: 'Congestionné',  color: '#ef4444', bg: 'bg-red-100',    text: 'text-red-800',    emoji: '🔴' },
};

// ── Icône centre zone ─────────────────────────────────────────
const makeCenterIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    width:12px;height:12px;border-radius:50%;
    background:${color};border:2px solid white;
    box-shadow:0 1px 4px rgba(0,0,0,0.3);
    transform:translate(-50%,-50%);
  "></div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

// ── Composant mesure rapide ───────────────────────────────────
const MeasureModal = ({ zone, onClose, onDone }) => {
  const [vehicleCount, setVehicleCount] = useState('');
  const [averageSpeed, setAverageSpeed] = useState('');
  const [notes, setNotes] = useState('');
  const [measureTraffic, { loading }] = useMutation(MEASURE_TRAFFIC);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleCount) return;
    try {
      const result = await measureTraffic({
        variables: {
          zoneId: zone.id,
          vehicleCount: parseInt(vehicleCount),
          averageSpeed: averageSpeed ? parseFloat(averageSpeed) : null,
          notes: notes || null,
        },
      });
      const d = result.data.measureTraffic;
      toast.success(`Mesure enregistrée — densité : ${DENSITY[d.density]?.label}`);
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const predicted = vehicleCount === ''
    ? null
    : parseInt(vehicleCount) < 10 ? 'LOW'
    : parseInt(vehicleCount) < 30 ? 'MEDIUM'
    : 'HIGH';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            📊 Mesurer le trafic
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
          <span className="font-medium text-gray-700">Zone : </span>
          <span className="text-gray-900">{zone.name}</span>
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${DENSITY[zone.currentDensity]?.bg} ${DENSITY[zone.currentDensity]?.text}`}>
            {DENSITY[zone.currentDensity]?.emoji} {DENSITY[zone.currentDensity]?.label}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de véhicules *
            </label>
            <input
              type="number"
              min="0"
              value={vehicleCount}
              onChange={(e) => setVehicleCount(e.target.value)}
              className="input-field text-lg font-semibold"
              placeholder="Ex: 25"
              required
              autoFocus
            />
            {/* Prévisualisation densité */}
            {predicted && (
              <div className={`mt-2 flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${DENSITY[predicted].bg} ${DENSITY[predicted].text}`}>
                <span className="text-base">{DENSITY[predicted].emoji}</span>
                <span>Densité prévue : <strong>{DENSITY[predicted].label}</strong></span>
                {predicted !== zone.currentDensity && (
                  <span className="ml-auto text-xs opacity-70">← changement !</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vitesse moyenne (km/h)
              </label>
              <input
                type="number"
                min="0"
                value={averageSpeed}
                onChange={(e) => setAverageSpeed(e.target.value)}
                className="input-field"
                placeholder="Ex: 40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field"
                placeholder="Observation..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" disabled={loading || !vehicleCount} className="btn-primary">
              {loading ? 'Enregistrement...' : '✅ Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────
const TrafficZones = () => {
  const [showForm, setShowForm] = useState(false);
  const [measureZone, setMeasureZone] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  const { loading, error, data, refetch } = useQuery(TRAFFIC_ZONES_QUERY);
  const [createZone] = useMutation(CREATE_ZONE);

  const handleCreate = async (zoneData) => {
    try {
      await createZone({ variables: zoneData });
      toast.success('Zone créée avec succès 🗺️');
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Erreur : {error.message}</div>;

  const zones = data?.trafficZones || [];
  const stats = {
    LOW:    zones.filter(z => z.currentDensity === 'LOW').length,
    MEDIUM: zones.filter(z => z.currentDensity === 'MEDIUM').length,
    HIGH:   zones.filter(z => z.currentDensity === 'HIGH').length,
  };

  return (
    <div className="space-y-6">

      {/* ── En-tête ─────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zones de Trafic</h1>
          <p className="text-gray-600 mt-1">
            {zones.length} zone{zones.length > 1 ? 's' : ''} surveillée{zones.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nouvelle zone
        </button>
      </div>

      {/* ── Statistiques rapides ─────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(DENSITY).map(([key, d]) => (
          <div key={key} className={`card flex items-center gap-3 ${d.bg}`}>
            <span className="text-2xl">{d.emoji}</span>
            <div>
              <p className={`text-2xl font-bold ${d.text}`}>{stats[key]}</p>
              <p className={`text-sm ${d.text}`}>{d.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Formulaire de création ───────────────────────── */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">🗺️ Nouvelle zone de surveillance</h2>
          <ZoneForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* ── Carte principale ─────────────────────────────── */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">🗺️ Carte des zones</h2>
          <p className="text-sm text-gray-500">Cliquez sur une zone pour la mesurer</p>
        </div>
        <div style={{ height: '480px' }}>
          <MapContainer
            center={[36.8065, 10.1815]}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            {zones.map((zone) => {
              const d = DENSITY[zone.currentDensity];
              return (
                <React.Fragment key={zone.id}>
                  <Circle
                    center={[zone.centerLatitude, zone.centerLongitude]}
                    radius={zone.radiusMeters}
                    pathOptions={{
                      color: d.color,
                      fillColor: d.color,
                      fillOpacity: selectedZone?.id === zone.id ? 0.35 : 0.15,
                      weight: selectedZone?.id === zone.id ? 3 : 2,
                    }}
                    eventHandlers={{
                      click: () => setSelectedZone(zone),
                    }}
                  >
                    <Popup>
                      <div className="text-sm min-w-[200px]">
                        <p className="font-bold text-base mb-1">{zone.name}</p>
                        {zone.description && (
                          <p className="text-gray-500 mb-2">{zone.description}</p>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${d.bg} ${d.text}`}>
                            {d.emoji} {d.label}
                          </span>
                          <span className="text-xs text-gray-400">{zone.radiusMeters} m</span>
                        </div>
                        <button
                          onClick={() => setMeasureZone(zone)}
                          className="w-full text-center text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                        >
                          📊 Mesurer le trafic
                        </button>
                      </div>
                    </Popup>
                  </Circle>
                  <Marker
                    position={[zone.centerLatitude, zone.centerLongitude]}
                    icon={makeCenterIcon(d.color)}
                  />
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* ── Liste des zones ──────────────────────────────── */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Liste des zones</h2>
        {zones.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Aucune zone — créez-en une avec le bouton ci-dessus
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {zones.map((zone) => {
              const d = DENSITY[zone.currentDensity];
              return (
                <div
                  key={zone.id}
                  className="flex items-center justify-between py-3 hover:bg-gray-50 px-2 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ background: d.color }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{zone.name}</p>
                      {zone.description && (
                        <p className="text-xs text-gray-500">{zone.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{zone.radiusMeters} m</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${d.bg} ${d.text}`}>
                      {d.emoji} {d.label}
                    </span>
                    <button
                      onClick={() => setMeasureZone(zone)}
                      className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <ChartBarIcon className="h-4 w-4" />
                      Mesurer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal mesure ────────────────────────────────── */}
      {measureZone && (
        <MeasureModal
          zone={measureZone}
          onClose={() => setMeasureZone(null)}
          onDone={() => refetch()}
        />
      )}
    </div>
  );
};

export default TrafficZones;