const { v4: uuidv4 } = require('uuid');
const { getPool } = require('./db');

function fmt(row) {
  if (!row) return null;
  return {
    ...row,
    isRead: Boolean(row.isRead),
    createdAt: row.createdAt?.toISOString?.() || row.createdAt,
    readAt: row.readAt?.toISOString?.() || row.readAt || null,
  };
}

module.exports = {
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
      const [rows] = await pool.execute('SELECT * FROM notifications WHERE id = ?', [id]);
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

  Mutation: {
    sendNotification: async (_, args, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const id = uuidv4();
      await pool.execute(
        'INSERT INTO notifications (id, title, message, type, recipientId, relatedEntityId) VALUES (?,?,?,?,?,?)',
        [id, args.title, args.message, args.type || 'SYSTEM', args.recipientId, args.relatedEntityId || null]
      );
      const [rows] = await pool.execute('SELECT * FROM notifications WHERE id = ?', [id]);
      return fmt(rows[0]);
    },

    markNotificationRead: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      await pool.execute(
        'UPDATE notifications SET isRead = TRUE, readAt = NOW() WHERE id = ?',
        [id]
      );
      const [rows] = await pool.execute('SELECT * FROM notifications WHERE id = ?', [id]);
      if (!rows[0]) throw new Error('Notification not found');
      return fmt(rows[0]);
    },

    markAllNotificationsRead: async (_, { recipientId }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [result] = await pool.execute(
        'UPDATE notifications SET isRead = TRUE, readAt = NOW() WHERE recipientId = ? AND isRead = FALSE',
        [recipientId]
      );
      return result.affectedRows;
    },

    deleteNotification: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      await pool.execute('DELETE FROM notifications WHERE id = ?', [id]);
      return true;
    },
  },
};
