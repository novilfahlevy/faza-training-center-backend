// config/config.js

module.exports = {
  development: {
    username: "root",
    password: "root",
    database: "faza_training_center",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    // CRITICAL FIX: Access process.env directly here
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    secure: false,
    dialect: "mysql",
    // Ensure you handle SSL if your production DB requires it
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};