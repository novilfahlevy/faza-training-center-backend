// /home/novilfahlevy/Projects/faza-training-center-backend/controllers/admin/pelatihanController.js
const { Pelatihan, Pengguna, ThumbnailTemporary, DataMitra, PesertaPelatihan, DataPeserta, PelatihanMitra } = require("../../models");
const { getPagination, getPagingData } = require("../../utils/pagination");
const createSearchCondition = require("../../utils/searchConditions");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Env = require("../../config/env");
const makeListPelatihanResponse = require("../../responses/admin/pelatihan/listPelatihanResponse");
const makeDetailPelatihanResponse = require("../../responses/admin/pelatihan/detailPelatihanResponse");
const { sendStatusUpdateEmail } = require("../../config/email");

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
    const { thumbnail_id, mitra_ids } = req.body;

    if (req.body.nama_pelatihan) {
      req.body.slug_pelatihan = generateSlug(req.body.nama_pelatihan);
    }

    // Pastikan nilai boolean untuk daring
    if (req.body.daring !== undefined) {
      req.body.daring = req.body.daring === 'true' || req.body.daring === true;
    }

    // Konversi biaya ke integer
    if (req.body.biaya !== undefined) {
      req.body.biaya = parseInt(req.body.biaya) || 0;
    }

    const newPelatihan = await Pelatihan.create(req.body);

    // Tambahkan mitra jika ada
    if (mitra_ids && mitra_ids.length > 0) {
      const mitraArray = Array.isArray(mitra_ids) ? mitra_ids : [mitra_ids];
      const mitraAssociations = mitraArray.map(mitra_id => ({
        pelatihan_id: newPelatihan.pelatihan_id,
        pengguna_id: mitra_id,
        role_mitra: 'pemateri' // Default role
      }));
      
      await PelatihanMitra.bulkCreate(mitraAssociations);
    }

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
      include: [
        { 
          model: Pengguna, 
          as: "mitra_pelatihan",
          include: [{
            model: DataMitra,
            as: 'data_mitra'
          }],
          through: { attributes: ['role_mitra'] } // Sertakan atribut dari tabel junction
        }
      ],
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
      include: [
        {
          model: Pengguna,
          as: "mitra_pelatihan",
          include: [{
            model: DataMitra,
            as: 'data_mitra'
          }],
          through: { attributes: ['role_mitra'] } // Sertakan atribut dari tabel junction
        }
      ],
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
    const { thumbnail_id, mitra_ids, ...bodyWithoutThumbnail } = req.body;

    const existingPelatihan = await Pelatihan.findByPk(id);
    if (!existingPelatihan) {
      return res.status(404).json({ message: "Pelatihan tidak ditemukan" });
    }

    if (bodyWithoutThumbnail.nama_pelatihan) {
      bodyWithoutThumbnail.slug_pelatihan = generateSlug(bodyWithoutThumbnail.nama_pelatihan);
    }

    // Pastikan nilai boolean untuk daring
    if (bodyWithoutThumbnail.daring !== undefined) {
      bodyWithoutThumbnail.daring = bodyWithoutThumbnail.daring === 'true' || bodyWithoutThumbnail.daring === true;
    }

    // Konversi biaya ke integer
    if (bodyWithoutThumbnail.biaya !== undefined) {
      bodyWithoutThumbnail.biaya = parseInt(bodyWithoutThumbnail.biaya) || 0;
    }

    await existingPelatihan.update(bodyWithoutThumbnail);

    // Update mitra jika ada
    if (mitra_ids !== undefined) {
      // Hapus semua asosiasi mitra yang ada
      await PelatihanMitra.destroy({
        where: { pelatihan_id: id }
      });
      
      // Tambahkan asosiasi mitra baru jika ada
      if (mitra_ids.length > 0) {
        const mitraArray = Array.isArray(mitra_ids) ? mitra_ids : [mitra_ids];
        const mitraAssociations = mitraArray.map(mitra_id => ({
          pelatihan_id: id,
          pengguna_id: mitra_id,
          role_mitra: 'pemateri' // Default role
        }));
        
        await PelatihanMitra.bulkCreate(mitraAssociations);
      }
    }

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
    
    // Hapus asosiasi mitra terlebih dahulu
    await PelatihanMitra.destroy({
      where: { pelatihan_id: id }
    });
    
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

    // Cari data peserta beserta relasi yang dibutuhkan untuk email
    const peserta = await PesertaPelatihan.findByPk(pesertaPelatihanId, {
      include: [
        {
          model: Pengguna,
          as: "peserta",
          include: [
            {
              model: DataPeserta,
              as: 'data_peserta'
            }
          ]
        },
        {
          model: Pelatihan,
          as: "pelatihan"
        }
      ]
    });

    if (!peserta) {
      return res.status(404).json({ message: "Peserta tidak ditemukan" });
    }

    // Simpan status lama sebelum diupdate
    const oldStatus = peserta.status_pendaftaran;

    // Update status di database
    peserta.status_pendaftaran = status_pendaftaran;
    await peserta.save();

    try {
      // Ambil nama peserta, fallback ke email jika nama tidak ada
      const userName = peserta.peserta.data_peserta?.nama_lengkap || peserta.peserta.email;

      await sendStatusUpdateEmail(
        peserta.peserta,        // Data Pengguna
        peserta.pelatihan,      // Data Pelatihan
        oldStatus,              // Status Lama
        status_pendaftaran,     // Status Baru
        userName                // Nama Peserta
      );
    } catch (emailError) {
      // Jika email gagal, log error tapi tidak gagalkan proses update status
      console.error("❌ Gagal mengirim email notifikasi update status:", emailError);
    }

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