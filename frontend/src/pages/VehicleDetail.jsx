import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { ArrowLeftIcon, MapPinIcon, ClockIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import VehicleMap from '../components/Vehicles/VehicleMap';
import PositionHistory from '../components/Vehicles/PositionHistory';
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
      updatedAt
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
      updatedAt
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
  const [newPosition, setNewPosition] = useState({
    latitude: 36.8065,
    longitude: 10.1815,
    speed: 0,
    address: ''
  });

  const { loading, error, data, refetch } = useQuery(VEHICLE_DETAIL_QUERY, {
    variables: { id }
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
      toast.success('Véhicule mis à jour');
      setIsEditing(false);
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRecordPosition = async (e) => {
    e.preventDefault();
    try {
      await recordPosition({ variables: { vehicleId: id, ...newPosition } });
      toast.success('Position enregistrée');
      setShowPositionForm(false);
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  const vehicle = data?.vehicle;
  if (!vehicle) return <div className="text-center py-12">Véhicule non trouvé</div>;

  const lastPosition = vehicle.positions?.[0];
  const positionHistory = vehicle.positions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/vehicles')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-gray-600">{vehicle.licensePlate}</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-secondary"
        >
          {isEditing ? 'Annuler' : 'Modifier'}
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Conducteur</p>
              <p className="font-semibold">{vehicle.driverName || 'Non assigné'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPinIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Vitesse actuelle</p>
              <p className="font-semibold">{lastPosition?.speed || 0} km/h</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClockIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dernière mise à jour</p>
              <p className="font-semibold text-sm">
                {lastPosition ? new Date(lastPosition.recordedAt).toLocaleString() : 'Jamais'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <p className="font-semibold">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  vehicle.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  vehicle.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {vehicle.status === 'ACTIVE' ? 'Actif' : vehicle.status === 'INACTIVE' ? 'Inactif' : 'Maintenance'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="card">
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
                  className="input-field"
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
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="btn-primary">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Map */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Position actuelle</h2>
          <button
            onClick={() => setShowPositionForm(!showPositionForm)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showPositionForm ? 'Annuler' : '+ Enregistrer une position'}
          </button>
        </div>
        
        {showPositionForm && (
          <form onSubmit={handleRecordPosition} className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0000001"
                  value={newPosition.latitude}
                  onChange={(e) => setNewPosition({ ...newPosition, latitude: parseFloat(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0000001"
                  value={newPosition.longitude}
                  onChange={(e) => setNewPosition({ ...newPosition, longitude: parseFloat(e.target.value) })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vitesse (km/h)
                </label>
                <input
                  type="number"
                  step="1"
                  value={newPosition.speed}
                  onChange={(e) => setNewPosition({ ...newPosition, speed: parseFloat(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={newPosition.address}
                  onChange={(e) => setNewPosition({ ...newPosition, address: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="submit" className="btn-primary">
                Enregistrer
              </button>
            </div>
          </form>
        )}
        
        <VehicleMap position={lastPosition} />
      </div>

      {/* Position History */}
      <PositionHistory positions={positionHistory} />
    </div>
  );
};

export default VehicleDetail;