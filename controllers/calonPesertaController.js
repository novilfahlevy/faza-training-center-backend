const { CalonPeserta, Pengguna } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op, DataTypes } = require("sequelize");
const createSearchCondition = require('../utils/searchConditions');

// CREATE
exports.createCalonPeserta = async (req, res) => {
  try {
    const newCalonPeserta = await CalonPeserta.create(req.body);
    res.status(201).json({ message: 'Data calon peserta berhasil dibuat', data: newCalonPeserta });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat data calon peserta', error: error.message });
  }
};

// READ (All)
exports.getAllCalonPeserta = async (req, res) => {
  try {
    const { page, size, search } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    const condition = createSearchCondition(search, CalonPeserta.rawAttributes);

    const data = await CalonPeserta.findAndCountAll({
      where: condition,
      limit,
      offset,
      include: [{ model: Pengguna, attributes: ['user_id', 'email', 'role'] }],
    });

    const response = getPagingData(data, page, limit);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data calon peserta', error: error.message });
  }
};

// READ (By ID)
exports.getCalonPesertaById = async (req, res) => {
  try {
    const calonPeserta = await CalonPeserta.findByPk(req.params.id, {
      include: [{ model: Pengguna, attributes: ['user_id', 'email', 'role'] }],
    });
    if (!calonPeserta) return res.status(404).json({ message: 'Calon peserta tidak ditemukan' });
    res.json(calonPeserta);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data calon peserta', error: error.message });
  }
};

// UPDATE
exports.updateCalonPeserta = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await CalonPeserta.update(req.body, { where: { peserta_id: id } });
    if (!updated) return res.status(404).json({ message: 'Calon peserta tidak ditemukan' });
    res.json({ message: 'Data calon peserta berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui data calon peserta', error: error.message });
  }
};

// DELETE
exports.deleteCalonPeserta = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CalonPeserta.destroy({ where: { peserta_id: id } });
    if (!deleted) return res.status(404).json({ message: 'Calon peserta tidak ditemukan' });
    res.json({ message: 'Data calon peserta berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus data calon peserta', error: error.message });
  }
};