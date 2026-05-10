import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { PlusIcon } from '@heroicons/react/24/outline';
import ZoneList from '../components/Traffic/ZoneList';
import ZoneForm from '../components/Traffic/ZoneForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

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

const TrafficZones = () => {
  const [showForm, setShowForm] = useState(false);
  const { loading, error, data, refetch } = useQuery(TRAFFIC_ZONES_QUERY);
  const [createZone] = useMutation(CREATE_ZONE);

  const handleCreate = async (zoneData) => {
    try {
      await createZone({ variables: zoneData });
      toast.success('Zone de trafic créée avec succès');
      setShowForm(false);
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zones de Trafic</h1>
          <p className="text-gray-600 mt-1">Gestion des zones de mesure de densité</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Ajouter une zone
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Nouvelle zone</h2>
          <ZoneForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <ZoneList zones={data?.trafficZones || []} />
    </div>
  );
};

export default TrafficZones;