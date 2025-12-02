const express = require('express');
const router = express.Router();
const laporanKegiatanController = require('../../controllers/admin/laporanKegiatanController');
const { authMiddleware, adminMiddleware } = require('../../middleware/authMiddleware');

// Endpoint CRUD Laporan Kegiatan
router.get('/', authMiddleware, adminMiddleware, laporanKegiatanController.getAllLaporanKegiatan);
router.get('/:id', authMiddleware, adminMiddleware, laporanKegiatanController.getLaporanKegiatanById);
router.post('/', authMiddleware, adminMiddleware, laporanKegiatanController.createLaporanKegiatan);
router.put('/:id', authMiddleware, adminMiddleware, laporanKegiatanController.updateLaporanKegiatan);
router.delete('/:id', authMiddleware, adminMiddleware, laporanKegiatanController.deleteLaporanKegiatan);

module.exports = router;