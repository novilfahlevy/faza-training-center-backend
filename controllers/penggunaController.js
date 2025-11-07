const bcrypt = require('bcryptjs');
const { Pengguna, CalonPeserta, Mitra } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op } = require("sequelize");

// CREATE
exports.createPengguna = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Buat pengguna baru
    const newPengguna = await Pengguna.create({
      email,
      password_hash: hashedPassword,
      role,
    });

    // 🔹 Jika role adalah "mitra", buat juga data mitra
    if (role === "mitra") {
      const {
        nama_mitra,
        email_mitra,
        deskripsi_mitra,
        alamat_mitra,
        telepon_mitra,
        website_mitra,
      } = req.body;

      const newMitra = await Mitra.create({
        user_id: newPengguna.user_id,
        nama_mitra,
        email_mitra,
        deskripsi_mitra,
        alamat_mitra,
        telepon_mitra,
        website_mitra,
      });

      return res.status(201).json({
        message: "Pengguna dan data Mitra berhasil dibuat",
        data: {
          pengguna: newPengguna,
          mitra: newMitra,
        },
      });
    }

    // 🔹 Jika bukan mitra, cukup kirim data pengguna
    res.status(201).json({
      message: "Pengguna berhasil dibuat",
      data: newPengguna,
    });
  } catch (error) {
    console.error("❌ Gagal membuat pengguna:", error);
    res.status(500).json({
      message: "Gagal membuat pengguna",
      error: error.message,
    });
  }
};

// READ (All dengan pagination dan search by email/role/relasi)
exports.getAllPengguna = async (req, res) => {
  try {
    const { page = 0, size = 10, search = "" } = req.query;
    const { limit, offset } = getPagination(page, size);

    // 🔍 Kondisi pencarian lintas kolom & relasi
    let condition = {};
    if (search) {
      condition = {
        [Op.or]: [
          { email: { [Op.like]: `%${search}%` } },
          { role: { [Op.like]: `%${search}%` } },
          { "$calon_peserta.nama_lengkap$": { [Op.like]: `%${search}%` } },
          { "$mitra.nama_mitra$": { [Op.like]: `%${search}%` } },
          { "$mitra.email_mitra$": { [Op.like]: `%${search}%` } },
        ],
      };
    }

    // 🔸 Query ke database
    const data = await Pengguna.findAndCountAll({
      where: condition,
      include: [
        { model: CalonPeserta, as: "calon_peserta", required: false },
        { model: Mitra, as: "mitra", required: false },
      ],
      limit,
      offset,
      distinct: true,
      attributes: { exclude: ["password_hash"] },
      order: [["user_id", "DESC"]],
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
    const [updated] = await Pengguna.update(req.body, { where: { user_id: id } });
    if (!updated) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    res.json({ message: 'Pengguna berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui pengguna', error: error.message });
  }
};

// DELETE
exports.deletePengguna = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Pengguna.destroy({ where: { user_id: id } });
    if (!deleted) return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    res.json({ message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus pengguna', error: error.message });
  }
};