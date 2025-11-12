const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Endpoint untuk login dan register
router.post('/login', authController.login);
router.post('/peserta/login', authController.loginPeserta);
router.post('/register', authController.register); // Buka jika ingin registrasi publik

module.exports = router;