const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pengguna } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op, DataTypes } = require("sequelize");
const createSearchCondition = require('../utils/searchConditions');

// CREATE
exports.createPengguna = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newPengguna = await Pengguna.create({ email, password_hash: hashedPassword, role });
    res.status(201).json({ message: 'Pengguna berhasil dibuat', data: newPengguna });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat pengguna', error: error.message });
  }
};

// READ (All dengan pagination dan search)
exports.getAllPengguna = async (req, res) => {
  try {
    const { page, size, search } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    const condition = createSearchCondition(search, Pengguna.rawAttributes);

    const data = await Pengguna.findAndCountAll({
      where: condition,
      limit,
      offset,
      attributes: { exclude: ['password_hash'] },
    });

    const response = getPagingData(data, page, limit);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pengguna', error: error.message });
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