const { DataTypes } = require('sequelize');
const db = require('../config/database');
const Mitra = require('./mitra');

const DaftarPelatihan = db.define('daftar_pelatihan', {
  pelatihan_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama_pelatihan: { type: DataTypes.STRING },
  deskripsi_pelatihan: { type: DataTypes.TEXT },
  tanggal_pelatihan: { type: DataTypes.DATE },
  durasi_pelatihan: { type: DataTypes.STRING },
  lokasi_pelatihan: { type: DataTypes.STRING },
  mitra_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Bisa null jika diselenggarakan sendiri oleh FTC
    references: {
      model: Mitra,
      key: 'mitra_id',
    },
  },
}, {
  tableName: 'daftar_pelatihan',
  timestamps: false,
});

module.exports = DaftarPelatihan;