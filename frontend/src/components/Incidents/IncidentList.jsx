import React from 'react';
import IncidentStatusBadge from './IncidentStatusBadge';

const typeIcons = {
  ACCIDENT: '💥',
  ROADWORK: '🚧',
  ROAD_CLOSED: '⛔',
  TRAFFIC_JAM: '🚗🚗🚗',
};

const IncidentList = ({ incidents, onUpdateStatus, onDelete }) => {
  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Incident
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lieu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {incidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{incident.title}</div>
                    <div className="text-sm text-gray-500">{incident.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xl">{typeIcons[incident.type]}</span>
                  <span className="ml-2 text-sm text-gray-600">{incident.type}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {incident.address || `${incident.latitude}, ${incident.longitude}`}
                </td>
                <td className="px-6 py-4">
                  <IncidentStatusBadge status={incident.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(incident.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {incident.status !== 'RESOLVED' && (
                    <select
                      onChange={(e) => onUpdateStatus(incident.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                      value={incident.status}
                    >
                      <option value="REPORTED">Signalé</option>
                      <option value="IN_PROGRESS">En cours</option>
                      <option value="RESOLVED">Résolu</option>
                    </select>
                  )}
                  <button
                    onClick={() => onDelete(incident.id)}
                    className="text-red-600 hover:text-red-800 ml-2"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncidentList;