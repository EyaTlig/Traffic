const mysql = require('mysql2/promise');
let pool;

async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'traffic_db',
      waitForConnections: true,
      connectionLimit: 10,
    });
    await initDB();
  }
  return pool;
}

async function initDB() {
  const conn = await pool.getConnection();
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS traffic_zones (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      centerLatitude DECIMAL(10,7) NOT NULL,
      centerLongitude DECIMAL(10,7) NOT NULL,
      radiusMeters DECIMAL(8,2) NOT NULL,
      currentDensity ENUM('LOW','MEDIUM','HIGH') DEFAULT 'LOW',
      isActive BOOLEAN DEFAULT TRUE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS traffic_measurements (
      id VARCHAR(36) PRIMARY KEY,
      zoneId VARCHAR(36) NOT NULL,
      vehicleCount INT NOT NULL,
      averageSpeed DECIMAL(5,2),
      density ENUM('LOW','MEDIUM','HIGH') NOT NULL,
      notes TEXT,
      measuredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (zoneId) REFERENCES traffic_zones(id) ON DELETE CASCADE
    )
  `);
  conn.release();
}

module.exports = { getPool };
