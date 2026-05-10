import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, TrashIcon, MapPinIcon } from '@heroicons/react/24/outline';

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
};

const typeIcons = {
  CAR: '🚗',
  TRUCK: '🚚',
  BUS: '🚌',
  MOTORCYCLE: '🏍️',
  EMERGENCY: '🚨',
};

const VehicleList = ({ vehicles, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Véhicule
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conducteur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernière Position
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">
                      {vehicle.brand} {vehicle.model}
                    </div>
                    <div className="text-sm text-gray-500">{vehicle.licensePlate}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xl">{typeIcons[vehicle.type]}</span>
                  <span className="ml-2 text-sm text-gray-600">{vehicle.type}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {vehicle.driverName || '-'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[vehicle.status]}`}>
                    {vehicle.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {vehicle.positions?.[0] ? (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {vehicle.positions[0].speed} km/h
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Aucune donnée</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(vehicle.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-5 w-5" />
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

export default VehicleList;