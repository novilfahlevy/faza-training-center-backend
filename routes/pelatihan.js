const express = require('express');
const router = express.Router();
const pelatihanController = require('../controllers/pelatihanController'); // 🔹 Impor controller baru
const pesertaPelatihanController = require('../controllers/pesertaPelatihanController'); // 🔹 Impor controller pendaftaran
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// --- Endpoint CRUD Pelatihan (untuk admin) ---
router.post('/', authMiddleware, adminMiddleware, pelatihanController.createPelatihan);
router.get('/', pelatihanController.getAllPelatihan); // 🔹 Endpoint publik untuk daftar pelatihan
router.get('/:id', pelatihanController.getPelatihanById); // 🔹 Endpoint publik untuk detail pelatihan
router.put('/:id', authMiddleware, adminMiddleware, pelatihanController.updatePelatihan);
router.delete('/:id', authMiddleware, adminMiddleware, pelatihanController.deletePelatihan);

// --- Endpoint untuk Manajemen Pendaftaran (untuk peserta & admin) ---
// Peserta mendaftar ke pelatihan
router.post('/:pelatihanId/register', authMiddleware, pesertaPelatihanController.registerForTraining);
// Peserta membatalkan pendaftaran
router.delete('/:pelatihanId/register', authMiddleware, pesertaPelatihanController.cancelRegistration);
// Admin melihat semua peserta di sebuah pelatihan
router.get('/:pelatihanId/peserta', authMiddleware, adminMiddleware, pesertaPelatihanController.getTrainingParticipants);

// Route upload thumbnail
router.post('/upload-thumbnail', pelatihanController.uploadThumbnail);

module.exports = router;