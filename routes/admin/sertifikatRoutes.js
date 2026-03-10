const express = require('express');
const router = express.Router();
const sertifikatController = require('../../controllers/admin/sertifikatController');
const { authMiddleware, adminMiddleware } = require('../../middleware/authMiddleware');

// Download single certificate
router.get('/:id/download', authMiddleware, adminMiddleware, sertifikatController.downloadCertificate);

// Download all certificates for a pelatihan (ZIP)
router.get('/pelatihan/:pelatihanId/download-all', authMiddleware, adminMiddleware, sertifikatController.downloadAllCertificates);

// Mark all 'terdaftar' peserta as attended and generate certificates
router.post('/pelatihan/:pelatihanId/mark-all-attended', authMiddleware, adminMiddleware, sertifikatController.markAllAttended);

module.exports = router;
