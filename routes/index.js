// /home/novilfahlevy/Projects/faza-training-center-backend/routes/index.js
const express = require('express');
const router = express.Router();

// Import semua route
const authRoutes = require('./authRoutes');
const adminPenggunaRoutes = require('./admin/penggunaRoutes');
const adminPelatihanRoutes = require('./admin/pelatihanRoutes');
const adminMitraRoutes = require('./admin/mitraRoutes');
const adminDashboardRoutes = require('./admin/dashboardRoutes');
const adminLaporanKegiatanRoutes = require('./admin/laporanKegiatanRoutes');
const adminEditorImageRoutes = require('./admin/editorImageRoutes');
const adminProfileRoutes = require('./admin/profileRoutes');
const mainProfileRoutes = require('./main/profileRoutes');
const mainPelatihanRoutes = require('./main/pelatihanRoutes');

// Gunakan route dengan prefix masing-masing
router.use('/auth', authRoutes);
router.use('/admin/pengguna', adminPenggunaRoutes);
router.use('/admin/pelatihan', adminPelatihanRoutes);
router.use('/admin/mitra', adminMitraRoutes);
router.use('/admin/dashboard', adminDashboardRoutes);
router.use('/admin/laporan-kegiatan', adminLaporanKegiatanRoutes);
router.use('/admin/editor-images', adminEditorImageRoutes);
router.use('/admin/profile', adminProfileRoutes);
router.use('/profile', mainProfileRoutes);
router.use('/pelatihan', mainPelatihanRoutes);

module.exports = router;