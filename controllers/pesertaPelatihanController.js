const { DataTypes, Op } = require('sequelize');
const { CalonPeserta, DaftarPelatihan, PesertaPelatihan, Pengguna } = require('../models');
const { getPagingData, getPagination } = require('../utils/pagination');
const createSearchCondition = require('../utils/searchConditions');

// Calon peserta mendaftar ke pelatihan
exports.registerForTraining = async (req, res) => {
  try {
    const { pelatihanId } = req.params;
    const userId = req.user.user_id;

    // Pastikan yang mendaftar adalah calon peserta
    if (req.user.role !== 'calon_peserta') {
      return res.status(403).json({ message: 'Hanya calon peserta yang bisa mendaftar.' });
    }

    // Cari data calon peserta berdasarkan user yang login
    const calonPeserta = await CalonPeserta.findOne({ where: { user_id: userId } });
    if (!calonPeserta) {
      return res.status(404).json({ message: 'Profil calon peserta tidak ditemukan.' });
    }

    // Cek apakah pelatihan ada
    const pelatihan = await DaftarPelatihan.findByPk(pelatihanId);
    if (!pelatihan) {
      return res.status(404).json({ message: 'Pelatihan tidak ditemukan.' });
    }

    // Cek apakah sudah terdaftar
    const existingRegistration = await PesertaPelatihan.findOne({
      where: { pelatihan_id: pelatihanId, peserta_id: calonPeserta.peserta_id }
    });
    if (existingRegistration) {
      return res.status(400).json({ message: 'Anda sudah terdaftar di pelatihan ini.' });
    }

    // Tambahkan pendaftaran
    await calonPeserta.addPelatihan_diikuti(pelatihan, {
      through: { tanggal_pendaftaran: new Date() }
    });

    res.status(201).json({ message: 'Berhasil mendaftar ke pelatihan.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mendaftar', error: error.message });
  }
};

// Calon peserta membatalkan pendaftaran
exports.cancelRegistration = async (req, res) => {
  try {
    const { pelatihanId } = req.params;
    const userId = req.user.user_id;

    if (req.user.role !== 'calon_peserta') {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    const calonPeserta = await CalonPeserta.findOne({ where: { user_id: userId } });
    if (!calonPeserta) {
      return res.status(404).json({ message: 'Profil calon peserta tidak ditemukan.' });
    }

    // Hapus pendaftaran
    await calonPeserta.removePelatihan_diikuti(pelatihanId);

    res.json({ message: 'Pendaftaran berhasil dibatalkan.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal membatalkan pendaftaran', error: error.message });
  }
};

// Admin melihat semua peserta di sebuah pelatihan
exports.getTrainingParticipants = async (req, res) => {
  try {
    const { pelatihanId } = req.params;
    const { page, size, search } = req.query;
    const { limit, offset } = getPagination(page, size);

    // Pastikan pelatihan valid
    const pelatihan = await DaftarPelatihan.findByPk(pelatihanId);
    if (!pelatihan) {
      return res.status(404).json({ message: 'Pelatihan tidak ditemukan.' });
    }

    // 🔍 Gabungkan pencarian di nama_lengkap, no_telp, dan email
    const searchCondition = search
      ? {
          [Op.or]: [
            { '$peserta.nama_lengkap$': { [Op.like]: `%${search}%` } },
            { '$peserta.no_telp$': { [Op.like]: `%${search}%` } },
            { '$peserta.pengguna.email$': { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    // Query peserta
    const { count, rows } = await PesertaPelatihan.findAndCountAll({
      where: {
        pelatihan_id: pelatihanId,
        ...searchCondition, // filter lintas relasi
      },
      include: [
        {
          model: CalonPeserta,
          as: 'peserta',
          attributes: ['nama_lengkap', 'no_telp'],
          include: [
            {
              model: Pengguna,
              as: 'pengguna',
              attributes: ['email'],
            },
          ],
        },
      ],
      limit,
      offset,
      distinct: true,
    });

    const data = getPagingData({ count, rows }, page, limit);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Gagal mengambil data peserta',
      error: error.message,
    });
  }
};

// Calon peserta melihat riwayat pelatihan yang diikuti
exports.getUserRegistrations = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const calonPeserta = await CalonPeserta.findOne({
      where: { user_id: userId },
      include: [{
        model: DaftarPelatihan,
        as: 'pelatihan_diikuti',
        through: { attributes: ['tanggal_pendaftaran', 'status_pendaftaran'] }, // Sertakan data dari tabel penghubung
        include: [{ model: require('./mitra'), as: 'mitra' }]
      }]
    });

    if (!calonPeserta) {
      return res.status(404).json({ message: 'Profil calon peserta tidak ditemukan.' });
    }

    res.json(calonPeserta.pelatihan_diikuti);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil riwayat pendaftaran', error: error.message });
  }
};