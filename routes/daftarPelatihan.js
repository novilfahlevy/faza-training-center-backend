// routes/daftarPelatihan.js
const express = require('express');
const router = express.Router();
const daftarPelatihanController = require('../controllers/daftarPelatihanController');
const pesertaPelatihanController = require('../controllers/pesertaPelatihanController'); // Impor controller baru
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// --- Endpoint CRUD Pelatihan (tetap sama) ---
router.post('/', daftarPelatihanController.createPelatihan);
router.get('/', daftarPelatihanController.getAllPelatihan);
router.get('/:id', daftarPelatihanController.getPelatihanById);
router.put('/:id', daftarPelatihanController.updatePelatihan);
router.delete('/:id', daftarPelatihanController.deletePelatihan);

// --- Endpoint Baru untuk Manajemen Pendaftaran ---
router.post('/:pelatihanId/register', pesertaPelatihanController.registerForTraining);
router.delete('/:pelatihanId/register', pesertaPelatihanController.cancelRegistration);
router.get('/:pelatihanId/peserta', pesertaPelatihanController.getTrainingParticipants);

module.exports = router;