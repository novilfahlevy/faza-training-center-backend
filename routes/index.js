const express = require('express');
const router = express.Router();

// Import semua route
const penggunaRoutes = require('./pengguna');
const calonPesertaRoutes = require('./calonPeserta');
const mitraRoutes = require('./mitra');
const daftarPelatihanRoutes = require('./daftarPelatihan');
const laporanKegiatanRoutes = require('./laporanKegiatan');
const authRoutes = require('./auth'); // Asumsikan ada route untuk login

// Gunakan route
router.use('/pengguna', penggunaRoutes);
router.use('/calon-peserta', calonPesertaRoutes);
router.use('/mitra', mitraRoutes);
router.use('/pelatihan', daftarPelatihanRoutes);
router.use('/laporan', laporanKegiatanRoutes);
router.use('/auth', authRoutes);

module.exports = router;