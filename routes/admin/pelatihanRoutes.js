const express = require('express');
const router = express.Router();
const pelatihanController = require('../../controllers/admin/pelatihanController');
const { authMiddleware, adminMiddleware } = require('../../middleware/authMiddleware');

// Endpoint CRUD Pelatihan
router.get('/', authMiddleware, adminMiddleware, pelatihanController.getAllPelatihan);
router.get('/:id', authMiddleware, adminMiddleware, pelatihanController.getPelatihanById);
router.post('/', authMiddleware, adminMiddleware, pelatihanController.createPelatihan);
router.put('/:id', authMiddleware, adminMiddleware, pelatihanController.updatePelatihan);
router.delete('/:id', authMiddleware, adminMiddleware, pelatihanController.deletePelatihan);

// Endpoint untuk upload thumbnail
router.post('/upload-thumbnail', authMiddleware, adminMiddleware, pelatihanController.uploadThumbnail);

// Endpoint untuk manajemen peserta
router.get('/:pelatihanId/peserta', authMiddleware, adminMiddleware, pelatihanController.getPesertaPelatihan);
router.put('/peserta/:pesertaPelatihanId/status', authMiddleware, adminMiddleware, pelatihanController.updatePesertaStatus);

module.exports = router;