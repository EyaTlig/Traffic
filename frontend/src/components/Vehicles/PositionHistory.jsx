import React from 'react';
import { ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

const PositionHistory = ({ positions }) => {
  if (!positions || positions.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Historique des positions</h2>
        <p className="text-gray-500 text-center py-8">Aucune position enregistrée</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Historique des positions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date/Heure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vitesse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresse
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {positions.map((pos, index) => (
              <tr key={pos.id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {new Date(pos.recordedAt).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {pos.latitude.toFixed(6)}, {pos.longitude.toFixed(6)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {pos.speed} km/h
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {pos.address || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionHistory;