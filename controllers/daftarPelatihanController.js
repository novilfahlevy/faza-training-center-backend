const { DaftarPelatihan, ThumbnailTemporary  } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const createSearchCondition = require('../utils/searchConditions');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Env = require('../config/env');

const tmpDir = path.join(__dirname, '../uploads/tmp');
const finalDir = path.join(__dirname, '../uploads/thumbnails');

// Pastikan direktori upload ada
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });

// Konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `thumbnail_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Upload Thumbnail
exports.uploadThumbnail = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
      }

      const url = `/uploads/tmp/${req.file.filename}`;

      const record = await ThumbnailTemporary.create({
        filename: req.file.filename,
        url,
      });

      res.status(200).json({
        message: 'Thumbnail berhasil diunggah',
        thumbnail_id: record.thumbnail_id,
        url: `${Env.APP_URL.replace(/\/$/, "")}/${record.url.replace(/^\//, "")}`,
      });
    } catch (error) {
      console.error('❌ Error upload thumbnail:', error);
      res.status(500).json({
        message: 'Gagal mengunggah thumbnail',
        error: error.message,
      });
    }
  },
];

// CREATE
exports.createPelatihan = async (req, res) => {
  try {
    const { thumbnail_id } = req.body;

    // 1️⃣ Buat record pelatihan
    const newPelatihan = await DaftarPelatihan.create(req.body);

    // 2️⃣ Jika ada thumbnail_id, pindahkan file dari tmp ke folder final
    if (thumbnail_id) {
      const tempThumb = await ThumbnailTemporary.findByPk(thumbnail_id);

      if (tempThumb) {
        const oldPath = path.join(tmpDir, tempThumb.filename);
        const newPath = path.join(finalDir, tempThumb.filename);

        // Pindahkan file fisik
        fs.renameSync(oldPath, newPath);

        // Tambahkan kolom `thumbnail_url` ke DaftarPelatihan (jika sudah ada di model)
        newPelatihan.thumbnail_url = `/uploads/thumbnails/${tempThumb.filename}`;
        await newPelatihan.save();

        // Hapus record sementara
        await tempThumb.destroy();
      }
    }

    res.status(201).json({
      message: 'Pelatihan berhasil dibuat',
      data: newPelatihan,
    });
  } catch (error) {
    console.error('❌ Error create pelatihan:', error);
    res.status(500).json({
      message: 'Gagal membuat pelatihan',
      error: error.message,
    });
  }
};

// READ (All dengan pagination, search, dan relasi)
exports.getAllPelatihan = async (req, res) => {
  try {
    const { page, size, search } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    const condition = createSearchCondition(search, DaftarPelatihan.rawAttributes);

    const data = await DaftarPelatihan.findAndCountAll({
      where: condition,
      limit,
      offset,
      include: [{ model: require('../models').Mitra, as: 'mitra' }], // Sertakan data mitra
    });

    const response = getPagingData(data, page, limit);

    response.records = response.records.map(record => {
      if (record.thumbnail_url) {
        record.thumbnail_url = `${Env.APP_URL.replace(/\/$/, "")}/${record.thumbnail_url.replace(/^\//, "")}`
      }
      return record;
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pelatihan', error: error.message });
  }
};

// READ (By ID)
exports.getPelatihanById = async (req, res) => {
  try {
    const pelatihan = await DaftarPelatihan.findByPk(req.params.id, {
      include: [{ model: require('../models').Mitra, as: 'mitra' }],
    });

    if (!pelatihan) return res.status(404).json({ message: 'Pelatihan tidak ditemukan' });

    if (pelatihan.thumbnail_url) {
      pelatihan.thumbnail_url = `${Env.APP_URL.replace(/\/$/, "")}/${pelatihan.thumbnail_url.replace(/^\//, "")}`
    }

    res.json(pelatihan);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pelatihan', error: error.message });
  }
};

// UPDATE
exports.updatePelatihan = async (req, res) => {
  try {
    const { id } = req.params;
    const { thumbnail_id } = req.body;

    // 🔹 Cari data pelatihan lama
    const existing = await DaftarPelatihan.findByPk(id);
    if (!existing) {
      return res.status(404).json({ message: 'Pelatihan tidak ditemukan' });
    }

    // 🔹 Update field selain thumbnail_id
    await existing.update(req.body);

    // 🔹 Jika ada thumbnail_id baru, pindahkan file dari tmp ke final
    if (thumbnail_id) {
      const tempThumb = await ThumbnailTemporary.findByPk(thumbnail_id);

      if (tempThumb) {
        const oldPath = path.join(tmpDir, tempThumb.filename);
        const newPath = path.join(finalDir, tempThumb.filename);

        // Pindahkan file fisik
        fs.renameSync(oldPath, newPath);

        // 🔹 Hapus thumbnail lama jika ada
        if (existing.thumbnail_url) {
          const oldThumbnailPath = path.join(
            __dirname,
            `../${existing.thumbnail_url.replace(/^\//, '')}`
          );
          if (fs.existsSync(oldThumbnailPath)) {
            fs.unlinkSync(oldThumbnailPath);
          }
        }

        // 🔹 Update URL baru
        existing.thumbnail_url = `/uploads/thumbnails/${tempThumb.filename}`;
        await existing.save();

        // 🔹 Hapus record sementara
        await tempThumb.destroy();
      }
    }

    res.status(200).json({
      message: 'Pelatihan berhasil diperbarui',
      data: existing,
    });
  } catch (error) {
    console.error('❌ Error update pelatihan:', error);
    res.status(500).json({
      message: 'Gagal memperbarui pelatihan',
      error: error.message,
    });
  }
};

// DELETE
exports.deletePelatihan = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DaftarPelatihan.destroy({ where: { pelatihan_id: id } });
    if (!deleted) return res.status(404).json({ message: 'Pelatihan tidak ditemukan' });
    res.json({ message: 'Pelatihan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus pelatihan', error: error.message });
  }
};