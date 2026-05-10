import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import IncidentStatusBadge from '../Incidents/IncidentStatusBadge';

const typeIcons = {
  ACCIDENT: '💥',
  ROADWORK: '🚧',
  ROAD_CLOSED: '⛔',
  TRAFFIC_JAM: '🚗🚗🚗',
};

const RecentIncidents = ({ incidents }) => {
  const navigate = useNavigate();

  if (!incidents || incidents.length === 0) {
    return (
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Incidents récents</h2>
          <button
            onClick={() => navigate('/incidents')}
            className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
          >
            Voir tout
            <ArrowRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
        <p className="text-gray-500 text-center py-8">Aucun incident actif</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Incidents récents</h2>
        <button
          onClick={() => navigate('/incidents')}
          className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
        >
          Voir tout
          <ArrowRightIcon className="h-4 w-4 ml-1" />
        </button>
      </div>
      <div className="space-y-3">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
            onClick={() => navigate('/incidents')}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{typeIcons[incident.type]}</span>
              <div>
                <p className="font-medium text-gray-900">{incident.title}</p>
                <p className="text-sm text-gray-500">{incident.address || 'Position inconnue'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <IncidentStatusBadge status={incident.status} />
              <span className="text-sm text-gray-400">
                {new Date(incident.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentIncidents;