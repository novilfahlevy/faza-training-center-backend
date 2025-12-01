// /home/novilfahlevy/Projects/faza-training-center-backend/models/index.js
const db = require('../config/database');

// 🔹 Impor semua model yang baru/direvisi
const Pengguna = require('./pengguna');
const DataPeserta = require('./dataPeserta');
const DataMitra = require('./dataMitra');
const Pelatihan = require('./pelatihan');
const LaporanKegiatan = require('./laporanKegiatan');
const PesertaPelatihan = require('./pesertaPelatihan');
const ThumbnailTemporary = require('./thumbnailTemporary');
const PelatihanMitra = require('./pelatihanMitra'); // Tambahkan model baru

// 🔹 Definisikan semua asosiasi

// --- Asosiasi One-to-One ---
// Satu Pengguna memiliki satu DataPeserta
Pengguna.hasOne(DataPeserta, {
  foreignKey: 'pengguna_id',
  as: 'data_peserta' // Alias untuk akses: pengguna.getDataPeserta()
});
DataPeserta.belongsTo(Pengguna, {
  foreignKey: 'pengguna_id',
  as: 'pengguna'
});

// Satu Pengguna memiliki satu DataMitra
Pengguna.hasOne(DataMitra, {
  foreignKey: 'pengguna_id',
  as: 'data_mitra' // Alias untuk akses: pengguna.getDataMitra()
});
DataMitra.belongsTo(Pengguna, {
  foreignKey: 'pengguna_id',
  as: 'pengguna'
});

// --- Asosiasi One-to-Many ---
// Satu Pengguna bisa meng-upload banyak LaporanKegiatan
Pengguna.hasMany(LaporanKegiatan, {
  foreignKey: 'pengguna_id',
  as: 'laporan_kegiatan' // Alias: pengguna.getLaporanKegiatan()
});

// Satu LaporanKegiatan di-upload oleh satu Pengguna
LaporanKegiatan.belongsTo(Pengguna, {
  foreignKey: 'pengguna_id',
  as: 'uploader' // Alias: laporanKegiatan.getUploader()
});

// --- Asosiasi Many-to-Many ---
// Satu Pengguna (sebagai peserta) bisa mendaftar ke banyak Pelatihan
Pengguna.belongsToMany(Pelatihan, {
  through: PesertaPelatihan,
  foreignKey: 'pengguna_id',
  otherKey: 'pelatihan_id',
  as: 'pelatihan_diikuti' // Alias: pengguna.getPelatihanDiikuti()
});

// Satu Pelatihan bisa diikuti oleh banyak Pengguna (peserta)
Pelatihan.belongsToMany(Pengguna, {
  through: PesertaPelatihan,
  foreignKey: 'pelatihan_id',
  otherKey: 'pengguna_id',
  as: 'peserta_terdaftar' // Alias: pelatihan.getPesertaTerdaftar()
});

// --- Asosiasi Many-to-Many untuk Mitra ---
// Satu Pelatihan bisa memiliki banyak Mitra
Pelatihan.belongsToMany(Pengguna, {
  through: PelatihanMitra,
  foreignKey: 'pelatihan_id',
  otherKey: 'pengguna_id',
  as: 'mitra_pelatihan' // Alias: pelatihan.getMitraPelatihan()
});

// Satu Pengguna (sebagai mitra) bisa terlibat dalam banyak Pelatihan
Pengguna.belongsToMany(Pelatihan, {
  through: PelatihanMitra,
  foreignKey: 'pengguna_id',
  otherKey: 'pelatihan_id',
  as: 'pelatihan_sebagai_mitra' // 🔹 PERBAIKAN: Ubah alias agar unik
});

// Asosiasi untuk tabel junction
PelatihanMitra.belongsTo(Pelatihan, {
  foreignKey: 'pelatihan_id',
  as: 'pelatihan'
});

PelatihanMitra.belongsTo(Pengguna, {
  foreignKey: 'pengguna_id',
  as: 'pengguna'
});

PesertaPelatihan.belongsTo(Pengguna, {
  foreignKey: 'pengguna_id',
  otherKey: 'pengguna_id',
  as: 'peserta' // Alias: pesertaPelatihan.getPeserta()
})

PesertaPelatihan.belongsTo(Pelatihan, {
  foreignKey: 'pelatihan_id',
  otherKey: 'pelatihan_id',
  as: 'pelatihan' // Alias: pesertaPelatihan.getPelatihan()
})

// Sinkronisasi database (buat tabel jika belum ada)
// db.sync({ alter: true });

module.exports = {
  db,
  Pengguna,
  DataPeserta,
  DataMitra,
  Pelatihan,
  LaporanKegiatan,
  PesertaPelatihan,
  ThumbnailTemporary,
  PelatihanMitra // Tambahkan model baru ke ekspor
};