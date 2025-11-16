const { Pelatihan, Pengguna, ThumbnailTemporary, DataMitra } = require("../../models");
const { getPagination, getPagingData } = require("../../utils/pagination");
const createSearchCondition = require("../../utils/searchConditions");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Env = require("../../config/env");
const makeListPelatihanResponse = require("../../responses/admin/pelatihan/listPelatihanResponse");
const makeDetailPelatihanResponse = require("../../responses/admin/pelatihan/detailPelatihanResponse");

const tmpDir = path.join(__dirname, "../../uploads/tmp");
const finalDir = path.join(__dirname, "../../uploads/thumbnails");

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

function generateSlug(nama) {
  return nama
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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

    if (req.body.nama_pelatihan) {
      req.body.slug_pelatihan = generateSlug(req.body.nama_pelatihan);
    }

    const newPelatihan = await Pelatihan.create(req.body);

    if (thumbnail_id) {
      const tempThumb = await ThumbnailTemporary.findByPk(thumbnail_id);
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
      .json({ message: "Pelatihan berhasil dibuat", pelatihan_id: newPelatihan.pelatihan_id });
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
      include: [{ 
        model: Pengguna, 
        as: "mitra",
        include: [{
          model: DataMitra,
          as: 'data_mitra'
        }]
      }],
    });
    
    // Format response
    data.rows = data.rows.map((row) => makeListPelatihanResponse(row));
    const response = getPagingData(data, page, limit);

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
    const { withCompleteDataMitra = false } = req.query;
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

    res.json(makeDetailPelatihanResponse(pelatihan, withCompleteDataMitra));
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

    if (bodyWithoutThumbnail.nama_pelatihan) {
      bodyWithoutThumbnail.slug_pelatihan = generateSlug(bodyWithoutThumbnail.nama_pelatihan);
    }

    await existingPelatihan.update(bodyWithoutThumbnail);

    if (thumbnail_id) {
      const tempThumb = await ThumbnailTemporary.findByPk(thumbnail_id);

      if (tempThumb) {
        const oldPath = path.join(tmpDir, tempThumb.filename);
        const newPath = path.join(finalDir, tempThumb.filename);

        // Pindahkan file dari tmp ke folder thumbnail
        fs.renameSync(oldPath, newPath);

        // Hapus thumbnail lama jika ada
        if (existingPelatihan.thumbnail_url) {
          const oldThumbnailPath = path.join(
            __dirname,
            `../../${existingPelatihan.thumbnail_url.replace(/^\//, "")}`
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

    res.status(200).json({ message: "Pelatihan berhasil diperbarui" });
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

// Update status peserta pelatihan
exports.updatePesertaStatus = async (req, res) => {
  try {
    const { pesertaPelatihanId } = req.params;
    const { status: status_pendaftaran } = req.body;

    // Validasi status
    const allowedStatus = ["terdaftar", "pending", "selesai"];
    if (!allowedStatus.includes(status_pendaftaran)) {
      return res.status(400).json({
        message: "Status tidak valid. Gunakan: terdaftar | pending | selesai",
      });
    }

    const { PesertaPelatihan } = require('../../models');
    const peserta = await PesertaPelatihan.findByPk(pesertaPelatihanId);

    if (!peserta) {
      return res.status(404).json({ message: "Peserta tidak ditemukan" });
    }

    peserta.status_pendaftaran = status_pendaftaran;
    await peserta.save();

    res.status(200).json({
      message: "Status peserta berhasil diperbarui",
      data: peserta,
    });
  } catch (error) {
    console.error("❌ Error update status peserta:", error);
    res.status(500).json({
      message: "Gagal mengubah status peserta",
      error: error.message,
    });
  }
};

// Get peserta pelatihan
exports.getPesertaPelatihan = async (req, res) => {
  try {
    const { page, size, search } = req.query;
    const { limit, offset } = getPagination(page, size);
    const pelatihan_id = req.params.pelatihanId;
    
    const { PesertaPelatihan, Pengguna, DataPeserta } = require('../../models');
    const { Op } = require("sequelize");
    const makeListPesertaPelatihanResponse = require("../../responses/admin/pelatihan/listPesertaPelatihanResponse");

    const whereCondition = { pelatihan_id };

    if (search && search.trim() !== "") {
      whereCondition[Op.or] = [
        // Kolom di DataPeserta
        { "$peserta.data_peserta.nama_lengkap$": { [Op.like]: `%${search}%` } },
        { "$peserta.data_peserta.no_telp$": { [Op.like]: `%${search}%` } },
        { "$peserta.data_peserta.profesi$": { [Op.like]: `%${search}%` } },
        { "$peserta.data_peserta.instansi$": { [Op.like]: `%${search}%` } },

        // Kolom di Pengguna
        { "$peserta.email$": { [Op.like]: `%${search}%` } },
      ];
    }

    // Query utama
    const data = await PesertaPelatihan.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      include: [
        {
          model: Pengguna,
          as: "peserta",
          attributes: ["pengguna_id", "email", "role"],
          include: [
            {
              model: DataPeserta,
              as: "data_peserta",
              required: false,
              attributes: [
                "nama_lengkap",
                "no_telp",
                "profesi",
                "instansi",
              ],
            },
          ],
        },
        {
          model: Pelatihan,
          as: "pelatihan",
        },
      ],
      order: [["id", "ASC"]],
    });

    // Format response
    data.rows = data.rows.map((row) => makeListPesertaPelatihanResponse(row));
    const response = getPagingData(data, page, limit);

    res.json(response);
  } catch (error) {
    console.error("❌ Error getPesertaPelatihan:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data peserta", error: error.message });
  }
};