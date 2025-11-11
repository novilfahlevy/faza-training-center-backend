const { LaporanKegiatan, Pengguna } = require('../models'); // 🔹 Impor tetap
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op, DataTypes } = require("sequelize");
const createSearchCondition = require('../utils/searchConditions');

// CREATE
exports.createLaporan = async (req, res) => {
  try {
    // 🔹 Gunakan pengguna_id baru
    const laporanData = { ...req.body, pengguna_id: req.user.pengguna_id };
    const newLaporan = await LaporanKegiatan.create(laporanData);
    res.status(201).json({ message: 'Laporan berhasil dibuat', data: newLaporan });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat laporan', error: error.message });
  }
};

// READ (All)
exports.getAllLaporan = async (req, res) => {
  try {
    const { page, size, search } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    const searchCondition = createSearchCondition(search, LaporanKegiatan.rawAttributes);

    let whereCondition = searchCondition || {};
    if (req.user.role !== 'admin') {
      whereCondition.pengguna_id = req.user.pengguna_id; // 🔹 Gunakan kolom baru
    }
    
    const data = await LaporanKegiatan.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      include: [{ model: Pengguna, as: 'uploader', attributes: ['pengguna_id', 'email', 'role'] }],
      order: [['tanggal_laporan', 'DESC']],
    });

    const response = getPagingData(data, page, limit);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data laporan', error: error.message });
  }
};

// READ (By ID)
exports.getLaporanById = async (req, res) => {
  try {
    const laporan = await LaporanKegiatan.findByPk(req.params.id, {
      include: [{ model: Pengguna, as: 'uploader', attributes: ['pengguna_id', 'email', 'role'] }],
    });

    if (!laporan) return res.status(404).json({ message: 'Laporan tidak ditemukan' });

    // 🔹 Cek otorisasi dengan kolom baru
    if (req.user.role !== 'admin' && laporan.pengguna_id !== req.user.pengguna_id) {
      return res.status(403).json({ message: 'Anda tidak berhak mengakses laporan ini' });
    }

    res.json(laporan);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data laporan', error: error.message });
  }
};

// UPDATE
exports.updateLaporan = async (req, res) => {
  try {
    const laporan = await LaporanKegiatan.findByPk(req.params.id);
    if (!laporan) return res.status(404).json({ message: 'Laporan tidak ditemukan' });

    // 🔹 Cek otorisasi dengan kolom baru
    if (req.user.role !== 'admin' && laporan.pengguna_id !== req.user.pengguna_id) {
      return res.status(403).json({ message: 'Anda tidak berhak mengubah laporan ini' });
    }

    await laporan.update(req.body);
    res.json({ message: 'Laporan berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui laporan', error: error.message });
  }
};

// DELETE
exports.deleteLaporan = async (req, res) => {
  try {
    const laporan = await LaporanKegiatan.findByPk(req.params.id);
    if (!laporan) return res.status(404).json({ message: 'Laporan tidak ditemukan' });

    // 🔹 Cek otorisasi dengan kolom baru
    if (req.user.role !== 'admin' && laporan.pengguna_id !== req.user.pengguna_id) {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus laporan ini' });
    }

    await laporan.destroy();
    res.json({ message: 'Laporan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus laporan', error: error.message });
  }
};