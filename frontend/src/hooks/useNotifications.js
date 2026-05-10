import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import toast from 'react-hot-toast';

const NOTIFICATIONS_QUERY = gql`
  query Notifications($recipientId: String, $limit: Int, $offset: Int) {
    notifications(recipientId: $recipientId) {
      id
      title
      message
      type
      isRead
      recipientId
      relatedEntityId
      readAt
      createdAt
    }
  }
`;

const UNREAD_COUNT_QUERY = gql`
  query UnreadNotificationsCount($recipientId: String!) {
    unreadNotificationsCount(recipientId: $recipientId)
  }
`;

const MARK_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      isRead
      readAt
    }
  }
`;

const MARK_ALL_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead($recipientId: String!) {
    markAllNotificationsRead(recipientId: $recipientId)
  }
`;

const DELETE_NOTIFICATION_MUTATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;

export const useNotifications = (options = {}) => {
  const { autoRefresh = true, refreshInterval = 30000 } = options;
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { data, refetch } = useQuery(NOTIFICATIONS_QUERY, {
    variables: { recipientId: userId },
    skip: !userId,
    onCompleted: (data) => {
      setNotifications(data?.notifications || []);
      setLoading(false);
    }
  });

  const { data: unreadData, refetch: refetchUnread } = useQuery(UNREAD_COUNT_QUERY, {
    variables: { recipientId: userId },
    skip: !userId,
    onCompleted: (data) => {
      setUnreadCount(data?.unreadNotificationsCount || 0);
    }
  });

  const [markRead] = useMutation(MARK_READ_MUTATION);
  const [markAllRead] = useMutation(MARK_ALL_READ_MUTATION);
  const [deleteNotification] = useMutation(DELETE_NOTIFICATION_MUTATION);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !userId) return;
    
    const interval = setInterval(() => {
      refetch();
      refetchUnread();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, userId, refetch, refetchUnread]);

  const handleMarkRead = useCallback(async (id) => {
    try {
      await markRead({ variables: { id } });
      await refetch();
      await refetchUnread();
      toast.success('Notification marquée comme lue');
    } catch (error) {
      toast.error(error.message);
    }
  }, [markRead, refetch, refetchUnread]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllRead({ variables: { recipientId: userId } });
      await refetch();
      await refetchUnread();
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      toast.error(error.message);
    }
  }, [markAllRead, userId, refetch, refetchUnread]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteNotification({ variables: { id } });
      await refetch();
      await refetchUnread();
      toast.success('Notification supprimée');
    } catch (error) {
      toast.error(error.message);
    }
  }, [deleteNotification, refetch, refetchUnread]);

  const getUnreadByType = useCallback((type) => {
    return notifications.filter(n => !n.isRead && n.type === type).length;
  }, [notifications]);

  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markRead: handleMarkRead,
    markAllRead: handleMarkAllRead,
    deleteNotification: handleDelete,
    refetch,
    getUnreadByType,
    getNotificationsByType,
    hasUnread: unreadCount > 0
  };
};

export default useNotifications;