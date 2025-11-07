const { Mitra, Pengguna } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op, DataTypes } = require("sequelize");

const createSearchCondition = (query, modelAttributes) => {
  if (!query) return null;
  const searchConditions = Object.keys(modelAttributes)
    .filter(key => modelAttributes[key].type instanceof DataTypes.STRING || modelAttributes[key].type instanceof DataTypes.TEXT)
    .map(key => ({ [key]: { [Op.like]: `%${query}%` } }));
  
  return { [Op.or]: searchConditions };
};

// CREATE
exports.createMitra = async (req, res) => {
  try {
    const newMitra = await Mitra.create(req.body);
    res.status(201).json({ message: 'Data mitra berhasil dibuat', data: newMitra });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat data mitra', error: error.message });
  }
};

// READ (All)
exports.getAllMitra = async (req, res) => {
  try {
    const { page, size, search } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    const condition = createSearchCondition(search, Mitra.rawAttributes);

    const data = await Mitra.findAndCountAll({
      where: condition,
      limit,
      offset,
      include: [{ model: Pengguna, as: 'pengguna', attributes: ['user_id', 'email'] }],
    });

    const response = getPagingData(data, page, limit);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data mitra', error: error.message });
  }
};

// READ (By ID)
exports.getMitraById = async (req, res) => {
  try {
    const mitra = await Mitra.findByPk(req.params.id, {
      include: [{ model: Pengguna, attributes: ['user_id', 'email'] }],
    });
    if (!mitra) return res.status(404).json({ message: 'Mitra tidak ditemukan' });
    res.json(mitra);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data mitra', error: error.message });
  }
};

// UPDATE
exports.updateMitra = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Mitra.update(req.body, { where: { mitra_id: id } });
    if (!updated) return res.status(404).json({ message: 'Mitra tidak ditemukan' });
    res.json({ message: 'Data mitra berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui data mitra', error: error.message });
  }
};

// DELETE
exports.deleteMitra = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Mitra.destroy({ where: { mitra_id: id } });
    if (!deleted) return res.status(404).json({ message: 'Mitra tidak ditemukan' });
    res.json({ message: 'Data mitra berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus data mitra', error: error.message });
  }
};