const { v4: uuidv4 } = require('uuid');
const { getPool } = require('./db');

function fmt(row) {
  if (!row) return null;
  return {
    ...row,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    createdAt: row.createdAt?.toISOString?.() || row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() || row.updatedAt,
    resolvedAt: row.resolvedAt?.toISOString?.() || row.resolvedAt || null,
  };
}

module.exports = {
  Query: {
    incidents: async (_, { type, status }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      let query = 'SELECT * FROM incidents WHERE 1=1';
      const params = [];
      if (type) { query += ' AND type = ?'; params.push(type); }
      if (status) { query += ' AND status = ?'; params.push(status); }
      query += ' ORDER BY createdAt DESC';
      const [rows] = await pool.execute(query, params);
      return rows.map(fmt);
    },

    incident: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute('SELECT * FROM incidents WHERE id = ?', [id]);
      if (!rows[0]) throw new Error('Incident not found');
      return fmt(rows[0]);
    },

    activeIncidents: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute(
        "SELECT * FROM incidents WHERE status IN ('REPORTED','IN_PROGRESS') ORDER BY createdAt DESC"
      );
      return rows.map(fmt);
    },
  },

  Mutation: {
    createIncident: async (_, args, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const id = uuidv4();
      await pool.execute(
        'INSERT INTO incidents (id, title, description, type, latitude, longitude, address, reportedBy) VALUES (?,?,?,?,?,?,?,?)',
        [id, args.title, args.description || null, args.type, args.latitude, args.longitude, args.address || null, user.sub]
      );
      const [rows] = await pool.execute('SELECT * FROM incidents WHERE id = ?', [id]);
      return fmt(rows[0]);
    },

    updateIncidentStatus: async (_, { id, status }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const resolvedAt = status === 'RESOLVED' ? new Date() : null;
      await pool.execute(
        'UPDATE incidents SET status = ?, resolvedAt = ? WHERE id = ?',
        [status, resolvedAt, id]
      );
      const [rows] = await pool.execute('SELECT * FROM incidents WHERE id = ?', [id]);
      if (!rows[0]) throw new Error('Incident not found');
      return fmt(rows[0]);
    },

    removeIncident: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      await pool.execute('DELETE FROM incidents WHERE id = ?', [id]);
      return true;
    },
  },
};
