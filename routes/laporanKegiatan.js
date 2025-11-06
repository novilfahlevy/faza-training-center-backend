// routes/laporanKegiatan.js
const express = require('express');
const router = express.Router();
const laporanKegiatanController = require('../controllers/laporanKegiatanController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Endpoint CRUD
router.post('/', laporanKegiatanController.createLaporan);
router.get('/', laporanKegiatanController.getAllLaporan);
router.get('/:id', laporanKegiatanController.getLaporanById);
router.put('/:id', laporanKegiatanController.updateLaporan);
router.delete('/:id', laporanKegiatanController.deleteLaporan);

module.exports = router;