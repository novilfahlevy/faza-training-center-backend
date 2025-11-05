const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Pengguna = db.define('pengguna', {
  user_id: {
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
    type: DataTypes.ENUM('calon_peserta', 'admin', 'mitra'),
    allowNull: false,
  },
}, {
  tableName: 'pengguna',
  timestamps: false,
});

module.exports = Pengguna;