import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import toast from 'react-hot-toast';
import MapPicker from '../Common/MapPicker';

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
      latitude
      longitude
    }
  }
`;

const IncidentForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'ACCIDENT',
    address: '',
  });

  // Position sélectionnée sur la carte
  const [selectedPosition, setSelectedPosition] = useState(null);

  const [createIncident] = useMutation(CREATE_INCIDENT);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier qu'une position a été sélectionnée
    if (!selectedPosition) {
      toast.error("Veuillez cliquer sur la carte pour sélectionner l'emplacement de l'incident");
      return;
    }

    try {
      const result = await createIncident({
        variables: {
          title: formData.title,
          description: formData.description || null,
          type: formData.type,
          latitude: selectedPosition.lat,
          longitude: selectedPosition.lng,
          address: formData.address || null,
        },
      });
      
      console.log('Incident créé:', result.data.createIncident);
      toast.success('Incident signalé avec succès');
      
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de la création');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
            placeholder="Ex: Accident sur la route principale"
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
            placeholder="Détails supplémentaires sur l'incident..."
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
            <option value="ACCIDENT">💥 Accident</option>
            <option value="ROADWORK">🚧 Travaux</option>
            <option value="ROAD_CLOSED">⛔ Route fermée</option>
            <option value="TRAFFIC_JAM">🚗 Bouchon / Congestion</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse précise (optionnel)
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="input-field"
            placeholder="Ex: Route de Midoun, Djerba"
          />
        </div>
      </div>

      {/* Carte pour sélectionner la position */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📍 Localisation sur la carte *
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Cliquez directement sur la carte pour placer le marqueur à l'emplacement exact de l'incident
        </p>
        
        <MapPicker
          value={selectedPosition}
          onChange={setSelectedPosition}
          center={[36.8065, 10.1815]}
          zoom={7}
          height="400px"
        />
      </div>

      {/* Boutons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Annuler
        </button>
        <button
          type="submit"
          disabled={!selectedPosition}
          className={`btn-primary ${!selectedPosition ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {selectedPosition ? '✅ Signaler l\'incident' : '📍 Cliquez d\'abord sur la carte'}
        </button>
      </div>
    </form>
  );
};

export default IncidentForm;