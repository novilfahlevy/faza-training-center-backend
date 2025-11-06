const { Sequelize } = require('sequelize');
const fs = require('fs');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3360,
  dialect: 'mysql',
  logging: false
};

const caCert = fs.readFileSync(process.env.DB_SSL_CA);

if (caCert) {
  config.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: true,
      ca: caCert
    }
  };
}

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, config);

module.exports = db;