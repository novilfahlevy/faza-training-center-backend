const express = require('express');
const router = express.Router();
const mitraController = require('../../controllers/admin/mitraController');
const { authMiddleware, adminMiddleware } = require('../../middleware/authMiddleware');

// Endpoint untuk mendapatkan opsi mitra (untuk dropdown/select)
router.get('/options', authMiddleware, adminMiddleware, mitraController.getMitraOptions);

module.exports = router;