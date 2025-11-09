const db = require('../config/database');

const Pengguna = require('./pengguna');
const CalonPeserta = require('./calonPeserta');
const Mitra = require('./mitra');
const DaftarPelatihan = require('./daftarPelatihan');
const LaporanKegiatan = require('./laporanKegiatan');
const PesertaPelatihan = require('./pesertaPelatihan');
const ThumbnailTemporary = require('./thumbnailTemporary');

/* =========================
 *  RELASI ANTAR MODEL
 * ========================= */

// --- 1. Relasi Pengguna dengan Mitra dan CalonPeserta ---
Pengguna.hasOne(Mitra, { foreignKey: 'user_id', as: 'mitra' });
Mitra.belongsTo(Pengguna, { foreignKey: 'user_id', as: 'pengguna' });

Pengguna.hasOne(CalonPeserta, { foreignKey: 'user_id', as: 'calon_peserta' });
CalonPeserta.belongsTo(Pengguna, { foreignKey: 'user_id', as: 'pengguna' });

// --- 2. Relasi Mitra dengan DaftarPelatihan ---
Mitra.hasMany(DaftarPelatihan, { foreignKey: 'mitra_id', as: 'pelatihan_dibuat' });
DaftarPelatihan.belongsTo(Mitra, { foreignKey: 'mitra_id', as: 'mitra' });

// --- 3. Relasi Pengguna dengan LaporanKegiatan ---
Pengguna.hasMany(LaporanKegiatan, { foreignKey: 'user_uploader_id', as: 'laporan_diupload' });
LaporanKegiatan.belongsTo(Pengguna, { foreignKey: 'user_uploader_id', as: 'uploader' });

// --- 4. Relasi Many-to-Many antara CalonPeserta dan DaftarPelatihan melalui PesertaPelatihan ---
CalonPeserta.belongsToMany(DaftarPelatihan, {
  through: PesertaPelatihan,
  foreignKey: 'peserta_id',
  otherKey: 'pelatihan_id',
  as: 'pelatihan_diikuti',
});

DaftarPelatihan.belongsToMany(CalonPeserta, {
  through: PesertaPelatihan,
  foreignKey: 'pelatihan_id',
  otherKey: 'peserta_id',
  as: 'peserta_terdaftar',
});

// --- 5. Relasi langsung ke tabel penghubung (PesertaPelatihan) ---
CalonPeserta.hasMany(PesertaPelatihan, { foreignKey: 'peserta_id', as: 'pendaftaran_pelatihan' });
PesertaPelatihan.belongsTo(CalonPeserta, { foreignKey: 'peserta_id', as: 'peserta' });

DaftarPelatihan.hasMany(PesertaPelatihan, { foreignKey: 'pelatihan_id', as: 'pendaftaran_peserta' });
PesertaPelatihan.belongsTo(DaftarPelatihan, { foreignKey: 'pelatihan_id', as: 'pelatihan' });

/* =========================
 *  EXPORT SEMUA MODEL
 * ========================= */
module.exports = {
  db,
  Pengguna,
  CalonPeserta,
  Mitra,
  DaftarPelatihan,
  LaporanKegiatan,
  PesertaPelatihan,
  ThumbnailTemporary,
};