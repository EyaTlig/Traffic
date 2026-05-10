import React, { useState } from 'react';

const ZoneForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    centerLatitude: 36.8065,
    centerLongitude: 10.1815,
    radiusMeters: 500,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-field"
            rows="2"
            placeholder="Description de la zone"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude Centre *
          </label>
          <input
            type="number"
            step="0.0000001"
            value={formData.centerLatitude}
            onChange={(e) => setFormData({ ...formData, centerLatitude: parseFloat(e.target.value) })}
            className="input-field"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude Centre *
          </label>
          <input
            type="number"
            step="0.0000001"
            value={formData.centerLongitude}
            onChange={(e) => setFormData({ ...formData, centerLongitude: parseFloat(e.target.value) })}
            className="input-field"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rayon (mètres) *
          </label>
          <input
            type="number"
            step="100"
            value={formData.radiusMeters}
            onChange={(e) => setFormData({ ...formData, radiusMeters: parseFloat(e.target.value) })}
            className="input-field"
            required
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Annuler
        </button>
        <button type="submit" className="btn-primary">
          Créer la zone
        </button>
      </div>
    </form>
  );
};

export default ZoneForm;