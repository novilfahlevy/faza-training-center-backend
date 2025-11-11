// routes/pengguna.js
const express = require('express');
const router = express.Router();
const penggunaController = require('../controllers/penggunaController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Endpoint CRUD
router.post('/', authMiddleware, adminMiddleware, penggunaController.createPengguna); // Hanya admin
router.get('/', authMiddleware, adminMiddleware, penggunaController.getAllPengguna); // Hanya admin
router.get('/:id', authMiddleware, penggunaController.getPenggunaById); // User bisa lihat profilnya sendiri
router.put('/:id', authMiddleware, penggunaController.updatePengguna); // User bisa update profilnya sendiri
router.delete('/:id', authMiddleware, adminMiddleware, penggunaController.deletePengguna); // Hanya admin

module.exports = router;