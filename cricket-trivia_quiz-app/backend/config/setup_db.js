const pool = require("./db");

(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          user_id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(50) UNIQUE NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_scores (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT,
          category VARCHAR(50),
          score INT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id)
      );
    `);

    console.log("✅ Database tables initialized!");
  } catch (err) {
    console.error("🔥 Error setting up database:", err.message);
  }
})();
