const { Pengguna, DataMitra } = require("../../models");
const makeListOptionsResponse = require("../../responses/admin/mitra/listOptionsResponse");

/**
 * Mengambil daftar semua mitra untuk digunakan sebagai opsi (dropdown/select).
 * Response akan berupa array of objects dengan format { id, nama }.
 */
exports.getMitraOptions = async (req, res) => {
  try {
    const mitraList = await Pengguna.findAll({
      where: {
        role: 'mitra',
      },
      include: [
        {
          model: DataMitra,
          as: 'data_mitra',
          required: true,
          attributes: ['nama_mitra'],
        },
      ],
      attributes: ['pengguna_id'],
      order: [[{ model: DataMitra, as: 'data_mitra' }, 'nama_mitra', 'ASC']],
    });

    const options = mitraList.map(mitra => makeListOptionsResponse(mitra));

    res.json(options);
  } catch (error) {
    console.error("❌ Error saat mengambil opsi mitra:", error);
    res.status(500).json({
      message: "Gagal mengambil data mitra",
      error: error.message,
    });
  }
};