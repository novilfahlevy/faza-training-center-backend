const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/main/profileController');
const adminProfileController = require('../../controllers/admin/profileController'); // ← TAMBAH INI
const { authMiddleware } = require('../../middleware/authMiddleware');

// Endpoint profil
router.get('/', authMiddleware, profileController.getProfile);
router.put('/email', authMiddleware, profileController.updateEmail);
router.put('/password', authMiddleware, profileController.updatePassword);

// Endpoint profil peserta
router.put('/', authMiddleware, profileController.updateProfilePeserta);

// Endpoint platform settings (public - untuk halaman kontak)
router.get('/settings', adminProfileController.getPlatformSettings); // ← TAMBAH INI

module.exports = router;