const express = require('express');
const router = express.Router();
const penggunaController = require('../../controllers/admin/penggunaController');
const { authMiddleware, adminMiddleware } = require('../../middleware/authMiddleware');

// Endpoint CRUD Pengguna
router.post('/', authMiddleware, adminMiddleware, penggunaController.createPengguna);
router.get('/', authMiddleware, adminMiddleware, penggunaController.getAllPengguna);
router.get('/:id', authMiddleware, adminMiddleware, penggunaController.getPenggunaById);
router.put('/:id', authMiddleware, adminMiddleware, penggunaController.updatePengguna);
router.delete('/:id', authMiddleware, adminMiddleware, penggunaController.deletePengguna);

// Upload logo mitra
router.post('/upload-logo', authMiddleware, adminMiddleware, penggunaController.uploadMitraLogo);

module.exports = router;
