// routes/pengguna.js
const express = require('express');
const router = express.Router();
const penggunaController = require('../controllers/penggunaController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Endpoint CRUD
router.post('/', penggunaController.createPengguna); // Hanya admin
router.get('/', penggunaController.getAllPengguna); // Hanya admin
router.get('/:id', penggunaController.getPenggunaById); // User bisa lihat profilnya sendiri
router.put('/:id', penggunaController.updatePengguna); // User bisa update profilnya sendiri
router.delete('/:id', penggunaController.deletePengguna); // Hanya admin

module.exports = router;