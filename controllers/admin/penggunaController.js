const bcrypt = require('bcryptjs');
const { Pengguna, DataPeserta, DataMitra } = require('../../models');
const { getPagination, getPagingData } = require('../../utils/pagination');
const { Op } = require("sequelize");
const makeListPenggunaResponse = require('../../responses/admin/pengguna/listPenggunaResponse');
const makeDetailPenggunaResponse = require('../../responses/admin/pengguna/detailPenggunaResponse');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Env = require('../../config/env');

// Setup upload folder untuk logo mitra
const logoDir = path.join(__dirname, '../../uploads/mitra-logos');
if (!fs.existsSync(logoDir)) fs.mkdirSync(logoDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, logoDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// CREATE (Untuk admin membuat user)
exports.createPengguna = async (req, res) => {
  try {
    // Pisahkan data umum pengguna dari data spesifik role
    const { email, password, role, ...dataRole } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat data pengguna utama
    const newPengguna = await Pengguna.create({
      email,
      password_hash: hashedPassword,
      role,
    });

    let dataTambahan = null;

    // Jika role 'peserta', buat data_peserta dengan data yang relevan
    if (role === 'peserta') {
      const newDataPeserta = await DataPeserta.create({
        ...dataRole, // Hanya field peserta yang akan masuk sini
        pengguna_id: newPengguna.pengguna_id,
      });
      dataTambahan = newDataPeserta;
    } 
    // Jika role 'mitra', buat data_mitra dengan data yang relevan
    else if (role === 'mitra') {
      const newDataMitra = await DataMitra.create({
        ...dataRole, // Hanya field mitra yang akan masuk sini
        pengguna_id: newPengguna.pengguna_id,
      });
      dataTambahan = newDataMitra;
    }

    res.status(201).json({
      message: "Pengguna berhasil dibuat",
      data: {
        pengguna: { user_id: newPengguna.pengguna_id, email: newPengguna.email, role: newPengguna.role },
        [role]: dataTambahan,
      },
    });
  } catch (error) {
    console.error("❌ Gagal membuat pengguna:", error);
    
    // Tangani error validasi Sequelize (misal: email unique)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: "Email sudah digunakan. Silakan gunakan email lain.",
        error: error.message,
      });
    }
    
    // Tangani error validasi Yup (jika sampai ke sini)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Data tidak valid. Periksa kembali input Anda.",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Gagal membuat pengguna",
      error: error.message,
    });
  }
};

// READ (All)
exports.getAllPengguna = async (req, res) => {
  try {
    const { page = 1, size = 10, search = "" } = req.query;
    const { limit, offset } = getPagination(page, size);

    // Kondisi pencarian
    let condition = {};
    if (search) {
      condition = {
        [Op.or]: [
          { email: { [Op.like]: `%${search}%` } },
          { role: { [Op.like]: `%${search}%` } },
          { "$data_peserta.nama_lengkap$": { [Op.like]: `%${search}%` } },
          { "$data_mitra.nama_mitra$": { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const data = await Pengguna.findAndCountAll({
      where: condition,
      include: [
        { model: DataPeserta, as: "data_peserta", required: false },
        { model: DataMitra, as: "data_mitra", required: false },
      ],
      limit,
      offset,
      distinct: true,
      attributes: { exclude: ["password_hash"] },
      order: [["pengguna_id", "DESC"]],
    });

    data.rows = data.rows.map(pengguna => makeListPenggunaResponse(pengguna));
    const response = getPagingData(data, page, limit);
    res.json(response);
  } catch (error) {
    console.error("❌ Gagal mengambil data pengguna:", error);
    res.status(500).json({
      message: "Gagal mengambil data pengguna",
      error: error.message,
    });
  }
};

// READ (By ID)
exports.getPenggunaById = async (req, res) => {
  try {
    const pengguna = await Pengguna.findByPk(req.params.id, {
      include: [
        { model: DataPeserta, as: "data_peserta", required: false },
        { model: DataMitra, as: "data_mitra", required: false },
      ],
      attributes: { exclude: ['password_hash'] },
    });
    
    if (!pengguna) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    
    res.json(makeDetailPenggunaResponse(pengguna));
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pengguna', error: error.message });
  }
};

// UPDATE
exports.updatePengguna = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, password, data_mitra, data_peserta } = req.body;

    // Update data pengguna utama
    const pengguna = await Pengguna.findByPk(id);
    if (!pengguna) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    const updateData = { email, role };
    
    // Update password jika disediakan
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }
    
    await pengguna.update(updateData);

    // Jika pengguna adalah mitra, update juga tabel DataMitra
    if (role === "mitra" && data_mitra) {
      const existingMitra = await DataMitra.findOne({ where: { pengguna_id: id } });
      if (existingMitra) {
        await existingMitra.update(data_mitra);
      }
    }
    
    // Jika pengguna adalah peserta, update juga tabel DataPeserta
    if (role === "peserta" && data_peserta) {
      const existingPeserta = await DataPeserta.findOne({ where: { pengguna_id: id } });
      if (existingPeserta) {
        await existingPeserta.update(data_peserta);
      }
    }

    res.json({
      message: "Data pengguna berhasil diperbarui",
    });
  } catch (error) {
    console.error("❌ Gagal memperbarui data pengguna:", error);
    
    // Tangani error validasi Sequelize (misal: email unique)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: "Email sudah digunakan. Silakan gunakan email lain.",
        error: error.message,
      });
    }

    // Tangani error validasi lainnya
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Data tidak valid. Periksa kembali input Anda.",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Gagal memperbarui data pengguna",
      error: error.message,
    });
  }
};

// DELETE
exports.deletePengguna = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Pengguna.destroy({ where: { pengguna_id: id } });
    if (!deleted) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    res.json({ message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus pengguna', error: error.message });
  }
};

// UPLOAD MITRA LOGO
exports.uploadMitraLogo = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Tidak ada file yang diunggah' });
      }

      const url = `/uploads/mitra-logos/${req.file.filename}`;

      res.status(200).json({
        message: 'Logo mitra berhasil diunggah',
        logo_id: Date.now(),
        path: url,
        url: `${Env.APP_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`,
      });
    } catch (error) {
      console.error('❌ Error upload logo mitra:', error);
      res.status(500).json({
        message: 'Gagal mengunggah logo mitra',
        error: error.message,
      });
    }
  },
];
