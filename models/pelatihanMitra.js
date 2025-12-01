const { DataTypes } = require('sequelize');
const db = require('../config/database');

const PelatihanMitra = db.define('pelatihan_mitra', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  pelatihan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pelatihan',
      key: 'pelatihan_id',
    },
  },
  pengguna_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'pengguna',
      key: 'pengguna_id',
    },
  },
  role_mitra: {
    type: DataTypes.ENUM('pemateri', 'fasilitator', 'penyelenggara'),
    allowNull: false,
    defaultValue: 'pemateri',
  },
}, {
  tableName: 'pelatihan_mitra',
  timestamps: false,
});

module.exports = PelatihanMitra;