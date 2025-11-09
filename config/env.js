require('dotenv').config();

class Env {
  static get(key, defaultValue = null) {
    const value = process.env[key];
    return value !== undefined ? value : defaultValue;
  }

  static get NODE_ENV() {
    return this.get('NODE_ENV', 'development');
  }

  static get APP_URL() {
    return this.get('APP_URL', `http://localhost:${Env.PORT || 3000}`);
  }

  static get PORT() {
    return parseInt(this.get('PORT', '3000'), 10);
  }

  static get DB_HOST() {
    return this.get('DB_HOST');
  }

  static get DB_PORT() {
    return parseInt(this.get('DB_PORT', '3306'), 10);
  }

  static get DB_NAME() {
    return this.get('DB_NAME');
  }

  static get DB_USER() {
    return this.get('DB_USER');
  }

  static get DB_PASSWORD() {
    return this.get('DB_PASSWORD');
  }

  static get DB_SSL_CA_PATH() {
    return this.get('DB_SSL_CA_PATH');
  }

  static get DB_SSL_CA() {
    return this.get('DB_SSL_CA');
  }
}

module.exports = Env;