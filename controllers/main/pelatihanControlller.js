// /home/novilfahlevy/Projects/faza-training-center-backend/controllers/main/pelatihanControlller.js
const { Pelatihan, Pengguna, DataMitra, PesertaPelatihan, DataPeserta, PelatihanMitra } = require("../../models");
const { getPagination, getPagingData } = require("../../utils/pagination");
const createSearchCondition = require("../../utils/searchConditions");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Env = require("../../config/env");
const { sendTrainingRegistrationEmail } = require("../../config/email");

const makeStatusPendaftaranResponse = require("../../responses/main/pelatihan/statusPendaftaranResponse");
const makeListPelatihanResponse = require("../../responses/main/pelatihan/listPelatihanResponse");

const buktiDir = path.join(__dirname, "../../uploads/bukti_pembayaran");
if (!fs.existsSync(buktiDir)) fs.mkdirSync(buktiDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, buktiDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `bukti_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single("bukti_pembayaran");

// READ (All) - Endpoint publik untuk daftar pelatihan
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
        as: "mitra_pelatihan", // Gunakan alias yang benar
        include: [{
          model: DataMitra,
          as: 'data_mitra'
        }],
        through: { attributes: ['role_mitra'] } // Sertakan atribut dari tabel junction
      }],
    });

    const response = getPagingData(data, page, limit);

    response.records = makeListPelatihanResponse(response.records);

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

// READ (By ID) - Endpoint publik untuk detail pelatihan
exports.getPelatihanById = async (req, res) => {
  try {
    const pelatihan = await Pelatihan.findByPk(req.params.id, {
      include: [{
        model: Pengguna,
        as: "mitra_pelatihan", // Gunakan alias yang benar
        include: [{
          model: DataMitra,
          as: 'data_mitra'
        }],
        through: { attributes: ['role_mitra'] } // Sertakan atribut dari tabel junction
      }],
    });

    if (!pelatihan) return res.status(404).json({ message: "Pelatihan tidak ditemukan" });

    // Proses data mitra
    const mitraList = pelatihan.mitra_pelatihan ? pelatihan.mitra_pelatihan.map(mitra => ({
      id: mitra.pengguna_id,
      nama: mitra.data_mitra ? mitra.data_mitra.nama_mitra : null,
      role: mitra.PelatihanMitra ? mitra.PelatihanMitra.role_mitra : null
    })) : [];

    // Lengkapi URL dari thumbnail_url
    if (pelatihan.thumbnail_url) {
      pelatihan.thumbnail_url = `${Env.APP_URL.replace(/\/$/, "")}/${pelatihan.thumbnail_url.replace(/^\//, "")}`
    }

    // Tambahkan array mitra ke response
    const response = {
      ...pelatihan.dataValues,
      mitra: mitraList
    };

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

// READ (By Slug) - Endpoint publik untuk detail pelatihan
exports.getPelatihanBySlug = async (req, res) => {
  try {
    const pelatihan = await Pelatihan.findOne({
      where: { slug_pelatihan: req.params.slug },
      include: [{
        model: Pengguna,
        as: "mitra_pelatihan", // Gunakan alias yang benar
        include: [{
          model: DataMitra,
          as: 'data_mitra'
        }],
        through: { attributes: ['role_mitra'] } // Sertakan atribut dari tabel junction
      }],
    });

    if (!pelatihan) return res.status(404).json({ message: "Pelatihan tidak ditemukan" });

    // Proses data mitra
    const mitraList = pelatihan.mitra_pelatihan ? pelatihan.mitra_pelatihan.map(mitra => ({
      id: mitra.pengguna_id,
      nama: mitra.data_mitra ? mitra.data_mitra.nama_mitra : null,
      role: mitra.PelatihanMitra ? mitra.PelatihanMitra.role_mitra : null
    })) : [];

    // Lengkapi URL dari thumbnail_url
    if (pelatihan.thumbnail_url) {
      pelatihan.thumbnail_url = `${Env.APP_URL.replace(/\/$/, "")}/${pelatihan.thumbnail_url.replace(/^\//, "")}`
    }

    // Tambahkan array mitra ke response
    const response = {
      ...pelatihan.dataValues,
      mitra: mitraList
    };

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

// Daftar pelatihan
exports.registerForTraining = (req, res) => {
  upload(req, res, async (err) => {
    try {
      const pengguna_id = req.user.pengguna_id;
      const slug_pelatihan = req.params.slug;

      // Handle error upload file
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: "File terlalu besar (maks 5MB)" });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      // Ambil filename jika ter-upload
      const bukti_pembayaran_filename = req.file ? `/uploads/bukti_pembayaran/${req.file.filename}` : null;

      // Cek pelatihan
      const pelatihan = await Pelatihan.findOne({ where: { slug_pelatihan } });
      if (!pelatihan) {
        return res.status(404).json({ message: "Pelatihan tidak ditemukan" });
      }

      const pelatihan_id = pelatihan.pelatihan_id;

      // Cegah duplicate
      const existing = await PesertaPelatihan.findOne({ where: { pengguna_id, pelatihan_id } });
      if (existing) {
        return res.status(400).json({ message: "Anda sudah terdaftar di pelatihan ini" });
      }

      // Dapatkan data pengguna untuk email
      const pengguna = await Pengguna.findByPk(pengguna_id);
      if (!pengguna) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
      }

      // Dapatkan data peserta untuk nama
      const dataPeserta = await DataPeserta.findOne({ where: { pengguna_id } });
      const userName = dataPeserta ? dataPeserta.nama_lengkap : pengguna.email;

      // Simpan ke DB
      const peserta = await PesertaPelatihan.create({
        pengguna_id,
        pelatihan_id,
        tanggal_pendaftaran: new Date(),
        status_pendaftaran: "pending",
        bukti_pembayaran_filename,
      });

      const bukti_url = bukti_pembayaran_filename
        ? `${Env.APP_URL.replace(/\/$/, "")}${bukti_pembayaran_filename}`
        : null;

      // Kirim email notifikasi pendaftaran
      try {
        await sendTrainingRegistrationEmail(pengguna, pelatihan, peserta, userName);
      } catch (emailError) {
        console.error("Gagal mengirim email notifikasi pendaftaran:", emailError);
        // Lanjutkan proses meskipun email gagal dikirim
      }

      return res.status(201).json({
        message: "Pendaftaran pelatihan berhasil",
        data: {
          ...peserta.dataValues,
          bukti_url,
        },
      });

    } catch (error) {
      console.error("❌ Error registerForTraining:", error);
      return res.status(500).json({
        message: "Gagal mendaftar pelatihan",
        error: error.message,
      });
    }
  });
};

// Cek status pendaftaran
exports.checkRegistrationStatus = async (req, res) => {
  try {
    const { slug } = req.params;
    const pengguna_id = req.user.pengguna_id;

    // Cari pelatihan berdasarkan slug
    const pelatihan = await Pelatihan.findOne({
      where: { slug_pelatihan: slug },
      attributes: ["pelatihan_id", "nama_pelatihan", "slug_pelatihan", "tanggal_pelatihan", "durasi_pelatihan"],
    });

    if (!pelatihan) {
      return res.status(404).json({ message: "Pelatihan tidak ditemukan" });
    }

    // Cari data kepesertaan berdasarkan pelatihan_id + peserta_id
    const pesertaPelatihan = await PesertaPelatihan.findOne({
      attributes: ["pelatihan_id", "status_pendaftaran", "bukti_pembayaran_filename", "tanggal_pendaftaran"],
      where: {
        pelatihan_id: pelatihan.pelatihan_id,
        pengguna_id: pengguna_id,
      },
      include: [
        {
          model: Pelatihan,
          as: "pelatihan",
        },
        {
          model: Pengguna,
          as: "peserta",
        },
      ],
    });

    if (!pesertaPelatihan) {
      return res.status(404).json({
        message: "Anda belum terdaftar pada pelatihan ini",
        status_pendaftaran: "Belum mendaftar",
        pelatihan: pelatihan,
      });
    }

    // Format response
    return res.json(makeStatusPendaftaranResponse(pesertaPelatihan));

  } catch (error) {
    console.error("❌ Error checkRegistrationStatus:", error);
    res.status(500).json({
      message: "Gagal mengambil status pendaftaran",
      error: error.message,
    });
  }
};

// Batalkan pendaftaran
exports.cancelRegistration = async (req, res) => {
  try {
    const pengguna_id = req.user.pengguna_id;
    const slug_pelatihan = req.params.slug;

    // Cek pelatihan
    const pelatihan = await Pelatihan.findOne({ where: { slug_pelatihan } });
    if (!pelatihan) {
      return res.status(404).json({ message: "Pelatihan tidak ditemukan" });
    }

    const pelatihan_id = pelatihan.pelatihan_id;

    const peserta = await PesertaPelatihan.findOne({ where: { pengguna_id, pelatihan_id } });
    if (!peserta) {
      return res.status(404).json({ message: "Pendaftaran tidak ditemukan" });
    }

    // Opsional: hapus file bukti pembayaran
    if (peserta.bukti_pembayaran_filename) {
      const filePath = path.join(__dirname, `../../${peserta.bukti_pembayaran_filename}`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await peserta.destroy();
    res.json({ message: "Pendaftaran berhasil dibatalkan" });
  } catch (error) {
    console.error("❌ Error cancelRegistration:", error);
    res.status(500).json({ message: "Gagal membatalkan pendaftaran", error: error.message });
  }
};

// Get riwayat pelatihan peserta
exports.getTrainingHistory = async (req, res) => {
  try {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);
    const pengguna_id = req.user.pengguna_id;

    const data = await PesertaPelatihan.findAndCountAll({
      where: { pengguna_id },
      limit,
      offset,
      include: [
        {
          model: Pelatihan,
          as: "pelatihan",
        },
      ],
      order: [["tanggal_pendaftaran", "DESC"]],
    });

    const response = getPagingData(data, page, limit);

    res.json(response);
  } catch (error) {
    console.error("❌ Error getTrainingHistory:", error);
    res.status(500).json({
      message: "Gagal mengambil riwayat pelatihan",
      error: error.message,
    });
  }
};