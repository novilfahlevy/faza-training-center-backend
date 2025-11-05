// models/index.js
const db = require('../config/database');
const Pengguna = require('./pengguna');
const CalonPeserta = require('./calonPeserta');
const Mitra = require('./mitra');
const DaftarPelatihan = require('./daftarPelatihan');
const LaporanKegiatan = require('./laporanKegiatan');
const PesertaPelatihan = require('./pesertaPelatihan'); // <-- Tambahkan ini

// Sinkronisasi database (buat tabel jika belum ada)
// db.sync({ alter: true });

module.exports = {
  db,
  Pengguna,
  CalonPeserta,
  Mitra,
  DaftarPelatihan,
  LaporanKegiatan,
  PesertaPelatihan, // <-- Tambahkan ini
};