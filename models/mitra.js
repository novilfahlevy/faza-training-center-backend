const { DataTypes } = require('sequelize');
const db = require('../config/database');
const Pengguna = require('./pengguna');

const Mitra = db.define('mitra', {
  mitra_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama_mitra: { type: DataTypes.STRING },
  deskripsi_mitra: { type: DataTypes.TEXT },
  alamat_mitra: { type: DataTypes.STRING },
  telepon_mitra: { type: DataTypes.STRING },
  email_mitra: { type: DataTypes.STRING },
  website_mitra: { type: DataTypes.STRING },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Pengguna,
      key: 'user_id',
    },
  },
}, {
  tableName: 'mitra',
  timestamps: false,
});

module.exports = Mitra;