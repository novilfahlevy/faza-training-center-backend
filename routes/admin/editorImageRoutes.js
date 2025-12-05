// /home/novilfahlevy/Projects/faza-training-center-backend/routes/admin/editorImageRoutes.js
const express = require('express');
const router = express.Router();
const editorImageController = require('../../controllers/admin/editorImageController');
const { authMiddleware, adminMiddleware } = require('../../middleware/authMiddleware');

// Upload gambar dari React Quill editor
// POST /admin/editor-images/upload
router.post(
  '/upload',
  authMiddleware,
  adminMiddleware,
  editorImageController.uploadImage
);

// Get semua gambar yang di-upload
// GET /admin/editor-images
router.get(
  '/',
  authMiddleware,
  adminMiddleware,
  editorImageController.getImages
);

// Hapus gambar berdasarkan ID
// DELETE /admin/editor-images/:id
router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  editorImageController.deleteImage
);

module.exports = router;
