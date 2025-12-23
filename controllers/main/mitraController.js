// /home/novilfahlevy/Projects/faza-training-center-backend/controllers/main/mitraController.js
const { DataMitra, Pengguna } = require('../../models');
const { getPagination, getPagingData } = require('../../utils/pagination');
const { Op } = require('sequelize');
const Env = require('../../config/env');

// GET - Daftar semua mitra
exports.getAllMitra = async (req, res) => {
  try {
    const { page = 1, size = 12, search = '' } = req.query;
    const { limit, offset } = getPagination(page, size);

    // Kondisi pencarian
    let condition = {};
    if (search) {
      condition = {
        [Op.or]: [
          { nama_mitra: { [Op.like]: `%${search}%` } },
          { deskripsi_mitra: { [Op.like]: `%${search}%` } },
          { alamat_mitra: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const data = await DataMitra.findAndCountAll({
      where: condition,
      include: [
        {
          model: Pengguna,
          as: 'pengguna',
          attributes: ['email'],
          required: false,
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [['mitra_id', 'DESC']],
    });

    // Format response dan tambahkan full URL untuk logo
    const records = data.rows.map(mitra => {
      const mitraData = mitra.toJSON();
      
      // Lengkapi URL logo jika ada
      if (mitraData.logo_mitra) {
        mitraData.logo_mitra = `${Env.APP_URL.replace(/\/$/, '')}/${mitraData.logo_mitra.replace(/^\//, '')}`;
      }
      
      return mitraData;
    });

    const response = getPagingData({ rows: records, count: data.count }, page, limit);

    res.json(response);
  } catch (error) {
    console.error('❌ Gagal mengambil data mitra:', error);
    res.status(500).json({
      message: 'Gagal mengambil data mitra',
      error: error.message,
    });
  }
};

// GET - Detail mitra berdasarkan ID
exports.getMitraById = async (req, res) => {
  try {
    const { id } = req.params;

    const mitra = await DataMitra.findByPk(id, {
      include: [
        {
          model: Pengguna,
          as: 'pengguna',
          attributes: ['email'],
          required: false,
        },
      ],
    });

    if (!mitra) {
      return res.status(404).json({ message: 'Mitra tidak ditemukan' });
    }

    const mitraData = mitra.toJSON();
    
    // Lengkapi URL logo jika ada
    if (mitraData.logo_mitra) {
      mitraData.logo_mitra = `${Env.APP_URL.replace(/\/$/, '')}/${mitraData.logo_mitra.replace(/^\//, '')}`;
    }

    res.json(mitraData);
  } catch (error) {
    console.error('❌ Gagal mengambil detail mitra:', error);
    res.status(500).json({
      message: 'Gagal mengambil detail mitra',
      error: error.message,
    });
  }
};
