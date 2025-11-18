const { DataTypes } = require('sequelize');
const db = require('../config/database');
const Pengguna = require('./pengguna'); // 🔹 Impor Pengguna, bukan DataMitra

const Pelatihan = db.define('pelatihan', { // 🔹 Nama model dan tabel diubah
  pelatihan_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  thumbnail_url: { type: DataTypes.STRING },
  nama_pelatihan: { type: DataTypes.STRING },
  slug_pelatihan: { type: DataTypes.STRING },
  deskripsi_pelatihan: { type: DataTypes.TEXT },
  tanggal_pelatihan: { type: DataTypes.DATE },
  durasi_pelatihan: { type: DataTypes.STRING },
  lokasi_pelatihan: { type: DataTypes.STRING },
  biaya: { 
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  daring: { 
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  link_daring: { 
    type: DataTypes.STRING,
    allowNull: true
  },
  nomor_rekening: { 
    type: DataTypes.STRING,
    allowNull: true
  },
  nama_bank: { 
    type: DataTypes.STRING,
    allowNull: true
  },
  mitra_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { // 🔹 Referensi ke tabel pengguna
      model: Pengguna,
      key: 'pengguna_id',
    },
  },
}, {
  tableName: 'pelatihan', // 🔹 Nama tabel diubah
  timestamps: false,
});

module.exports = Pelatihan;