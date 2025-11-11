const { DataTypes } = require('sequelize');
const db = require('../config/database');

const PesertaPelatihan = db.define('peserta_pelatihan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  pelatihan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pengguna_id: { // 🔹 Merujuk langsung ke tabel pengguna
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tanggal_pendaftaran: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status_pendaftaran: {
    type: DataTypes.ENUM('terdaftar', 'dibatalkan', 'selesai'),
    allowNull: false,
    defaultValue: 'terdaftar',
  },
}, {
  tableName: 'peserta_pelatihan',
  timestamps: false,
});

module.exports = PesertaPelatihan;