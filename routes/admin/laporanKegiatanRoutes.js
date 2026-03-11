const express = require('express');
const router = express.Router();
const laporanKegiatanController = require('../../controllers/admin/laporanKegiatanController');
const { authMiddleware, adminMiddleware } = require('../../middleware/authMiddleware');

// Endpoint CRUD Laporan Kegiatan
router.get('/', authMiddleware, adminMiddleware, laporanKegiatanController.getAllLaporanKegiatan);
router.get('/stats', authMiddleware, adminMiddleware, laporanKegiatanController.getStatistics);
router.get('/:id/download-pdf', authMiddleware, adminMiddleware, laporanKegiatanController.downloadPdf);
router.get('/:id', authMiddleware, adminMiddleware, laporanKegiatanController.getLaporanKegiatanById);
router.post('/', authMiddleware, adminMiddleware, laporanKegiatanController.createLaporanKegiatan);
router.put('/:id', authMiddleware, adminMiddleware, laporanKegiatanController.updateLaporanKegiatan);
router.delete('/:id', authMiddleware, adminMiddleware, laporanKegiatanController.deleteLaporanKegiatan);

module.exports = router;