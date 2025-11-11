// routes/laporanKegiatan.js
const express = require('express');
const router = express.Router();
const laporanKegiatanController = require('../controllers/laporanKegiatanController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Endpoint CRUD
router.post('/', authMiddleware, laporanKegiatanController.createLaporan);
router.get('/', authMiddleware, laporanKegiatanController.getAllLaporan);
router.get('/:id', authMiddleware, laporanKegiatanController.getLaporanById);
router.put('/:id', authMiddleware, laporanKegiatanController.updateLaporan);
router.delete('/:id', authMiddleware, laporanKegiatanController.deleteLaporan);

module.exports = router;