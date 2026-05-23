import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

const UNREAD_COUNT_QUERY = gql`
  query UnreadNotificationsCount($recipientId: String!) {
    unreadNotificationsCount(recipientId: $recipientId)
  }
`;

const NotificationBell = () => {
  const navigate = useNavigate();

  // ✅ FIX: l'utilisateur est stocké sous 'user', pas 'userId'
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;

  const { data, refetch } = useQuery(UNREAD_COUNT_QUERY, {
    variables: { recipientId: userId || '' },
    skip: !userId,
    pollInterval: 10000, // ✅ réduit à 10s pour voir les notifs plus vite
    fetchPolicy: 'network-only',
  });

  const unreadCount = data?.unreadNotificationsCount || 0;

  return (
    <button
      onClick={() => navigate('/notifications')}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      {unreadCount > 0 ? (
        <>
          <BellSolidIcon className="h-6 w-6 text-primary-500" />
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </>
      ) : (
        <BellIcon className="h-6 w-6" />
      )}
    </button>
  );
};

export default NotificationBell;