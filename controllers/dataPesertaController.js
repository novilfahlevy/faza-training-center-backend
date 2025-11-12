const { DataPeserta, Pengguna } = require('../models'); // 🔹 Model baru
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
exports.createDataPeserta = async (req, res) => {
  try {
    const newDataPeserta = await DataPeserta.create(req.body);
    res.status(201).json({ message: 'Data peserta berhasil dibuat', data: newDataPeserta });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat data peserta', error: error.message });
  }
};

// READ (All)
exports.getAllDataPeserta = async (req, res) => {
  try {
    const { page, size, search } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    const condition = createSearchCondition(search, DataPeserta.rawAttributes);

    const data = await DataPeserta.findAndCountAll({
      where: condition,
      limit,
      offset,
      include: [{ model: Pengguna, as: 'pengguna', attributes: ['pengguna_id', 'email', 'role'] }], // 🔹 Gunakan alias
    });

    const response = getPagingData(data, page, limit);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data peserta', error: error.message });
  }
};

// READ (By ID)
exports.getDataPeserta = async (req, res) => {
  try {
    const dataPeserta = await DataPeserta.findOne({
      include: [{
        model: Pengguna,
        as: 'pengguna',
        attributes: ['pengguna_id', 'email', 'role'],
        where: { pengguna_id: req.user.pengguna_id }
      }],
    });
    if (!dataPeserta) return res.status(404).json({ message: 'Data peserta tidak ditemukan' });
    res.json(dataPeserta);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data peserta', error: error.message });
  }
};

// UPDATE
exports.updateDataPeserta = async (req, res) => {
  try {
    const penggunaId = req.user?.pengguna_id || req.params.id;
    const allowedFields = [
      'no_telp', 'nama_lengkap', 'tempat_lahir', 'tanggal_lahir',
      'jenis_kelamin', 'alamat', 'profesi', 'instansi', 'no_reg_kes'
    ];

    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    const [updated] = await DataPeserta.update(payload, {
      where: { pengguna_id: penggunaId },
    });

    if (!updated)
      return res.status(404).json({ message: 'Data peserta tidak ditemukan' });

    const updatedData = await DataPeserta.findOne({
      where: { pengguna_id: penggunaId },
    });

    res.json({
      message: 'Profil peserta berhasil diperbarui',
      data: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal memperbarui profil peserta',
      error: error.message,
    });
  }
};

// DELETE
exports.deleteDataPeserta = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DataPeserta.destroy({ where: { data_peserta_id: id } }); // 🔹 PK baru
    if (!deleted) return res.status(404).json({ message: 'Data peserta tidak ditemukan' });
    res.json({ message: 'Data peserta berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus data peserta', error: error.message });
  }
};