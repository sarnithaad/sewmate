const mysql = require("mysql2/promise");

// Load environment variables with fallbacks
const {
  DB_HOST = "localhost",
  DB_PORT = 3306,
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "sewmate",
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
