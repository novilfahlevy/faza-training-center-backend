// /home/novilfahlevy/Projects/faza-training-center-backend/routes/main/pelatihanRoutes.js
const express = require('express');
const router = express.Router();
const pelatihanController = require('../../controllers/main/pelatihanControlller');
const { authMiddleware } = require('../../middleware/authMiddleware');

// Endpoint publik untuk melihat pelatihan
router.get('/', pelatihanController.getAllPelatihan);
router.get('/:slug', pelatihanController.getPelatihanBySlug);

// Endpoint untuk pendaftaran pelatihan
router.get('/:slug/status', authMiddleware, pelatihanController.checkRegistrationStatus);
router.post('/:slug/register', authMiddleware, pelatihanController.registerForTraining);
router.delete('/:slug/register', authMiddleware, pelatihanController.cancelRegistration);

// Endpoint untuk riwayat pelatihan
router.get('/riwayat', authMiddleware, pelatihanController.getTrainingHistory);

module.exports = router;