const { DataTypes } = require('sequelize');
const db = require('../config/database');

const ThumbnailTemporary = db.define('daftar_pelatihan_thumbnail_temporary', {
  thumbnail_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'daftar_pelatihan_thumbnail_temporary',
  timestamps: false,
});

module.exports = ThumbnailTemporary;
