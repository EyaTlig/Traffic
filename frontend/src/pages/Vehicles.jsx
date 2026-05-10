import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { PlusIcon } from '@heroicons/react/24/outline';
import VehicleList from '../components/Vehicles/VehicleList';
import VehicleForm from '../components/Vehicles/VehicleForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const VEHICLES_QUERY = gql`
  query Vehicles {
    vehicles {
      id
      licensePlate
      brand
      model
      type
      status
      driverName
      createdAt
      positions {
        latitude
        longitude
        speed
        recordedAt
      }
    }
  }
`;

const CREATE_VEHICLE = gql`
  mutation CreateVehicle($licensePlate: String!, $brand: String!, $model: String!, $type: VehicleType, $driverName: String) {
    createVehicle(licensePlate: $licensePlate, brand: $brand, model: $model, type: $type, driverName: $driverName) {
      id
      licensePlate
      brand
      model
      type
      status
      driverName
    }
  }
`;

const REMOVE_VEHICLE = gql`
  mutation RemoveVehicle($id: ID!) {
    removeVehicle(id: $id)
  }
`;

const Vehicles = () => {
  const [showForm, setShowForm] = useState(false);
  const { loading, error, data, refetch } = useQuery(VEHICLES_QUERY);
  const [createVehicle] = useMutation(CREATE_VEHICLE);
  const [removeVehicle] = useMutation(REMOVE_VEHICLE);

  const handleCreate = async (vehicleData) => {
    try {
      await createVehicle({ variables: vehicleData });
      toast.success('Véhicule créé avec succès');
      setShowForm(false);
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      try {
        await removeVehicle({ variables: { id } });
        toast.success('Véhicule supprimé');
        refetch();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Véhicules</h1>
          <p className="text-gray-600 mt-1">Gestion de la flotte de véhicules</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nouveau Véhicule
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Ajouter un véhicule</h2>
          <VehicleForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <VehicleList vehicles={data?.vehicles || []} onDelete={handleDelete} />
    </div>
  );
};

export default Vehicles;