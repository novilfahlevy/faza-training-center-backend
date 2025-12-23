const { DataTypes } = require('sequelize');
const db = require('../config/database');
const Pengguna = require('./pengguna');

const DataMitra = db.define('data_mitra', { // 🔹 Nama model dan tabel diubah
  mitra_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama_mitra: { type: DataTypes.STRING },
  deskripsi_mitra: { type: DataTypes.TEXT },
  visi_misi: { type: DataTypes.TEXT },
  alamat_mitra: { type: DataTypes.STRING },
  telepon_mitra: { type: DataTypes.STRING },
  website_mitra: { type: DataTypes.STRING },
  logo_mitra: { type: DataTypes.STRING },
  pengguna_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // 🔹 Pastikan satu data_mitra hanya untuk satu pengguna
    references: {
      model: Pengguna,
      key: 'pengguna_id',
    },
  },
}, {
  tableName: 'data_mitra', // 🔹 Nama tabel diubah
  timestamps: false,
});

module.exports = DataMitra;