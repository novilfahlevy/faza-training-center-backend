const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Sertifikat = db.define('sertifikat', {
  sertifikat_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  peserta_pelatihan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  nomor_sertifikat: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issued_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'sertifikat',
  timestamps: false,
});

module.exports = Sertifikat;
