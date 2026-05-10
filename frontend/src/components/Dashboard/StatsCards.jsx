import React from 'react';
import { TruckIcon, ExclamationTriangleIcon, MapIcon, BellIcon } from '@heroicons/react/24/outline';

const StatsCards = ({ stats, incidentCount }) => {
  const cards = [
    {
      title: 'Incidents Actifs',
      value: incidentCount || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      change: '+12%',
    },
    {
      title: 'Zones Congestionnées',
      value: stats?.high || 0,
      icon: MapIcon,
      color: 'bg-orange-500',
      change: '+5%',
    },
    {
      title: 'Véhicules Actifs',
      value: '42',
      icon: TruckIcon,
      color: 'bg-blue-500',
      change: '+8%',
    },
    {
      title: 'Notifications',
      value: '156',
      icon: BellIcon,
      color: 'bg-purple-500',
      change: '-3%',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div key={card.title} className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className={`${card.color} p-3 rounded-full`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">↑ {card.change}</span>
            <span className="text-sm text-gray-500 ml-2">vs mois dernier</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;