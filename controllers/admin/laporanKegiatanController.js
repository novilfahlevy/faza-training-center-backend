const { LaporanKegiatan, Pengguna, DataPeserta, DataMitra } = require("../../models");
const { getPagination, getPagingData } = require("../../utils/pagination");
const createSearchCondition = require("../../utils/searchConditions");
const { Op } = require("sequelize");

// CREATE
exports.createLaporanKegiatan = async (req, res) => {
  try {
    // Get pengguna_id from the authenticated user (from authMiddleware)
    const pengguna_id = req.user.pengguna_id;
    const { judul_laporan, isi_laporan, tanggal_laporan } = req.body;

    const newLaporan = await LaporanKegiatan.create({
      judul_laporan,
      isi_laporan,
      tanggal_laporan,
      pengguna_id, // Automatically assigned from logged-in user
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
    const { judul_laporan, isi_laporan, tanggal_laporan } = req.body;

    const laporan = await LaporanKegiatan.findByPk(id);
    if (!laporan) {
      return res.status(404).json({ message: "Laporan kegiatan tidak ditemukan" });
    }

    // Optional: Add a check to ensure only the original uploader or an admin can edit
    if (req.user.role !== 'admin' && laporan.pengguna_id !== req.user.pengguna_id) {
        return res.status(403).json({ message: "Anda tidak memiliki izin untuk mengedit laporan ini." });
    }

    await laporan.update({
      judul_laporan,
      isi_laporan,
      tanggal_laporan,
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


// READ (All) - No changes needed
exports.getAllLaporanKegiatan = async (req, res) => {
  try {
    const { page, size, search } = req.query;
    const { limit, offset } = getPagination(page, size);

    const condition = createSearchCondition(search, LaporanKegiatan.rawAttributes);
    
    if (search && search.trim() !== "") {
      condition[Op.or] = [
        { judul_laporan: { [Op.like]: `%${search}%` } },
        { isi_laporan: { [Op.like]: `%${search}%` } },
        { "$uploader.email$": { [Op.like]: `%${search}%` } },
        { "$uploader.data_peserta.nama_lengkap$": { [Op.like]: `%${search}%` } },
        { "$uploader.data_mitra.nama_mitra$": { [Op.like]: `%${search}%` } },
      ];
    }

    const data = await LaporanKegiatan.findAndCountAll({
      where: condition,
      limit,
      offset,
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
      ],
      order: [["tanggal_laporan", "DESC"]],
    });

    const response = getPagingData(data, page, limit);
    res.json(response);
  } catch (error) {
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