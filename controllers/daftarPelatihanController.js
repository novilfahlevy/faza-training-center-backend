const { DaftarPelatihan } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op, DataTypes } = require("sequelize");
const createSearchCondition = require('../utils/searchConditions');

// CREATE
exports.createPelatihan = async (req, res) => {
  try {
    const newPelatihan = await DaftarPelatihan.create(req.body);
    res.status(201).json({ message: 'Pelatihan berhasil dibuat', data: newPelatihan });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat pelatihan', error: error.message });
  }
};

// READ (All dengan pagination, search, dan relasi)
exports.getAllPelatihan = async (req, res) => {
  try {
    const { page, size, search } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    const condition = createSearchCondition(search, DaftarPelatihan.rawAttributes);

    const data = await DaftarPelatihan.findAndCountAll({
      where: condition,
      limit,
      offset,
      include: [{ model: require('../models').Mitra, as: 'mitra' }], // Sertakan data mitra
    });

    const response = getPagingData(data, page, limit);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pelatihan', error: error.message });
  }
};

// READ (By ID)
exports.getPelatihanById = async (req, res) => {
  try {
    const pelatihan = await DaftarPelatihan.findByPk(req.params.id, {
      include: [{ model: require('../models').Mitra, as: 'mitra' }],
    });
    if (!pelatihan) return res.status(404).json({ message: 'Pelatihan tidak ditemukan' });
    res.json(pelatihan);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pelatihan', error: error.message });
  }
};

// UPDATE
exports.updatePelatihan = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await DaftarPelatihan.update(req.body, { where: { pelatihan_id: id } });
    if (!updated) return res.status(404).json({ message: 'Pelatihan tidak ditemukan' });
    res.json({ message: 'Pelatihan berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui pelatihan', error: error.message });
  }
};

// DELETE
exports.deletePelatihan = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DaftarPelatihan.destroy({ where: { pelatihan_id: id } });
    if (!deleted) return res.status(404).json({ message: 'Pelatihan tidak ditemukan' });
    res.json({ message: 'Pelatihan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus pelatihan', error: error.message });
  }
};