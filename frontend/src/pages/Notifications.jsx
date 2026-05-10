import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { CheckIcon, TrashIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

const NOTIFICATIONS_QUERY = gql`
  query Notifications($recipientId: String) {
    notifications(recipientId: $recipientId) {
      id
      title
      message
      type
      isRead
      relatedEntityId
      readAt
      createdAt
    }
  }
`;

const MARK_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      isRead
      readAt
    }
  }
`;

const MARK_ALL_READ = gql`
  mutation MarkAllNotificationsRead($recipientId: String!) {
    markAllNotificationsRead(recipientId: $recipientId)
  }
`;

const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;

const typeIcons = {
  INCIDENT: '⚠️',
  CONGESTION: '🚗',
  SYSTEM: '🖥️',
  ALERT: '🚨',
};

const Notifications = () => {
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
  const { loading, error, data, refetch } = useQuery(NOTIFICATIONS_QUERY, {
    variables: { recipientId: userId },
  });
  const [markRead] = useMutation(MARK_READ);
  const [markAllRead] = useMutation(MARK_ALL_READ);
  const [deleteNotif] = useMutation(DELETE_NOTIFICATION);

  const handleMarkRead = async (id) => {
    try {
      await markRead({ variables: { id } });
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead({ variables: { recipientId: userId } });
      toast.success('Toutes les notifications ont été marquées comme lues');
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotif({ variables: { id } });
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2">
            <CheckBadgeIcon className="h-5 w-5" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📭</div>
            <p>Aucune notification</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`card transition-all ${!notif.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">{typeIcons[notif.type] || '📢'}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                    <p className="text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notif.createdAt).toLocaleString()}
                      {notif.readAt && ` • Lu le ${new Date(notif.readAt).toLocaleString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="p-1 text-green-600 hover:text-green-800"
                      title="Marquer comme lu"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Supprimer"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;