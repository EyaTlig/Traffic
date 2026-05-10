import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  TruckIcon,
  MapIcon,
  ExclamationTriangleIcon,
  BellIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Véhicules', href: '/vehicles', icon: TruckIcon },
  { name: 'Zones de Trafic', href: '/traffic', icon: MapIcon },
  { name: 'Incidents', href: '/incidents', icon: ExclamationTriangleIcon },
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
];

const adminNavigation = [
  { name: 'Utilisateurs', href: '/users', icon: UserGroupIcon },
  { name: 'Paramètres', href: '/settings', icon: Cog6ToothIcon },
];

const Sidebar = ({ user }) => {
  const allNavigation = [...navigation];
  if (user?.role === 'ADMIN') {
    allNavigation.push(...adminNavigation);
  }

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">🚦 TrafficFlow</h1>
        <p className="text-sm text-gray-400 mt-1">Urban Traffic Platform</p>
      </div>
      
      <nav className="flex-1 mt-6">
        {allNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;