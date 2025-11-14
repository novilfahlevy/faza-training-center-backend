const express = require('express');
const router = express.Router();
const pelatihanController = require('../controllers/pelatihanController'); // 🔹 Impor controller baru
const pesertaPelatihanController = require('../controllers/pesertaPelatihanController'); // 🔹 Impor controller pendaftaran
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// --- Endpoint CRUD Pelatihan (untuk admin) ---
router.post('/', authMiddleware, adminMiddleware, pelatihanController.createPelatihan);
router.get('/', pelatihanController.getAllPelatihan); // 🔹 Endpoint publik untuk daftar pelatihan
router.get('/:id', pelatihanController.getPelatihanById); // 🔹 Endpoint publik untuk detail pelatihan
router.get('/by-slug/:slug', pelatihanController.getPelatihanBySlug); // 🔹 Endpoint publik untuk detail pelatihan
router.put('/:id', authMiddleware, adminMiddleware, pelatihanController.updatePelatihan);
router.delete('/:id', authMiddleware, adminMiddleware, pelatihanController.deletePelatihan);
router.get('/:pelatihanId/peserta', authMiddleware, adminMiddleware, pesertaPelatihanController.getTrainingParticipants);

// --- Endpoint untuk Manajemen Pendaftaran (untuk peserta) ---
router.get('/:slug/register', authMiddleware, pesertaPelatihanController.getTrainingParticipant);
router.post('/:slug/register', authMiddleware, pesertaPelatihanController.registerForTraining);
router.delete('/:slug/register', authMiddleware, pesertaPelatihanController.cancelRegistration);
router.put(
  '/peserta/:pesertaPelatihanId/status',
  authMiddleware,
  adminMiddleware,
  pesertaPelatihanController.updatePesertaStatus
);

// Route upload thumbnail
router.post('/upload-thumbnail', pelatihanController.uploadThumbnail);

module.exports = router;