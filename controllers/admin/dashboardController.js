const { Pelatihan, Pengguna, DataMitra, DataPeserta, PesertaPelatihan } = require("../../models");
const { Op } = require("sequelize");
const db = require("../../config/database");

// GET Statistics
exports.getStatistics = async (req, res) => {
  try {
    // Total Pelatihan
    const totalPelatihan = await Pelatihan.count();

    // Total Peserta (unique users)
    const totalPeserta = await Pengguna.count({
      where: { role: 'peserta' }
    });

    // Total Mitra
    const totalMitra = await Pengguna.count({
      where: { role: 'mitra' }
    });

    // Pendapatan Bulan Ini
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const pendapatanBulanIni = await PesertaPelatihan.sum('pelatihan.biaya', {
      include: [{
        model: Pelatihan,
        as: 'pelatihan',
        attributes: [],
        where: {
          biaya: { [Op.gt]: 0 }
        }
      }],
      where: {
        tanggal_pendaftaran: {
          [Op.between]: [startOfMonth, endOfMonth]
        },
        status_pendaftaran: {
          [Op.in]: ['terdaftar', 'selesai']
        }
      }
    }) || 0;

    res.json({
      totalPelatihan,
      totalPeserta,
      totalMitra,
      pendapatanBulanIni
    });
  } catch (error) {
    console.error("❌ Error getting statistics:", error);
    res.status(500).json({
      message: "Gagal mengambil statistik",
      error: error.message
    });
  }
};

// GET Chart Data
exports.getChartData = async (req, res) => {
  try {
    // 1. Pendaftaran Per Bulan (6 bulan terakhir)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const pendaftaranPerBulan = await db.query(`
      SELECT 
        DATE_FORMAT(tanggal_pendaftaran, '%Y-%m') as bulan,
        COUNT(*) as jumlah
      FROM peserta_pelatihan
      WHERE tanggal_pendaftaran >= :sixMonthsAgo
      GROUP BY DATE_FORMAT(tanggal_pendaftaran, '%Y-%m')
      ORDER BY bulan ASC
    `, {
      replacements: { sixMonthsAgo },
      type: db.QueryTypes.SELECT
    });

    const categories = pendaftaranPerBulan.map(item => {
      const [year, month] = item.bulan.split('-');
      const date = new Date(year, month - 1);
      return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    });
    const seriesData = pendaftaranPerBulan.map(item => parseInt(item.jumlah));

    // 2. Status Pendaftaran
    const statusPendaftaran = await PesertaPelatihan.findAll({
      attributes: [
        'status_pendaftaran',
        [db.fn('COUNT', db.col('id')), 'jumlah']
      ],
      group: ['status_pendaftaran']
    });

    const statusMap = {
      'pending': 0,
      'terdaftar': 0,
      'selesai': 0
    };
    statusPendaftaran.forEach(item => {
      statusMap[item.status_pendaftaran] = parseInt(item.dataValues.jumlah);
    });

    // 3. Pelatihan Daring vs Luring
    const pelatihanDaringLuring = await Pelatihan.findAll({
      attributes: [
        'daring',
        [db.fn('COUNT', db.col('pelatihan_id')), 'jumlah']
      ],
      group: ['daring']
    });

    const daringLuringData = [0, 0]; // [daring, luring]
    pelatihanDaringLuring.forEach(item => {
      if (item.daring) {
        daringLuringData[0] = parseInt(item.dataValues.jumlah);
      } else {
        daringLuringData[1] = parseInt(item.dataValues.jumlah);
      }
    });

    res.json({
      pendaftaranPerBulan: {
        categories,
        series: [{ name: "Pendaftaran", data: seriesData }]
      },
      statusPendaftaran: {
        labels: ["Pending", "Terdaftar", "Selesai"],
        series: [statusMap.pending, statusMap.terdaftar, statusMap.selesai]
      },
      pelatihanDaringLuring: {
        categories: ["Daring", "Luring"],
        series: [{ name: "Jumlah", data: daringLuringData }]
      }
    });
  } catch (error) {
    console.error("❌ Error getting chart data:", error);
    res.status(500).json({
      message: "Gagal mengambil data chart",
      error: error.message
    });
  }
};

// GET Recent Trainings
exports.getRecentTrainings = async (req, res) => {
  try {
    const pelatihan = await Pelatihan.findAll({
      limit: 5,
      order: [['tanggal_pelatihan', 'DESC']],
      include: [
        {
          model: Pengguna,
          as: 'mitra',
          attributes: ['pengguna_id'],
          include: [{
            model: DataMitra,
            as: 'data_mitra',
            attributes: ['nama_mitra']
          }]
        }
      ]
    });

    // Get participant count for each training
    const result = await Promise.all(pelatihan.map(async (p) => {
      const jumlahPeserta = await PesertaPelatihan.count({
        where: { pelatihan_id: p.pelatihan_id }
      });

      return {
        pelatihan_id: p.pelatihan_id,
        nama: p.nama_pelatihan,
        tanggal: p.tanggal_pelatihan,
        thumbnail_url: p.thumbnail_url,
        daring: p.daring,
        mitra: p.mitra?.data_mitra?.nama_mitra || null,
        jumlah_peserta: jumlahPeserta
      };
    }));

    res.json(result);
  } catch (error) {
    console.error("❌ Error getting recent trainings:", error);
    res.status(500).json({
      message: "Gagal mengambil data pelatihan terbaru",
      error: error.message
    });
  }
};

// GET Pending Participants
exports.getPendingParticipants = async (req, res) => {
  try {
    const pendingParticipants = await PesertaPelatihan.findAll({
      where: {
        status_pendaftaran: 'pending'
      },
      limit: 10,
      order: [['tanggal_pendaftaran', 'DESC']],
      include: [
        {
          model: Pengguna,
          as: 'peserta',
          attributes: ['pengguna_id', 'email'],
          include: [{
            model: DataPeserta,
            as: 'data_peserta',
            attributes: ['nama_lengkap', 'no_telp']
          }]
        },
        {
          model: Pelatihan,
          as: 'pelatihan',
          attributes: ['pelatihan_id', 'nama_pelatihan']
        }
      ]
    });

    const result = pendingParticipants.map(p => ({
      id: p.id,
      pelatihan_id: p.pelatihan_id,
      pelatihan_nama: p.pelatihan?.nama_pelatihan || '-',
      nama_lengkap: p.peserta?.data_peserta?.nama_lengkap || '-',
      email: p.peserta?.email || '-',
      no_telp: p.peserta?.data_peserta?.no_telp || '-',
      tanggal_pendaftaran: p.tanggal_pendaftaran
    }));

    res.json(result);
  } catch (error) {
    console.error("❌ Error getting pending participants:", error);
    res.status(500).json({
      message: "Gagal mengambil data peserta pending",
      error: error.message
    });
  }
};

module.exports = exports;