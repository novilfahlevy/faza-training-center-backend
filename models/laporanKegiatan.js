const { DataTypes } = require('sequelize');
const db = require('../config/database');
const Pengguna = require('./pengguna');

const LaporanKegiatan = db.define('laporan_kegiatan', {
  laporan_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  judul_laporan: { type: DataTypes.STRING },
  isi_laporan: { type: DataTypes.TEXT },
  tanggal_laporan: { type: DataTypes.DATEONLY },
  user_uploader_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Pengguna,
      key: 'user_id',
    },
  },
}, {
  tableName: 'laporan_kegiatan',
  timestamps: false,
});

Pengguna.hasMany(LaporanKegiatan, { foreignKey: 'user_uploader_id' });
LaporanKegiatan.belongsTo(Pengguna, { foreignKey: 'user_uploader_id', as: 'uploader' });

module.exports = LaporanKegiatan;