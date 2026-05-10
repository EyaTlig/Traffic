import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import IncidentList from '../components/Incidents/IncidentList';
import IncidentForm from '../components/Incidents/IncidentForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const INCIDENTS_QUERY = gql`
  query Incidents($type: IncidentType, $status: IncidentStatus) {
    incidents(type: $type, status: $status) {
      id
      title
      description
      type
      status
      latitude
      longitude
      address
      reportedBy
      resolvedAt
      createdAt
    }
  }
`;

const UPDATE_STATUS = gql`
  mutation UpdateIncidentStatus($id: ID!, $status: IncidentStatus!) {
    updateIncidentStatus(id: $id, status: $status) {
      id
      status
      resolvedAt
    }
  }
`;

const REMOVE_INCIDENT = gql`
  mutation RemoveIncident($id: ID!) {
    removeIncident(id: $id)
  }
`;

const Incidents = () => {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ type: null, status: null });
  const { loading, error, data, refetch } = useQuery(INCIDENTS_QUERY, { variables: filters });
  const [updateStatus] = useMutation(UPDATE_STATUS);
  const [removeIncident] = useMutation(REMOVE_INCIDENT);

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateStatus({ variables: { id, status } });
      toast.success('Statut mis à jour');
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet incident ?')) {
      try {
        await removeIncident({ variables: { id } });
        toast.success('Incident supprimé');
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
          <h1 className="text-3xl font-bold text-gray-900">Incidents</h1>
          <p className="text-gray-600 mt-1">Gestion des incidents de trafic</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Signaler un incident
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Nouvel incident</h2>
          <IncidentForm onSubmit={() => { setShowForm(false); refetch(); }} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <IncidentList
        incidents={data?.incidents || []}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Incidents;