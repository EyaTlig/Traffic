const { v4: uuidv4 } = require('uuid');
const { PubSub, withFilter } = require('graphql-subscriptions');
const { getPool } = require('./db');

const pubsub = new PubSub();

// ── Event names ────────────────────────────────────────────────────────────
const NOTIFICATION_RECEIVED = 'NOTIFICATION_RECEIVED';
const NOTIFICATION_READ      = 'NOTIFICATION_READ';

// ── Helper ─────────────────────────────────────────────────────────────────
function fmt(row) {
  if (!row) return null;
  return {
    ...row,
    isRead: Boolean(row.isRead),
    createdAt: row.createdAt?.toISOString?.() || row.createdAt,
    readAt:    row.readAt?.toISOString?.()    || row.readAt || null,
  };
}

module.exports = {
  // ── Queries ───────────────────────────────────────────────────────────────
  Query: {
    notifications: async (_, { recipientId }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const id = recipientId || user.sub;
      const [rows] = await pool.execute(
        'SELECT * FROM notifications WHERE recipientId = ? ORDER BY createdAt DESC',
        [id]
      );
      return rows.map(fmt);
    },

    notification: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM notifications WHERE id = ?',
        [id]
      );
      if (!rows[0]) throw new Error('Notification not found');
      return fmt(rows[0]);
    },

    unreadNotificationsCount: async (_, { recipientId }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as cnt FROM notifications WHERE recipientId = ? AND isRead = FALSE',
        [recipientId]
      );
      return rows[0].cnt;
    },
  },

  // ── Mutations ─────────────────────────────────────────────────────────────
  Mutation: {
    sendNotification: async (_, args, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const id = uuidv4();

      await pool.execute(
        'INSERT INTO notifications (id, title, message, type, recipientId, relatedEntityId) VALUES (?,?,?,?,?,?)',
        [id, args.title, args.message, args.type || 'SYSTEM', args.recipientId, args.relatedEntityId || null]
      );

      const [rows] = await pool.execute(
        'SELECT * FROM notifications WHERE id = ?',
        [id]
      );
      const notification = fmt(rows[0]);

      // 🔔 Push WebSocket event to the recipient's subscribers
      pubsub.publish(NOTIFICATION_RECEIVED, {
        notificationReceived: notification,
        recipientId: args.recipientId,
      });

      return notification;
    },

    markNotificationRead: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();

      await pool.execute(
        'UPDATE notifications SET isRead = TRUE, readAt = NOW() WHERE id = ?',
        [id]
      );

      const [rows] = await pool.execute(
        'SELECT * FROM notifications WHERE id = ?',
        [id]
      );
      if (!rows[0]) throw new Error('Notification not found');
      const notification = fmt(rows[0]);

      // 🔔 Push read event
      pubsub.publish(NOTIFICATION_READ, {
        notificationRead: notification,
        recipientId: notification.recipientId,
      });

      return notification;
    },

    markAllNotificationsRead: async (_, { recipientId }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();

      await pool.execute(
        'UPDATE notifications SET isRead = TRUE, readAt = NOW() WHERE recipientId = ? AND isRead = FALSE',
        [recipientId]
      );

      // Push a read event for each updated notification so subscribers stay in sync
      const [updated] = await pool.execute(
        'SELECT * FROM notifications WHERE recipientId = ? AND isRead = TRUE',
        [recipientId]
      );
      updated.forEach((row) => {
        pubsub.publish(NOTIFICATION_READ, {
          notificationRead: fmt(row),
          recipientId,
        });
      });

      return updated.length;
    },

    deleteNotification: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      await pool.execute('DELETE FROM notifications WHERE id = ?', [id]);
      return true;
    },
  },

  // ── Subscriptions ─────────────────────────────────────────────────────────
  Subscription: {
    notificationReceived: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([NOTIFICATION_RECEIVED]),
        (payload, variables) =>
          payload.recipientId === variables.recipientId
      ),
    },

    notificationRead: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([NOTIFICATION_READ]),
        (payload, variables) =>
          payload.recipientId === variables.recipientId
      ),
    },
  },
};