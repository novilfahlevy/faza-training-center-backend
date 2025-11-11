const { Pelatihan, Pengguna, ThumbnailTemporary, DataMitra } = require("../models");
const { getPagination, getPagingData } = require("../utils/pagination");
const createSearchCondition = require("../utils/searchConditions");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Env = require("../config/env");

const tmpDir = path.join(__dirname, "../uploads/tmp");
const finalDir = path.join(__dirname, "../uploads/thumbnails");

if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });

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
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Tidak ada file yang diunggah" });
      }

      const url = `/uploads/tmp/${req.file.filename}`;

      const record = await ThumbnailTemporary.create({
        filename: req.file.filename,
        url,
      });

      res.status(200).json({
        message: "Thumbnail berhasil diunggah",
        thumbnail_id: record.thumbnail_id,
        url: `${Env.APP_URL.replace(/\/$/, "")}/${record.url.replace(
          /^\//,
          ""
        )}`,
      });
    } catch (error) {
      console.error("❌ Error upload thumbnail:", error);
      res.status(500).json({
        message: "Gagal mengunggah thumbnail",
        error: error.message,
      });
    }
  },
];

// CREATE
exports.createPelatihan = async (req, res) => {
  try {
    const { thumbnail_id } = req.body;
    const newPelatihan = await Pelatihan.create(req.body);

    if (thumbnail_id) {
      const tempThumb = await require("../models").ThumbnailTemporary.findByPk(
        thumbnail_id
      );
      if (tempThumb) {
        const oldPath = path.join(tmpDir, tempThumb.filename);
        const newPath = path.join(finalDir, tempThumb.filename);
        fs.renameSync(oldPath, newPath);
        newPelatihan.thumbnail_url = `/uploads/thumbnails/${tempThumb.filename}`;
        await newPelatihan.save();
        await tempThumb.destroy();
      }
    }

    res
      .status(201)
      .json({ message: "Pelatihan berhasil dibuat", data: newPelatihan });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal membuat pelatihan", error: error.message });
  }
};

// READ (All)
exports.getAllPelatihan = async (req, res) => {
  try {
    const { page, size, search } = req.query;
    const { limit, offset } = getPagination(page, size);

    const condition = createSearchCondition(search, Pelatihan.rawAttributes);

    const data = await Pelatihan.findAndCountAll({
      where: condition,
      limit,
      offset,
      include: [{ model: Pengguna, as: "mitra" }], // 🔹 Relasi ke Pengguna
    });

    const response = getPagingData(data, page, limit);

    // Lengkapi URL dari thumbnail_url
    response.records = response.records.map(record => {
      if (record.thumbnail_url) {
        record.thumbnail_url = `${Env.APP_URL.replace(/\/$/, "")}/${record.thumbnail_url.replace(/^\//, "")}`
      }
      return record;
    })

    res.json(response);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Gagal mengambil data pelatihan",
        error: error.message,
      });
  }
};

// READ (By ID)
exports.getPelatihanById = async (req, res) => {
  try {
    const pelatihan = await Pelatihan.findByPk(req.params.id, {
      include: [{
        model: Pengguna,
        as: "mitra",
        include: [{
          model: DataMitra,
          as: 'data_mitra'
        }]
      }],
    });

    if (!pelatihan) return res.status(404).json({ message: "Pelatihan tidak ditemukan" });

    // Lengkapi URL dari thumbnail_url
    if (pelatihan.thumbnail_url) {
      pelatihan.thumbnail_url = `${Env.APP_URL.replace(/\/$/, "")}/${pelatihan.thumbnail_url.replace(/^\//, "")}`
    }

    res.json(pelatihan);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Gagal mengambil data pelatihan",
        error: error.message,
      });
  }
};

// UPDATE
exports.updatePelatihan = async (req, res) => {
  try {
    const { id } = req.params;
    const { thumbnail_id, ...bodyWithoutThumbnail } = req.body;

    const existingPelatihan = await Pelatihan.findByPk(id);
    if (!existingPelatihan) {
      return res.status(404).json({ message: "Pelatihan tidak ditemukan" });
    }

    await existingPelatihan.update(bodyWithoutThumbnail);

    if (thumbnail_id) {
      const tempThumb = await require("../models").ThumbnailTemporary.findByPk(
        thumbnail_id
      );

      if (tempThumb) {
        const oldPath = path.join(tmpDir, tempThumb.filename);
        const newPath = path.join(finalDir, tempThumb.filename);

        // Pindahkan file dari tmp ke folder thumbnail
        fs.renameSync(oldPath, newPath);

        // Hapus thumbnail lama jika ada
        if (existingPelatihan.thumbnail_url) {
          const oldThumbnailPath = path.join(
            __dirname,
            `../${existingPelatihan.thumbnail_url.replace(/^\//, "")}`
          );
          if (fs.existsSync(oldThumbnailPath)) {
            fs.unlinkSync(oldThumbnailPath);
          }
        }

        // Update URL thumbnail baru di database
        await existingPelatihan.update({
          thumbnail_url: `/uploads/thumbnails/${tempThumb.filename}`,
        });

        // Hapus record sementara
        await tempThumb.destroy();
      }
    }

    res.status(200).json({
      message: "Pelatihan berhasil diperbarui",
      data: existingPelatihan,
    });
  } catch (error) {
    console.error("❌ Error update pelatihan:", error);
    res.status(500).json({
      message: "Gagal memperbarui pelatihan",
      error: error.message,
    });
  }
};

// DELETE
exports.deletePelatihan = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Pelatihan.destroy({ where: { pelatihan_id: id } });
    if (!deleted)
      return res.status(404).json({ message: "Pelatihan tidak ditemukan" });
    res.json({ message: "Pelatihan berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal menghapus pelatihan", error: error.message });
  }
};
