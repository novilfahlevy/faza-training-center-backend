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

Pengguna.hasOne(CalonPeserta, { foreignKey: 'user_id' });
CalonPeserta.belongsTo(Pengguna, { foreignKey: 'user_id' });

const DaftarPelatihan = require('./daftarPelatihan');

// Definisikan relasi many-to-many
CalonPeserta.belongsToMany(DaftarPelatihan, {
  through: 'peserta_pelatihan',
  foreignKey: 'peserta_id',
  otherKey: 'pelatihan_id',
  as: 'pelatihan_diikuti', // Alias untuk relasi ini
});

DaftarPelatihan.belongsToMany(CalonPeserta, {
  through: 'peserta_pelatihan',
  foreignKey: 'pelatihan_id',
  otherKey: 'peserta_id',
  as: 'peserta_terdaftar', // Alias untuk relasi ini
});

module.exports = CalonPeserta;