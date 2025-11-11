const { Sequelize } = require('sequelize');
const fs = require('fs');
const Env = require('./env');

const config = {
  host: Env.DB_HOST,
  port: Env.DB_PORT || 3360,
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  logging: false
};

const caCert = Env.DB_SSL_CA
  ? Buffer.from(Env.DB_SSL_CA, 'base64').toString('utf-8')
  : (Env.DB_SSL_CA_PATH ? fs.readFileSync(Env.DB_SSL_CA_PATH, 'utf8') : null);

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