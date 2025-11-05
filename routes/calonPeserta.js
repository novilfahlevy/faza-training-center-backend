// routes/calonPeserta.js
const express = require('express');
const router = express.Router();
const calonPesertaController = require('../controllers/calonPesertaController');
const pesertaPelatihanController = require('../controllers/pesertaPelatihanController'); // Impor controller baru
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// --- Endpoint CRUD Calon Peserta (tetap sama) ---
router.post('/', authMiddleware, adminMiddleware, calonPesertaController.createCalonPeserta);
router.get('/', authMiddleware, adminMiddleware, calonPesertaController.getAllCalonPeserta);
router.get('/:id', authMiddleware, calonPesertaController.getCalonPesertaById);
router.put('/:id', authMiddleware, calonPesertaController.updateCalonPeserta);
router.delete('/:id', authMiddleware, adminMiddleware, calonPesertaController.deleteCalonPeserta);

// --- Endpoint Baru untuk Riwayat Pendaftaran ---
router.get('/registrasi-saya', authMiddleware, pesertaPelatihanController.getUserRegistrations);

module.exports = router;