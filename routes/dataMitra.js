const express = require('express');
const router = express.Router();
const dataMitraController = require('../controllers/dataMitraController'); // 🔹 Impor controller baru
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// --- Endpoint CRUD Data Mitra (untuk admin) ---
router.post('/', authMiddleware, adminMiddleware, dataMitraController.createDataMitra);
router.get('/', authMiddleware, adminMiddleware, dataMitraController.getAllDataMitra);
router.get('/:id', authMiddleware, adminMiddleware, dataMitraController.getDataMitraById);
router.put('/:id', authMiddleware, adminMiddleware, dataMitraController.updateDataMitra);
router.delete('/:id', authMiddleware, adminMiddleware, dataMitraController.deleteDataMitra);

module.exports = router;