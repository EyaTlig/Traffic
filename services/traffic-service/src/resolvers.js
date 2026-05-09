const { v4: uuidv4 } = require('uuid');
const { getPool } = require('./db');

function computeDensity(vehicleCount) {
  if (vehicleCount < 10) return 'LOW';
  if (vehicleCount < 30) return 'MEDIUM';
  return 'HIGH';
}

function fmt(row) {
  if (!row) return null;
  return {
    ...row,
    isActive: row.isActive !== undefined ? Boolean(row.isActive) : undefined,
    centerLatitude: parseFloat(row.centerLatitude),
    centerLongitude: parseFloat(row.centerLongitude),
    radiusMeters: row.radiusMeters ? parseFloat(row.radiusMeters) : undefined,
    averageSpeed: row.averageSpeed != null ? parseFloat(row.averageSpeed) : null,
    createdAt: row.createdAt?.toISOString?.() || row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() || row.updatedAt,
    measuredAt: row.measuredAt?.toISOString?.() || row.measuredAt,
  };
}

module.exports = {
  Query: {
    trafficZones: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute('SELECT * FROM traffic_zones ORDER BY createdAt DESC');
      return rows.map(fmt);
    },

    trafficZone: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute('SELECT * FROM traffic_zones WHERE id = ?', [id]);
      if (!rows[0]) throw new Error('Zone not found');
      return fmt(rows[0]);
    },

    congestedZones: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute(
        "SELECT * FROM traffic_zones WHERE currentDensity = 'HIGH' AND isActive = TRUE"
      );
      return rows.map(fmt);
    },

    zoneMeasurements: async (_, { zoneId, limit = 20 }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM traffic_measurements WHERE zoneId = ? ORDER BY measuredAt DESC LIMIT ?',
        [zoneId, limit]
      );
      return rows.map(fmt);
    },

    densityStats: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute(
        "SELECT currentDensity, COUNT(*) as cnt FROM traffic_zones GROUP BY currentDensity"
      );
      const stats = { low: 0, medium: 0, high: 0 };
      rows.forEach(r => {
        if (r.currentDensity === 'LOW') stats.low = r.cnt;
        if (r.currentDensity === 'MEDIUM') stats.medium = r.cnt;
        if (r.currentDensity === 'HIGH') stats.high = r.cnt;
      });
      return stats;
    },
  },

  Mutation: {
    createTrafficZone: async (_, args, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const id = uuidv4();
      await pool.execute(
        'INSERT INTO traffic_zones (id, name, description, centerLatitude, centerLongitude, radiusMeters) VALUES (?,?,?,?,?,?)',
        [id, args.name, args.description || null, args.centerLatitude, args.centerLongitude, args.radiusMeters]
      );
      const [rows] = await pool.execute('SELECT * FROM traffic_zones WHERE id = ?', [id]);
      return fmt(rows[0]);
    },

    updateTrafficZone: async (_, { id, ...fields }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const updates = Object.entries(fields).filter(([, v]) => v !== undefined);
      if (updates.length) {
        const set = updates.map(([k]) => `${k} = ?`).join(', ');
        await pool.execute(`UPDATE traffic_zones SET ${set} WHERE id = ?`, [...updates.map(([, v]) => v), id]);
      }
      const [rows] = await pool.execute('SELECT * FROM traffic_zones WHERE id = ?', [id]);
      if (!rows[0]) throw new Error('Zone not found');
      return fmt(rows[0]);
    },

    measureTraffic: async (_, args, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [zone] = await pool.execute('SELECT id FROM traffic_zones WHERE id = ?', [args.zoneId]);
      if (!zone.length) throw new Error('Zone not found');

      const density = computeDensity(args.vehicleCount);
      const id = uuidv4();

      await pool.execute(
        'INSERT INTO traffic_measurements (id, zoneId, vehicleCount, averageSpeed, density, notes) VALUES (?,?,?,?,?,?)',
        [id, args.zoneId, args.vehicleCount, args.averageSpeed || null, density, args.notes || null]
      );
      await pool.execute('UPDATE traffic_zones SET currentDensity = ? WHERE id = ?', [density, args.zoneId]);

      const [rows] = await pool.execute('SELECT * FROM traffic_measurements WHERE id = ?', [id]);
      return fmt(rows[0]);
    },
  },

  TrafficZone: {
    measurements: async (parent) => {
      const pool = await getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM traffic_measurements WHERE zoneId = ? ORDER BY measuredAt DESC LIMIT 5',
        [parent.id]
      );
      return rows.map(fmt);
    },
  },
};
