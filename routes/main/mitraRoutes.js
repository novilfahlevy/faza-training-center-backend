// /home/novilfahlevy/Projects/faza-training-center-backend/routes/main/mitraRoutes.js
const express = require('express');
const router = express.Router();
const mitraController = require('../../controllers/main/mitraController');

// GET - Daftar semua mitra (public)
router.get('/', mitraController.getAllMitra);

// GET - Detail mitra berdasarkan ID (public)
router.get('/:id', mitraController.getMitraById);

module.exports = router;
