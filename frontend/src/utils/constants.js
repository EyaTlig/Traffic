// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/graphql';
export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:4000/graphql';

// Map Configuration
export const MAP_TILE_URL = process.env.REACT_APP_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const DEFAULT_CENTER = { lat: 36.8065, lng: 10.1815 }; // Tunis
export const DEFAULT_ZOOM = 12;

// Vehicle Types
export const VEHICLE_TYPES = {
  CAR: { label: 'Voiture', icon: '🚗', color: 'blue' },
  TRUCK: { label: 'Camion', icon: '🚚', color: 'orange' },
  BUS: { label: 'Bus', icon: '🚌', color: 'green' },
  MOTORCYCLE: { label: 'Moto', icon: '🏍️', color: 'red' },
  EMERGENCY: { label: 'Urgence', icon: '🚨', color: 'purple' }
};

// Vehicle Status
export const VEHICLE_STATUS = {
  ACTIVE: { label: 'Actif', color: 'green', bg: 'bg-green-100', text: 'text-green-800' },
  INACTIVE: { label: 'Inactif', color: 'gray', bg: 'bg-gray-100', text: 'text-gray-800' },
  MAINTENANCE: { label: 'Maintenance', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' }
};

// Incident Types
export const INCIDENT_TYPES = {
  ACCIDENT: { label: 'Accident', icon: '💥', color: 'red', severity: 'high' },
  ROADWORK: { label: 'Travaux', icon: '🚧', color: 'orange', severity: 'medium' },
  ROAD_CLOSED: { label: 'Route fermée', icon: '⛔', color: 'red', severity: 'high' },
  TRAFFIC_JAM: { label: 'Bouchon', icon: '🚗🚗🚗', color: 'yellow', severity: 'medium' }
};

// Incident Status
export const INCIDENT_STATUS = {
  REPORTED: { label: 'Signalé', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '📢' },
  IN_PROGRESS: { label: 'En cours', color: 'blue', bg: 'bg-blue-100', text: 'text-blue-800', icon: '🔄' },
  RESOLVED: { label: 'Résolu', color: 'green', bg: 'bg-green-100', text: 'text-green-800', icon: '✅' }
};

// Traffic Density
export const TRAFFIC_DENSITY = {
  LOW: { label: 'Fluide', color: 'green', bg: 'bg-green-100', text: 'text-green-800', description: 'Circulation normale' },
  MEDIUM: { label: 'Dense', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800', description: 'Ralentissements' },
  HIGH: { label: 'Congestionné', color: 'red', bg: 'bg-red-100', text: 'text-red-800', description: 'Fort ralentissements' }
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INCIDENT: { label: 'Incident', icon: '⚠️', color: 'red' },
  CONGESTION: { label: 'Congestion', icon: '🚗', color: 'orange' },
  SYSTEM: { label: 'Système', icon: '🖥️', color: 'blue' },
  ALERT: { label: 'Alerte', icon: '🚨', color: 'purple' }
};

// User Roles
export const USER_ROLES = {
  ADMIN: { label: 'Administrateur', level: 2, color: 'purple' },
  OPERATOR: { label: 'Opérateur', level: 1, color: 'blue' }
};

// Colors for charts
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#8b5cf6',
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444'
};

// Date formats
export const DATE_FORMATS = {
  full: 'DD/MM/YYYY HH:mm:ss',
  date: 'DD/MM/YYYY',
  time: 'HH:mm:ss',
  relative: 'relative'
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

// Refresh intervals (ms)
export const REFRESH_INTERVALS = {
  dashboard: 30000,    // 30 seconds
  map: 15000,          // 15 seconds
  notifications: 30000, // 30 seconds
  traffic: 30000,      // 30 seconds
  incidents: 30000     // 30 seconds
};