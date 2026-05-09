const { v4: uuidv4 } = require('uuid');
const { getPool } = require('./db');

function fmt(row) {
  if (!row) return null;
  return {
    ...row,
    createdAt: row.createdAt?.toISOString?.() || row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() || row.updatedAt,
    recordedAt: row.recordedAt?.toISOString?.() || row.recordedAt,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    speed: row.speed != null ? parseFloat(row.speed) : null,
  };
}

module.exports = {
  Query: {
    vehicles: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute('SELECT * FROM vehicles ORDER BY createdAt DESC');
      return rows.map(fmt);
    },

    vehicle: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute('SELECT * FROM vehicles WHERE id = ?', [id]);
      if (!rows[0]) throw new Error('Vehicle not found');
      return fmt(rows[0]);
    },

    positionHistory: async (_, { vehicleId, limit = 50 }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM gps_positions WHERE vehicleId = ? ORDER BY recordedAt DESC LIMIT ?',
        [vehicleId, limit]
      );
      return rows.map(fmt);
    },

    lastPosition: async (_, { vehicleId }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM gps_positions WHERE vehicleId = ? ORDER BY recordedAt DESC LIMIT 1',
        [vehicleId]
      );
      return rows[0] ? fmt(rows[0]) : null;
    },
  },

  Mutation: {
    createVehicle: async (_, args, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [exists] = await pool.execute(
        'SELECT id FROM vehicles WHERE licensePlate = ?', [args.licensePlate]
      );
      if (exists.length) throw new Error('License plate already registered');

      const id = uuidv4();
      await pool.execute(
        'INSERT INTO vehicles (id, licensePlate, brand, model, type, driverName) VALUES (?,?,?,?,?,?)',
        [id, args.licensePlate, args.brand, args.model, args.type || 'CAR', args.driverName || null]
      );
      const [rows] = await pool.execute('SELECT * FROM vehicles WHERE id = ?', [id]);
      return fmt(rows[0]);
    },

    updateVehicle: async (_, { id, ...fields }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const updates = Object.entries(fields).filter(([, v]) => v !== undefined);
      if (updates.length) {
        const set = updates.map(([k]) => `${k} = ?`).join(', ');
        const vals = updates.map(([, v]) => v);
        await pool.execute(`UPDATE vehicles SET ${set} WHERE id = ?`, [...vals, id]);
      }
      const [rows] = await pool.execute('SELECT * FROM vehicles WHERE id = ?', [id]);
      if (!rows[0]) throw new Error('Vehicle not found');
      return fmt(rows[0]);
    },

    removeVehicle: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      await pool.execute('DELETE FROM vehicles WHERE id = ?', [id]);
      return true;
    },

    recordPosition: async (_, args, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [veh] = await pool.execute('SELECT id FROM vehicles WHERE id = ?', [args.vehicleId]);
      if (!veh.length) throw new Error('Vehicle not found');

      const id = uuidv4();
      await pool.execute(
        'INSERT INTO gps_positions (id, vehicleId, latitude, longitude, speed, address) VALUES (?,?,?,?,?,?)',
        [id, args.vehicleId, args.latitude, args.longitude, args.speed || null, args.address || null]
      );
      const [rows] = await pool.execute('SELECT * FROM gps_positions WHERE id = ?', [id]);
      return fmt(rows[0]);
    },
  },

  Vehicle: {
    positions: async (parent) => {
      const pool = await getPool();
      const [rows] = await pool.execute(
        'SELECT * FROM gps_positions WHERE vehicleId = ? ORDER BY recordedAt DESC LIMIT 10',
        [parent.id]
      );
      return rows.map(fmt);
    },
  },
};
