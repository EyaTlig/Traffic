const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getPool } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_2024';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

function formatUser(row) {
  return {
    ...row,
    isActive: Boolean(row.isActive),
    createdAt: row.createdAt?.toISOString?.() || row.createdAt,
    updatedAt: row.updatedAt?.toISOString?.() || row.updatedAt,
  };
}

module.exports = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [user.sub]);
      if (!rows[0]) throw new Error('User not found');
      return formatUser(rows[0]);
    },

    users: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute('SELECT * FROM users');
      return rows.map(formatUser);
    },

    user: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const pool = await getPool();
      const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
      return rows[0] ? formatUser(rows[0]) : null;
    },
  },

  Mutation: {
    register: async (_, { email, username, password, role }) => {
      const pool = await getPool();
      const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length) throw new Error('Email already in use');

      const hashed = await bcrypt.hash(password, 10);
      const id = uuidv4();
      const userRole = role || 'OPERATOR';

      await pool.execute(
        'INSERT INTO users (id, email, username, password, role) VALUES (?, ?, ?, ?, ?)',
        [id, email, username, hashed, userRole]
      );

      const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
      const newUser = formatUser(rows[0]);
      return { accessToken: generateToken(newUser), user: newUser };
    },

    login: async (_, { email, password }) => {
      const pool = await getPool();
      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
      const dbUser = rows[0];
      if (!dbUser) throw new Error('Invalid credentials');

      const valid = await bcrypt.compare(password, dbUser.password);
      if (!valid) throw new Error('Invalid credentials');
      if (!dbUser.isActive) throw new Error('Account disabled');

      const user = formatUser(dbUser);
      return { accessToken: generateToken(user), user };
    },
  },
};
