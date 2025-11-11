const { DataTypes } = require('sequelize');
const db = require('../config/database');
const Pengguna = require('./pengguna');

const DataPeserta = db.define('data_peserta', { // 🔹 Nama model dan tabel diubah
  data_peserta_id: { // 🔹 Primary key diubah
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  no_telp: { type: DataTypes.STRING },
  nama_lengkap: { type: DataTypes.STRING },
  tempat_lahir: { type: DataTypes.STRING },
  tanggal_lahir: { type: DataTypes.DATEONLY },
  jenis_kelamin: { type: DataTypes.ENUM('L', 'P') },
  alamat: { type: DataTypes.TEXT },
  profesi: { type: DataTypes.STRING },
  instansi: { type: DataTypes.STRING },
  no_reg_kes: { type: DataTypes.STRING },
  pengguna_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // 🔹 Pastikan satu data_peserta hanya untuk satu pengguna
    references: {
      model: Pengguna,
      key: 'pengguna_id',
    },
  },
}, {
  tableName: 'data_peserta', // 🔹 Nama tabel diubah
  timestamps: false,
});

module.exports = DataPeserta;