// routes/mitra.js
const express = require('express');
const router = express.Router();
const mitraController = require('../controllers/mitraController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Endpoint CRUD
router.post('/', authMiddleware, adminMiddleware, mitraController.createMitra);
router.get('/', authMiddleware, adminMiddleware, mitraController.getAllMitra);
router.get('/:id', authMiddleware, mitraController.getMitraById);
router.put('/:id', authMiddleware, adminMiddleware, mitraController.updateMitra);
router.delete('/:id', authMiddleware, adminMiddleware, mitraController.deleteMitra);

module.exports = router;