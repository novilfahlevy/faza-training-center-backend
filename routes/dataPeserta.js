const express = require('express');
const router = express.Router();
const dataPesertaController = require('../controllers/dataPesertaController'); // 🔹 Impor controller baru
const pesertaPelatihanController = require('../controllers/pesertaPelatihanController'); // 🔹 Impor controller pendaftaran
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// --- Endpoint CRUD Data Peserta (untuk admin) ---
router.post('/', authMiddleware, adminMiddleware, dataPesertaController.createDataPeserta);
router.get('/', authMiddleware, dataPesertaController.getDataPeserta);
router.put('/', authMiddleware, dataPesertaController.updateDataPeserta);
router.delete('/:id', authMiddleware, adminMiddleware, dataPesertaController.deleteDataPeserta);

// --- Endpoint untuk Peserta (setelah login) ---
router.get('/registrasi-saya', authMiddleware, pesertaPelatihanController.getUserRegistrations); // Peserta melihat riwayat pelatihan yang diikuti

module.exports = router;