const mysql = require("mysql2/promise");

// Load environment variables with fallbacks
const {
  DB_HOST = "mysql-2003-sharnithadhandapani-d3a8.c.aivencloud.com",
  DB_PORT = 28177,
  DB_USER = "avnadmin",
  DB_PASSWORD = "AVNS_K6mIDQVbua-l8d_JvPy",
  DB_NAME = "defaultdb",
  DB_SSL = "false" // "true" if using Aiven or any SSL-required service
} = process.env;

// Create MySQL pool
const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  connectTimeout: 10000,
});

// Optional: Verify DB connection at startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL pool connected successfully");
    connection.release();
  } catch (err) {
    console.error("❌ Error connecting to MySQL pool:", err.message);
    process.exit(1); // Exit app if DB connection fails at startup
  }
})();

module.exports = pool;
