const { LaporanKegiatan, Pengguna, DataPeserta, DataMitra, Pelatihan, Sertifikat } = require("../../models");
const { getPagination, getPagingData } = require("../../utils/pagination");
const createSearchCondition = require("../../utils/searchConditions");
const { Op, fn, where, col } = require("sequelize");

// GET STATISTICS
exports.getStatistics = async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total Laporan
    const totalLaporan = await LaporanKegiatan.count();

    // Pelatihan Selesai (Bulan Ini) - tanggal_pelatihan < hari ini dan status 'final'
    const pelatihanSelesaiMonth = await LaporanKegiatan.count({
      where: {
        status: 'final',
      },
      include: [
        {
          model: Pelatihan,
          as: 'pelatihan',
          required: true,
          where: {
            tanggal_pelatihan: {
              [Op.lt]: now, // tanggal_pelatihan < hari ini
              [Op.gte]: firstDayOfMonth, // tanggal_pelatihan >= awal bulan
            },
          },
          attributes: [], // tidak perlu attribute
        },
      ],
    });

    // Total Sertifikat Diterbitkan
    const totalSertifikat = await Sertifikat.count();

    res.json({
      totalLaporan,
      pelatihanSelesaiMonth,
      totalSertifikat,
    });
  } catch (error) {
    console.error("❌ Error getStatistics:", error);
    res.status(500).json({
      message: "Gagal mengambil statistik",
      error: error.message,
    });
  }
};

// CREATE
exports.createLaporanKegiatan = async (req, res) => {
  try {
    // Get pengguna_id from the authenticated user (from authMiddleware)
    const pengguna_id = req.user.pengguna_id;
    const { judul_laporan, isi_laporan, tanggal_laporan, pelatihan_id, status } = req.body;

    // Validate pelatihan_id is required for new reports
    if (!pelatihan_id) {
      return res.status(400).json({ message: "Pelatihan wajib dipilih" });
    }

    // Verify that pelatihan exists
    const pelatihan = await Pelatihan.findByPk(pelatihan_id);
    if (!pelatihan) {
      return res.status(404).json({ message: "Pelatihan tidak ditemukan" });
    }

    const newLaporan = await LaporanKegiatan.create({
      judul_laporan,
      isi_laporan,
      tanggal_laporan,
      pengguna_id, // Automatically assigned from logged-in user
      pelatihan_id,
      status: status || 'draft', // Default to 'draft' if not provided
    });

    res.status(201).json({
      message: "Laporan kegiatan berhasil dibuat",
      laporan_id: newLaporan.laporan_id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal membuat laporan kegiatan",
      error: error.message,
    });
  }
};

// UPDATE
exports.updateLaporanKegiatan = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul_laporan, isi_laporan, tanggal_laporan, pelatihan_id, status } = req.body;

    const laporan = await LaporanKegiatan.findByPk(id);
    if (!laporan) {
      return res.status(404).json({ message: "Laporan kegiatan tidak ditemukan" });
    }

    // Optional: Add a check to ensure only the original uploader or an admin can edit
    if (req.user.role !== 'admin' && laporan.pengguna_id !== req.user.pengguna_id) {
        return res.status(403).json({ message: "Anda tidak memiliki izin untuk mengedit laporan ini." });
    }

    // Verify pelatihan exists if provided
    if (pelatihan_id) {
      const pelatihan = await Pelatihan.findByPk(pelatihan_id);
      if (!pelatihan) {
        return res.status(404).json({ message: "Pelatihan tidak ditemukan" });
      }
    }

    await laporan.update({
      judul_laporan,
      isi_laporan,
      tanggal_laporan,
      ...(pelatihan_id !== undefined && { pelatihan_id }),
      ...(status && { status }),
    });

    res.status(200).json({ message: "Laporan kegiatan berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({
      message: "Gagal memperbarui laporan kegiatan",
      error: error.message,
    });
  }
};

// DELETE
exports.deleteLaporanKegiatan = async (req, res) => {
    try {
        const { id } = req.params;
        
        const laporan = await LaporanKegiatan.findByPk(id);
        if (!laporan) {
            return res.status(404).json({ message: "Laporan kegiatan tidak ditemukan" });
        }

        // Optional: Add a check to ensure only the original uploader or an admin can delete
        if (req.user.role !== 'admin' && laporan.pengguna_id !== req.user.pengguna_id) {
            return res.status(403).json({ message: "Anda tidak memiliki izin untuk menghapus laporan ini." });
        }

        await laporan.destroy();
        
        res.json({ message: "Laporan kegiatan berhasil dihapus" });
    } catch (error) {
        res.status(500).json({
            message: "Gagal menghapus laporan kegiatan",
            error: error.message,
        });
    }
};


// READ (All)
exports.getAllLaporanKegiatan = async (req, res) => {
  try {
    const { page, size, search, status } = req.query;
    const { limit, offset } = getPagination(page, size);

    // Build the WHERE condition
    let whereConditions = [];
    
    // Add status filter if provided
    if (status && (status === 'draft' || status === 'final')) {
      whereConditions.push({ status });
    }
    
    // Build search condition with proper OR logic
    if (search && search.trim() !== "") {
      const searchTerm = `%${search}%`;
      whereConditions.push({
        [Op.or]: [
          { judul_laporan: { [Op.like]: searchTerm } },
          { isi_laporan: { [Op.like]: searchTerm } },
          where(fn('DATE_FORMAT', col('laporan_kegiatan.tanggal_laporan'), '%Y-%m-%d'), Op.like, searchTerm),
          { "$uploader.email$": { [Op.like]: searchTerm } },
          { "$uploader.data_peserta.nama_lengkap$": { [Op.like]: searchTerm } },
          { "$uploader.data_mitra.nama_mitra$": { [Op.like]: searchTerm } },
          { "$pelatihan.nama_pelatihan$": { [Op.like]: searchTerm } },
          { "$pelatihan.mitra_pelatihan.data_mitra.nama_mitra$": { [Op.like]: searchTerm } },
          { status: { [Op.like]: searchTerm } },
        ]
      });
    }

    // Build final WHERE clause using AND for multiple conditions
    const whereClause = whereConditions.length > 0 
      ? (whereConditions.length === 1 ? whereConditions[0] : { [Op.and]: whereConditions })
      : {};

    const data = await LaporanKegiatan.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      subQuery: false,
      include: [
        {
          model: Pengguna,
          as: "uploader",
          attributes: ["pengguna_id", "email", "role"],
          required: false,
          include: [
            {
              model: DataPeserta,
              as: "data_peserta",
              attributes: ["nama_lengkap"],
              required: false,
            },
            {
              model: DataMitra,
              as: "data_mitra",
              attributes: ["nama_mitra"],
              required: false,
            },
          ],
        },
        {
          model: Pelatihan,
          as: "pelatihan",
          attributes: ["pelatihan_id", "nama_pelatihan"],
          required: false,
          include: [
            {
              model: Pengguna,
              as: "mitra_pelatihan",
              attributes: ["pengguna_id"],
              required: false,
              include: [
                {
                  model: DataMitra,
                  as: "data_mitra",
                  attributes: ["nama_mitra"],
                  required: false,
                },
              ],
              through: { attributes: ["role_mitra"] },
            },
          ],
        },
      ],
      order: [["tanggal_laporan", "DESC"]],
    });

    const response = getPagingData(data, page, limit);
    res.json(response);
  } catch (error) {
    console.error("❌ Error getAllLaporanKegiatan:", error);
    res.status(500).json({
      message: "Gagal mengambil data laporan kegiatan",
      error: error.message,
    });
  }
};

// READ (By ID) - No changes needed
exports.getLaporanKegiatanById = async (req, res) => {
  try {
    const laporan = await LaporanKegiatan.findByPk(req.params.id, {
      include: [
        {
          model: Pengguna,
          as: "uploader",
          attributes: ["pengguna_id", "email", "role"],
          include: [
            {
              model: DataPeserta,
              as: "data_peserta",
              attributes: ["nama_lengkap"],
              required: false,
            },
            {
              model: DataMitra,
              as: "data_mitra",
              attributes: ["nama_mitra"],
              required: false,
            },
          ],
        },
        {
          model: Pelatihan,
          as: "pelatihan",
          attributes: ["pelatihan_id", "nama_pelatihan"],
          required: false,
          include: [
            {
              model: Pengguna,
              as: "mitra_pelatihan",
              attributes: ["pengguna_id"],
              include: [
                {
                  model: DataMitra,
                  as: "data_mitra",
                  attributes: ["nama_mitra"],
                },
              ],
              through: { attributes: ["role_mitra"] },
            },
          ],
        },
      ],
    });

    if (!laporan) {
      return res.status(404).json({ message: "Laporan kegiatan tidak ditemukan" });
    }

    res.json(laporan);
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data laporan kegiatan",
      error: error.message,
    });
  }
};