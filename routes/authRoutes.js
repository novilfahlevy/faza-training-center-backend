// /home/novilfahlevy/Projects/faza-training-center-backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Endpoint untuk login dan register
router.post('/admin/login', authController.login);
router.post('/login', authController.loginPeserta);
router.post('/register', authController.register);

module.exports = router;