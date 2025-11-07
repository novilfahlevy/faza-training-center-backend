const { DataTypes } = require('sequelize');
const db = require('../config/database');
const Pengguna = require('./pengguna');

const CalonPeserta = db.define('calon_peserta', {
  peserta_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama_lengkap: { type: DataTypes.STRING },
  tempat_lahir: { type: DataTypes.STRING },
  tanggal_lahir: { type: DataTypes.DATEONLY },
  jenis_kelamin: { type: DataTypes.ENUM('L', 'P') },
  alamat: { type: DataTypes.TEXT },
  profesi: { type: DataTypes.STRING },
  instansi: { type: DataTypes.STRING },
  no_reg_kes: { type: DataTypes.STRING },
  no_telp: { type: DataTypes.STRING },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Pengguna,
      key: 'user_id',
    },
  },
}, {
  tableName: 'calon_peserta',
  timestamps: false,
});

module.exports = CalonPeserta;