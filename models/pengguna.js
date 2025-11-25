const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Pengguna = db.define('pengguna', {
  pengguna_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'mitra', 'peserta'),
    allowNull: false,
  },
  // 🔹 Tambahkan kolom untuk verifikasi email
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Default belum terverifikasi
    allowNull: false,
  },
  email_verification_token: {
    type: DataTypes.STRING,
    allowNull: true, // Boleh null setelah verifikasi berhasil
  },
  verified_at: { // Opsional: untuk mencatat waktu verifikasi
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'pengguna',
  timestamps: false,
});

module.exports = Pengguna;