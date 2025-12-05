// /home/novilfahlevy/Projects/faza-training-center-backend/controllers/admin/editorImageController.js
const { EditorImage } = require("../../models");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Env = require("../../config/env");

// Direktori untuk menyimpan gambar editor
const editorImagesDir = path.join(__dirname, "../../uploads/editor_images");

// Pastikan direktori ada
if (!fs.existsSync(editorImagesDir)) {
  fs.mkdirSync(editorImagesDir, { recursive: true });
}

// Konfigurasi Multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, editorImagesDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `editor_${uniqueSuffix}${ext}`);
  },
});

// Filter file untuk hanya menerima gambar
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak didukung. Hanya gambar (JPEG, PNG, GIF, WebP) yang diperbolehkan.'), false);
  }
};

// Batas ukuran file (5MB)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * Upload gambar dari React Quill editor
 * POST /admin/editor-images/upload
 */
exports.uploadImage = [
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Tidak ada file yang diunggah",
        });
      }

      const url = `/uploads/editor_images/${req.file.filename}`;

      // Simpan ke database
      const editorImage = await EditorImage.create({
        filename: req.file.filename,
        original_filename: req.file.originalname,
        url,
        mimetype: req.file.mimetype,
        size: req.file.size,
        pengguna_id: req.user?.pengguna_id || null,
      });

      // Generate full URL
      const fullUrl = `${Env.APP_URL.replace(/\/$/, "")}${url}`;

      res.status(200).json({
        success: true,
        message: "Gambar berhasil diunggah",
        data: {
          image_id: editorImage.image_id,
          url: fullUrl,
          filename: editorImage.filename,
          original_filename: editorImage.original_filename,
        },
      });
    } catch (error) {
      console.error("❌ Error upload editor image:", error);
      
      // Hapus file jika ada error
      if (req.file) {
        const filePath = path.join(editorImagesDir, req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.status(500).json({
        success: false,
        message: "Gagal mengunggah gambar",
        error: error.message,
      });
    }
  },
];

/**
 * Get semua gambar yang di-upload oleh pengguna tertentu
 * GET /admin/editor-images
 */
exports.getImages = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: images } = await EditorImage.findAndCountAll({
      where: req.user?.pengguna_id ? { pengguna_id: req.user.pengguna_id } : {},
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const imagesWithFullUrl = images.map(image => ({
      ...image.toJSON(),
      url: `${Env.APP_URL.replace(/\/$/, "")}${image.url}`,
    }));

    res.status(200).json({
      success: true,
      message: "Berhasil mengambil daftar gambar",
      data: {
        images: imagesWithFullUrl,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error get editor images:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar gambar",
      error: error.message,
    });
  }
};

/**
 * Hapus gambar berdasarkan ID
 * DELETE /admin/editor-images/:id
 */
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await EditorImage.findByPk(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Gambar tidak ditemukan",
      });
    }

    // Hapus file dari storage
    const filePath = path.join(editorImagesDir, image.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Hapus dari database
    await image.destroy();

    res.status(200).json({
      success: true,
      message: "Gambar berhasil dihapus",
    });
  } catch (error) {
    console.error("❌ Error delete editor image:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus gambar",
      error: error.message,
    });
  }
};
