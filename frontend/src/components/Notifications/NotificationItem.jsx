import React from 'react';
import { CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { NOTIFICATION_TYPES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

const NotificationItem = ({ notification, onMarkRead, onDelete, compact = false }) => {
  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.SYSTEM;
  
  if (compact) {
    return (
      <div 
        className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
          !notification.isRead 
            ? 'bg-primary-50 border-l-4 border-l-primary-500' 
            : 'hover:bg-gray-50'
        }`}
        onClick={() => !notification.isRead && onMarkRead(notification.id)}
      >
        <div className="flex items-center space-x-3 flex-1">
          <span className="text-xl">{typeConfig.icon}</span>
          <div className="flex-1">
            <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
              {notification.title}
            </p>
            <p className="text-xs text-gray-500">{formatDate(notification.createdAt, 'relative')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!notification.isRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
              className="p-1 text-green-600 hover:text-green-800"
              title="Marquer comme lu"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="p-1 text-red-600 hover:text-red-800"
            title="Supprimer"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`card transition-all ${
        !notification.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
              {typeConfig.icon}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`text-gray-900 ${!notification.isRead ? 'font-semibold' : ''}`}>
                {notification.title}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full bg-${typeConfig.color}-100 text-${typeConfig.color}-800`}>
                {typeConfig.label}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span>{formatDate(notification.createdAt)}</span>
              {notification.readAt && (
                <span>Lu le {formatDate(notification.readAt)}</span>
              )}
              {notification.relatedEntityId && (
                <span>ID: {notification.relatedEntityId.slice(0, 8)}...</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2 ml-4">
          {!notification.isRead && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="p-2 text-green-600 hover:text-green-800 transition-colors"
              title="Marquer comme lu"
            >
              <CheckIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="p-2 text-red-600 hover:text-red-800 transition-colors"
            title="Supprimer"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;