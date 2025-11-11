const { DataPeserta, Pelatihan, PesertaPelatihan, Pengguna } = require('../models'); // 🔹 Model baru
const { getPagingData, getPagination } = require('../utils/pagination');
const { Op, DataTypes } = require("sequelize");

// Peserta mendaftar ke pelatihan
exports.registerForTraining = async (req, res) => {
  try {
    const { pelatihanId } = req.params;
    const userId = req.user.pengguna_id;

    if (req.user.role !== 'peserta') {
      return res.status(403).json({ message: 'Hanya peserta yang bisa mendaftar.' });
    }

    // Cari data peserta berdasarkan user yang login
    const dataPeserta = await DataPeserta.findOne({ where: { pengguna_id: userId } });
    if (!dataPeserta) {
      return res.status(404).json({ message: 'Profil peserta tidak ditemukan.' });
    }

    // Cek apakah pelatihan ada
    const pelatihan = await Pelatihan.findByPk(pelatihanId);
    if (!pelatihan) {
      return res.status(404).json({ message: 'Pelatihan tidak ditemukan.' });
    }

    // Cek apakah sudah terdaftar
    const existingRegistration = await PesertaPelatihan.findOne({
      where: { pelatihan_id: pelatihanId, pengguna_id: userId } // 🔹 Relasi ke pengguna_id
    });
    if (existingRegistration) {
      return res.status(400).json({ message: 'Anda sudah terdaftar di pelatihan ini.' });
    }

    // Tambahkan pendaftaran menggunakan asosiasi
    await dataPeserta.addPelatihan_diikuti(pelatihan, {
      through: { tanggal_pendaftaran: new Date() }
    });

    res.status(201).json({ message: 'Berhasil mendaftar ke pelatihan.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mendaftar', error: error.message });
  }
};

// Peserta membatalkan pendaftaran
exports.cancelRegistration = async (req, res) => {
  try {
    const { pelatihanId } = req.params;
    const userId = req.user.pengguna_id;

    if (req.user.role !== 'peserta') {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    const dataPeserta = await DataPeserta.findOne({ where: { pengguna_id: userId } });
    if (!dataPeserta) {
      return res.status(404).json({ message: 'Profil peserta tidak ditemukan.' });
    }

    // Hapus pendaftaran menggunakan asosiasi
    await dataPeserta.removePelatihan_diikuti(pelatihanId);

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

    const pelatihan = await Pelatihan.findByPk(pelatihanId);
    if (!pelatihan) {
      return res.status(404).json({ message: 'Pelatihan tidak ditemukan.' });
    }

    // 🔹 Gabungkan pencarian di nama_lengkap, no_telp, dan email
    const searchCondition = search
      ? {
          [Op.or]: [
            { '$peserta.nama_lengkap$': { [Op.like]: `%${search}%` } },
            { '$peserta.no_telp$': { [Op.like]: `%${search}%` } },
            { '$peserta.pengguna.email$': { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await PesertaPelatihan.findAndCountAll({
      where: {
        pelatihan_id: pelatihanId,
        ...searchCondition,
      },
      include: [
        {
          model: Pengguna,
          as: 'peserta',
          attributes: ['email'],
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

// Peserta melihat riwayat pelatihan yang diikuti
exports.getUserRegistrations = async (req, res) => {
  try {
    const userId = req.user.pengguna_id;

    const dataPeserta = await DataPeserta.findOne({
      where: { pengguna_id: userId },
      include: [{
        model: Pelatihan,
        as: 'pelatihan_diikuti',
        through: { attributes: ['tanggal_pendaftaran', 'status_pendaftaran'] },
        include: [{ model: Pengguna, as: 'mitra' }] // Sertakan info mitra jika ada
      }]
    });

    if (!dataPeserta) {
      return res.status(404).json({ message: 'Profil peserta tidak ditemukan.' });
    }

    res.json(dataPeserta.pelatihan_diikuti);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil riwayat pendaftaran', error: error.message });
  }
};