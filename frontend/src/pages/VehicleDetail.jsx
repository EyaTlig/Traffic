import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { ArrowLeftIcon, MapPinIcon, ClockIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import VehicleMap from '../components/Vehicles/VehicleMap';
import PositionHistory from '../components/Vehicles/PositionHistory';
import MapPicker from '../components/Common/MapPicker';
import toast from 'react-hot-toast';

const VEHICLE_DETAIL_QUERY = gql`
  query Vehicle($id: ID!) {
    vehicle(id: $id) {
      id
      licensePlate
      brand
      model
      type
      status
      driverName
      createdAt
      positions {
        id
        latitude
        longitude
        speed
        address
        recordedAt
      }
    }
  }
`;

const UPDATE_VEHICLE = gql`
  mutation UpdateVehicle($id: ID!, $status: VehicleStatus, $driverName: String) {
    updateVehicle(id: $id, status: $status, driverName: $driverName) {
      id
      status
      driverName
      createdAt
    }
  }
`;

const RECORD_POSITION = gql`
  mutation RecordPosition($vehicleId: ID!, $latitude: Float!, $longitude: Float!, $speed: Float, $address: String) {
    recordPosition(vehicleId: $vehicleId, latitude: $latitude, longitude: $longitude, speed: $speed, address: $address) {
      id
      latitude
      longitude
      speed
      address
      recordedAt
    }
  }
`;

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ status: '', driverName: '' });
  const [showPositionForm, setShowPositionForm] = useState(false);
  
  // Position choisie via clic sur carte
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [speed, setSpeed] = useState('');
  const [address, setAddress] = useState('');

  const { loading, error, data, refetch } = useQuery(VEHICLE_DETAIL_QUERY, { 
    variables: { id },
    pollInterval: 10000 // Rafraîchir toutes les 10 secondes
  });
  
  const [updateVehicle] = useMutation(UPDATE_VEHICLE);
  const [recordPosition] = useMutation(RECORD_POSITION);

  useEffect(() => {
    if (data?.vehicle) {
      setEditForm({ 
        status: data.vehicle.status, 
        driverName: data.vehicle.driverName || '' 
      });
    }
  }, [data]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateVehicle({ variables: { id, ...editForm } });
      toast.success('Véhicule mis à jour avec succès');
      setIsEditing(false);
      refetch();
    } catch (err) { 
      toast.error(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleRecordPosition = async (e) => {
    e.preventDefault();
    
    // Vérifier qu'une position a été sélectionnée
    if (!selectedPosition) {
      toast.error('Veuillez cliquer sur la carte pour sélectionner la position');
      return;
    }

    try {
      const result = await recordPosition({
        variables: {
          vehicleId: id,
          latitude: selectedPosition.lat,
          longitude: selectedPosition.lng,
          speed: speed !== '' ? parseFloat(speed) : null,
          address: address.trim() || null,
        },
      });
      
      console.log('Position enregistrée:', result.data.recordPosition);
      toast.success('Position enregistrée avec succès !');
      
      // Réinitialiser le formulaire
      setShowPositionForm(false);
      setSelectedPosition(null);
      setSpeed('');
      setAddress('');
      
      // Rafraîchir les données
      refetch();
    } catch (err) { 
      console.error('Erreur:', err);
      toast.error(err.message || 'Erreur lors de l\'enregistrement de la position');
    }
  };

  const cancelPositionForm = () => {
    setShowPositionForm(false);
    setSelectedPosition(null);
    setSpeed('');
    setAddress('');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center p-8">Erreur: {error.message}</div>;

  const vehicle = data?.vehicle;
  if (!vehicle) return <div className="text-center py-12">Véhicule non trouvé</div>;

  const lastPosition = vehicle.positions?.[0];

  return (
    <div className="space-y-6">
      {/* Header avec retour */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/vehicles')} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Retour à la liste"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-gray-500">{vehicle.licensePlate}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          {isEditing ? 'Annuler' : 'Modifier'}
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Conducteur</p>
              <p className="font-semibold text-gray-900">{vehicle.driverName || 'Non assigné'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPinIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Vitesse actuelle</p>
              <p className="font-semibold text-gray-900">
                {lastPosition?.speed != null ? `${lastPosition.speed} km/h` : '—'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClockIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Dernière mise à jour</p>
              <p className="text-sm font-semibold text-gray-900">
                {lastPosition ? new Date(lastPosition.recordedAt).toLocaleString() : 'Jamais'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Statut</p>
              <span className={`inline-flex px-2 py-1 text-xs rounded-full font-semibold ${
                vehicle.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                vehicle.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {vehicle.status === 'ACTIVE' ? 'Actif' : vehicle.status === 'INACTIVE' ? 'Inactif' : 'Maintenance'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Formulaire de modification */}
      {isEditing && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Modifier le véhicule</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Actif</option>
                  <option value="INACTIVE">Inactif</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du conducteur
                </label>
                <input
                  type="text"
                  value={editForm.driverName}
                  onChange={(e) => setEditForm({ ...editForm, driverName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du conducteur"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Section Position */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">📍 Position du véhicule</h2>
          {!showPositionForm && (
            <button 
              onClick={() => setShowPositionForm(true)} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <MapPinIcon className="h-4 w-4" />
              Enregistrer une nouvelle position
            </button>
          )}
        </div>

        {/* Dernière position connue */}
        {lastPosition && !showPositionForm && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-800">Dernière position connue</p>
                <p className="text-blue-700">
                  {lastPosition.address 
                    ? lastPosition.address 
                    : `${lastPosition.latitude.toFixed(6)}, ${lastPosition.longitude.toFixed(6)}`}
                </p>
                {lastPosition.speed != null && (
                  <p className="text-sm text-blue-600">Vitesse: {lastPosition.speed} km/h</p>
                )}
                <p className="text-xs text-blue-400 mt-1">
                  {new Date(lastPosition.recordedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {!lastPosition && !showPositionForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg text-center text-gray-500">
            Aucune position enregistrée — cliquez sur "Enregistrer une nouvelle position" pour commencer.
          </div>
        )}

        {/* Formulaire d'enregistrement de position avec carte */}
        {showPositionForm && (
          <form onSubmit={handleRecordPosition} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">
                📍 Nouvelle position
              </h3>
              <button 
                type="button" 
                onClick={cancelPositionForm} 
                className="text-gray-400 hover:text-gray-600"
              >
                ✕ Annuler
              </button>
            </div>

            {/* Carte interactive */}
            <MapPicker
              value={selectedPosition}
              onChange={setSelectedPosition}
              center={lastPosition 
                ? [lastPosition.latitude, lastPosition.longitude] 
                : [36.8065, 10.1815]}
              zoom={13}
              height="400px"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vitesse (km/h)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: 60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse (optionnel)
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: Avenue Habib Bourguiba, Tunis"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={cancelPositionForm} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!selectedPosition}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
                  !selectedPosition ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <MapPinIcon className="h-4 w-4" />
                {selectedPosition ? 'Enregistrer la position' : 'Cliquez d\'abord sur la carte'}
              </button>
            </div>
          </form>
        )}

        {/* Carte avec la dernière position */}
        {!showPositionForm && <VehicleMap position={lastPosition} />}
      </div>

      {/* Historique des positions */}
      <PositionHistory positions={vehicle.positions || []} />
    </div>
  );
};

export default VehicleDetail;