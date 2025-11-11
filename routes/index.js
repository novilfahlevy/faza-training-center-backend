// routes/index.js
const express = require('express');
const router = express.Router();

// Import semua route
const authRoutes = require('./auth');
const penggunaRoutes = require('./pengguna');
const dataPesertaRoutes = require('./dataPeserta'); // 🔹 Nama route baru
const dataMitraRoutes = require('./dataMitra'); // 🔹 Nama route baru
const pelatihanRoutes = require('./pelatihan'); // 🔹 Nama route baru
const laporanKegiatanRoutes = require('./laporanKegiatan');

// Gunakan route dengan prefix masing-masing
router.use('/auth', authRoutes);
router.use('/pengguna', penggunaRoutes);
router.use('/data-peserta', dataPesertaRoutes); // 🔹 Prefix baru
router.use('/data-mitra', dataMitraRoutes); // 🔹 Prefix baru
router.use('/pelatihan', pelatihanRoutes); // 🔹 Prefix baru
router.use('/laporan', laporanKegiatanRoutes);

module.exports = router;