const { DataMitra, Pengguna } = require('../models'); // 🔹 Model baru
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
exports.createDataMitra = async (req, res) => {
  try {
    const newDataMitra = await DataMitra.create(req.body);
    res.status(201).json({ message: 'Data mitra berhasil dibuat', data: newDataMitra });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat data mitra', error: error.message });
  }
};

// READ (All)
exports.getAllDataMitra = async (req, res) => {
  try {
    const { page, size, search } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    const condition = createSearchCondition(search, DataMitra.rawAttributes);

    const data = await DataMitra.findAndCountAll({
      where: condition,
      limit,
      offset,
      include: [{ model: Pengguna, as: 'pengguna', attributes: ['pengguna_id', 'email'] }], // 🔹 Gunakan alias
    });

    const response = getPagingData(data, page, limit);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data mitra', error: error.message });
  }
};

// READ (By ID)
exports.getDataMitraById = async (req, res) => {
  try {
    const dataMitra = await DataMitra.findByPk(req.params.id, {
      include: [{ model: Pengguna, as: 'pengguna', attributes: ['pengguna_id', 'email'] }],
    });
    if (!dataMitra) return res.status(404).json({ message: 'Data mitra tidak ditemukan' });
    res.json(dataMitra);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data mitra', error: error.message });
  }
};

// UPDATE
exports.updateDataMitra = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await DataMitra.update(req.body, { where: { mitra_id: id } });
    if (!updated) return res.status(404).json({ message: 'Data mitra tidak ditemukan' });
    res.json({ message: 'Data mitra berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui data mitra', error: error.message });
  }
};

// DELETE
exports.deleteDataMitra = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DataMitra.destroy({ where: { mitra_id: id } });
    if (!deleted) return res.status(404).json({ message: 'Data mitra tidak ditemukan' });
    res.json({ message: 'Data mitra berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus data mitra', error: error.message });
  }
};