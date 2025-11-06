const { Sequelize } = require('sequelize');
const fs = require('fs');
const Env = require('./env');
require('dotenv').config();

const config = {
  host: Env.DB_HOST,
  port: Env.DB_PORT || 3360,
  dialect: 'mysql',
  logging: false
};

const caCert = fs.readFileSync(Env.DB_SSL_CA);

if (caCert) {
  config.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: true,
      ca: caCert
    }
  };
}

const db = new Sequelize(Env.DB_NAME, Env.DB_USER, Env.DB_PASSWORD, config);

module.exports = db;