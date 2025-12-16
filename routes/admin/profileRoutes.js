const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/admin/profileController');
const { authMiddleware } = require('../../middleware/authMiddleware');

// Endpoint profil untuk admin dan mitra
router.get('/', authMiddleware, profileController.getProfile);
router.put('/email', authMiddleware, profileController.updateEmail);
router.put('/password', authMiddleware, profileController.updatePassword);
router.put('/mitra', authMiddleware, profileController.updateMitra);

module.exports = router;
