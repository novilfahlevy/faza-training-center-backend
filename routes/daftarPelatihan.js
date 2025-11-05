// routes/daftarPelatihan.js
const express = require('express');
const router = express.Router();
const daftarPelatihanController = require('../controllers/daftarPelatihanController');
const pesertaPelatihanController = require('../controllers/pesertaPelatihanController'); // Impor controller baru
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// --- Endpoint CRUD Pelatihan (tetap sama) ---
router.post('/', authMiddleware, adminMiddleware, daftarPelatihanController.createPelatihan);
router.get('/', daftarPelatihanController.getAllPelatihan);
router.get('/:id', daftarPelatihanController.getPelatihanById);
router.put('/:id', authMiddleware, adminMiddleware, daftarPelatihanController.updatePelatihan);
router.delete('/:id', authMiddleware, adminMiddleware, daftarPelatihanController.deletePelatihan);

// --- Endpoint Baru untuk Manajemen Pendaftaran ---
router.post('/:pelatihanId/register', authMiddleware, pesertaPelatihanController.registerForTraining);
router.delete('/:pelatihanId/register', authMiddleware, pesertaPelatihanController.cancelRegistration);
router.get('/:pelatihanId/peserta', authMiddleware, adminMiddleware, pesertaPelatihanController.getTrainingParticipants);

module.exports = router;