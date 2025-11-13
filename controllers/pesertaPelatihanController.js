const { PesertaPelatihan, Pelatihan, Pengguna, DataPeserta } = require("../models");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Env = require("../config/env");
const { getPagingData, getPagination } = require("../utils/pagination");
const makePesertaPelatihanListRequest = require("../requests/pesertaPelatihanRequest");
const { Op } = require("sequelize");

// --- Setup direktori upload bukti pembayaran ---
const buktiDir = path.join(__dirname, "../uploads/bukti_pembayaran");
if (!fs.existsSync(buktiDir)) fs.mkdirSync(buktiDir, { recursive: true });

// --- Konfigurasi multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, buktiDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `bukti_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maks 5MB
}).single("bukti_pembayaran");

// --- REGISTER PESERTA ---
exports.registerForTraining = async (req, res) => {
  upload(req, res, async (err) => {
    try {
      // Validasi upload error
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: "File terlalu besar (maks 5MB)" });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      const pengguna_id = req.user.pengguna_id;
      const slug_pelatihan = req.params.slug;

      // Cek pelatihan
      const pelatihan = await Pelatihan.findOne({ where: { slug_pelatihan } });
      if (!pelatihan) {
        return res.status(404).json({ message: "Pelatihan tidak ditemukan" });
      }

      const pelatihan_id = pelatihan.pelatihan_id;

      // Cegah duplikasi
      const existing = await PesertaPelatihan.findOne({ where: { pengguna_id, pelatihan_id } });
      if (existing) {
        return res.status(400).json({ message: "Anda sudah terdaftar di pelatihan ini" });
      }

      // Pastikan file dikirim
      if (!req.file) {
        return res.status(400).json({ message: "Bukti pembayaran wajib diunggah" });
      }

      // Simpan data ke DB
      const peserta = await PesertaPelatihan.create({
        pengguna_id,
        pelatihan_id,
        tanggal_pendaftaran: new Date(),
        status_pendaftaran: "terdaftar",
        bukti_pembayaran_filename: `/uploads/bukti_pembayaran/${req.file.filename}`,
      });

      // Buat URL bukti
      const bukti_url = `${Env.APP_URL.replace(/\/$/, "")}/uploads/bukti_pembayaran/${req.file.filename}`;

      res.status(201).json({
        message: "Pendaftaran pelatihan berhasil",
        data: { ...peserta.toJSON(), bukti_pembayaran_url: bukti_url },
      });
    } catch (error) {
      console.error("❌ Error registerForTraining:", error);
      res.status(500).json({
        message: "Gagal mendaftar pelatihan",
        error: error.message,
      });
    }
  });
};

// --- CANCEL REGISTRATION ---
exports.cancelRegistration = async (req, res) => {
  try {
    const pengguna_id = req.user.pengguna_id;
    const pelatihan_id = req.params.pelatihanId;

    const peserta = await PesertaPelatihan.findOne({ where: { pengguna_id, pelatihan_id } });
    if (!peserta) {
      return res.status(404).json({ message: "Pendaftaran tidak ditemukan" });
    }

    // Opsional: hapus file bukti pembayaran
    if (peserta.bukti_pembayaran_filename) {
      const filePath = path.join(__dirname, `../${peserta.bukti_pembayaran_filename}`);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await peserta.update({ status_pendaftaran: "dibatalkan" });
    res.json({ message: "Pendaftaran berhasil dibatalkan" });
  } catch (error) {
    console.error("❌ Error cancelRegistration:", error);
    res.status(500).json({ message: "Gagal membatalkan pendaftaran", error: error.message });
  }
};

// --- GET PESERTA (Admin) ---
exports.getTrainingParticipants = async (req, res) => {
  try {
    const { page, size, search } = req.query;
    const { limit, offset } = getPagination(page, size);
    const pelatihan_id = req.params.pelatihanId;

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

    // 🔹 Query utama
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

    // 🔹 Format response
    data.rows = data.rows.map((row) => makePesertaPelatihanListRequest(row));
    const response = getPagingData(data, page, limit);

    res.json(response);
  } catch (error) {
    console.error("❌ Error getTrainingParticipants:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data peserta", error: error.message });
  }
};