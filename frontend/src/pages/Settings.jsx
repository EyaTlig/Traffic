import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BellIcon, MapIcon, ShieldCheckIcon, ComputerDesktopIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Settings = () => {
  const { isAdmin, user } = useAuth();
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      incidentAlerts: true,
      trafficAlerts: true,
      systemAlerts: true,
    },
    map: {
      defaultZoom: 12,
      showTrafficZones: true,
      showIncidents: true,
      updateInterval: 30,
    },
    appearance: {
      theme: 'light',
      densityColors: true,
    },
  });

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-red-600">Accès non autorisé</h2>
        <p className="mt-2">Vous n'avez pas les droits pour accéder à cette page.</p>
      </div>
    );
  }

  const handleSave = () => {
    toast.success('Paramètres sauvegardés');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Configuration de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation des paramètres */}
        <div className="lg:col-span-1">
          <div className="card">
            <nav className="space-y-1">
              <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                <BellIcon className="mr-3 h-5 w-5" />
                Notifications
              </button>
              <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <MapIcon className="mr-3 h-5 w-5" />
                Carte
              </button>
              <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <ComputerDesktopIcon className="mr-3 h-5 w-5" />
                Apparence
              </button>
              <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <GlobeAltIcon className="mr-3 h-5 w-5" />
                Intégrations
              </button>
              <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                <ShieldCheckIcon className="mr-3 h-5 w-5" />
                Sécurité
              </button>
            </nav>
          </div>
        </div>

        {/* Formulaire des paramètres */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Alertes email</p>
                  <p className="text-sm text-gray-500">Recevoir des alertes par email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailAlerts}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailAlerts: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Alertes incidents</p>
                  <p className="text-sm text-gray-500">Notifications pour les nouveaux incidents</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.incidentAlerts}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, incidentAlerts: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Alertes trafic</p>
                  <p className="text-sm text-gray-500">Changements de densité de trafic</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.trafficAlerts}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, trafficAlerts: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Alertes système</p>
                  <p className="text-sm text-gray-500">Notifications système importantes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.systemAlerts}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, systemAlerts: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Carte</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom par défaut
                  </label>
                  <select
                    value={settings.map.defaultZoom}
                    onChange={(e) => setSettings({
                      ...settings,
                      map: { ...settings.map, defaultZoom: parseInt(e.target.value) }
                    })}
                    className="input-field w-32"
                  >
                    {[10, 11, 12, 13, 14, 15].map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intervalle de mise à jour (secondes)
                  </label>
                  <select
                    value={settings.map.updateInterval}
                    onChange={(e) => setSettings({
                      ...settings,
                      map: { ...settings.map, updateInterval: parseInt(e.target.value) }
                    })}
                    className="input-field w-32"
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={60}>60</option>
                    <option value={120}>120</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={handleSave} className="btn-primary">
                Sauvegarder les paramètres
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;