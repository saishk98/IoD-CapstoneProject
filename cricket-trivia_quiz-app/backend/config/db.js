const mysql = require("mysql2");
require("dotenv").config();

// ✅ Create MySQL Connection Pool with Promises
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "your_secure_password",
  database: process.env.DB_NAME || "cricket_quiz",
  waitForConnections: true,
  connectionLimit: 10, // ⬅ Limit connections for performance
  queueLimit: 0,
});

// ✅ Test Connection with Try/Catch for Better Error Handling
(async () => {
  try {
    const conn = await pool.promise().getConnection();
    console.log("✅ Database connected successfully!");
    conn.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

module.exports = pool.promise(); // ⬅ Return a promise-based connection
