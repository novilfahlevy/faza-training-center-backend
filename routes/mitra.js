// routes/mitra.js
const express = require('express');
const router = express.Router();
const mitraController = require('../controllers/mitraController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Endpoint CRUD
router.post('/', mitraController.createMitra);
router.get('/', mitraController.getAllMitra);
router.get('/:id', mitraController.getMitraById);
router.put('/:id', mitraController.updateMitra);
router.delete('/:id', mitraController.deleteMitra);

module.exports = router;