const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/main/profileController');
const { authMiddleware } = require('../../middleware/authMiddleware');

// Endpoint profil
router.get('/', authMiddleware, profileController.getProfile);
router.put('/email', authMiddleware, profileController.updateEmail);
router.put('/password', authMiddleware, profileController.updatePassword);

// Endpoint profil peserta
router.put('/', authMiddleware, profileController.updateProfilePeserta);

module.exports = router;