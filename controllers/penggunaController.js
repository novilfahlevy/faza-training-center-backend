const bcrypt = require('bcryptjs');
const { Pengguna, DataPeserta, DataMitra } = require('../models'); // 🔹 Model baru
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op } = require("sequelize");

// CREATE (Untuk admin membuat user)
exports.createPengguna = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newPengguna = await Pengguna.create({
      email,
      password_hash: hashedPassword,
      role,
    });

    const newDataMitra = await DataMitra.create({
      pengguna_id: newPengguna.pengguna_id,
      nama_mitra: req.body.nama_mitra,
      deskripsi_mitra: req.body.deskripsi_mitra,
      alamat_mitra: req.body.alamat_mitra,
      telepon_mitra: req.body.telepon_mitra,
      website_mitra: req.body.website_mitra,
    })

    res.status(201).json({
      message: "Pengguna berhasil dibuat",
      data: {
        pengguna_id: newPengguna.pengguna_id,
        email: newPengguna.email,
        role: newPengguna.role,
        ...newDataMitra
      },
    });
  } catch (error) {
    console.error("❌ Gagal membuat pengguna:", error);
    res.status(500).json({
      message: "Gagal membuat pengguna",
      error: error.message,
    });
  }
};

// READ (All)
exports.getAllPengguna = async (req, res) => {
  try {
    const { page = 0, size = 10, search = "" } = req.query;
    const { limit, offset } = getPagination(page, size);

    // 🔹 Kondisi pencarian diperbarui
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
    res.json(pengguna);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pengguna', error: error.message });
  }
};

// UPDATE
exports.updatePengguna = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    // 🔹 Update data pengguna
    const pengguna = await Pengguna.findByPk(id);
    if (!pengguna) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }
    await pengguna.update({ email, role });

    // 🔹 Jika pengguna adalah mitra, update juga tabel DataMitra
    if (role === "mitra") {
      const existingMitra = await DataMitra.findOne({ where: { pengguna_id: id } });
      if (existingMitra) {
        await existingMitra.update(req.body.data_mitra); // Asumsi data_mitra dikirim di body
      }
    }
    
    // 🔹 Jika pengguna adalah peserta, update juga tabel DataPeserta
    if (role === "peserta") {
      const existingPeserta = await DataPeserta.findOne({ where: { pengguna_id: id } });
      if (existingPeserta) {
        await existingPeserta.update(req.body.data_peserta); // Asumsi data_peserta dikirim
      }
    }

    res.json({
      message: "Data pengguna berhasil diperbarui",
    });
  } catch (error) {
    console.error("❌ Gagal memperbarui data pengguna:", error);
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