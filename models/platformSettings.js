const { DataTypes } = require('sequelize');
const db = require('../config/database');

const PlatformSettings = db.define('platform_settings', {
  setting_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  whatsapp_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'platform_settings',
  timestamps: false,
});

module.exports = PlatformSettings;
