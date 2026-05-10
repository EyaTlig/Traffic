import React from 'react';

const statusConfig = {
  REPORTED: { label: 'Signalé', color: 'bg-yellow-100 text-yellow-800', icon: '📢' },
  IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
  RESOLVED: { label: 'Résolu', color: 'bg-green-100 text-green-800', icon: '✅' },
};

const IncidentStatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.REPORTED;
  
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

export default IncidentStatusBadge;