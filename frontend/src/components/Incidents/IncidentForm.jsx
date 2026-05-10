import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import toast from 'react-hot-toast';

const CREATE_INCIDENT = gql`
  mutation CreateIncident(
    $title: String!
    $description: String
    $type: IncidentType!
    $latitude: Float!
    $longitude: Float!
    $address: String
  ) {
    createIncident(
      title: $title
      description: $description
      type: $type
      latitude: $latitude
      longitude: $longitude
      address: $address
    ) {
      id
      title
      type
      status
    }
  }
`;

const IncidentForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'ACCIDENT',
    latitude: 36.8065,
    longitude: 10.1815,
    address: '',
  });
  const [createIncident] = useMutation(CREATE_INCIDENT);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createIncident({ variables: formData });
      toast.success('Incident signalé avec succès');
      onSubmit?.();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input-field"
            required
          />
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field"
            rows="3"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="input-field"
          >
            <option value="ACCIDENT">Accident</option>
            <option value="ROADWORK">Travaux</option>
            <option value="ROAD_CLOSED">Route fermée</option>
            <option value="TRAFFIC_JAM">Bouchon</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude *
          </label>
          <input
            type="number"
            step="0.0000001"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
            className="input-field"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude *
          </label>
          <input
            type="number"
            step="0.0000001"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
            className="input-field"
            required
          />
        </div>
        
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="input-field"
            placeholder="Adresse complète"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Annuler
        </button>
        <button type="submit" className="btn-primary">
          Signaler
        </button>
      </div>
    </form>
  );
};

export default IncidentForm;