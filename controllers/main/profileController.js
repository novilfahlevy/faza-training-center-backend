const { Pengguna, DataPeserta, DataMitra } = require('../../models');
const makeProfilResponse = require('../../responses/main/profil/profilResponse');

exports.getProfile = async (req, res) => {
  try {
    const penggunaId = req.user.pengguna_id;
    const role = req.user.role;

    let includeOptions = [];
    
    if (role === 'peserta') {
      includeOptions.push({
        model: DataPeserta,
        as: 'data_peserta'
      });
    } else if (role === 'mitra') {
      includeOptions.push({
        model: DataMitra,
        as: 'data_mitra'
      });
    }

    const pengguna = await Pengguna.findByPk(penggunaId, {
      include: includeOptions,
      attributes: { exclude: ['password_hash'] }
    });

    if (!pengguna) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    const response = makeProfilResponse({
      user: pengguna,
      peserta: pengguna.data_peserta || null
    });

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data profil', error: error.message });
  }
};

// Update profile peserta
exports.getProfile = async (req, res) => {
  try {
    const penggunaId = req.user.pengguna_id;
    const role = req.user.role;

    // Hanya peserta yang boleh akses profil
    if (role !== "peserta") {
      return res.status(403).json({
        status: "error",
        message: "Profil hanya tersedia untuk peserta."
      });
    }

    const pengguna = await Pengguna.findByPk(penggunaId, {
      include: [
        {
          model: DataPeserta,
          as: "data_peserta"
        }
      ],
      attributes: { exclude: ["password_hash"] }
    });

    if (!pengguna) {
      return res.status(404).json({
        status: "error",
        message: "Pengguna tidak ditemukan"
      });
    }

    const profile = makeProfilResponse({
      user: pengguna,
      peserta: pengguna.data_peserta || null
    });

    return res.json(profile);

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data profil",
      error: error.message
    });
  }
};

// Update profile mitra
exports.updateProfilePeserta = async (req, res) => {
  try {
    const penggunaId = req.user.pengguna_id;
    const role = req.user.role;

    // Hanya peserta yang boleh update profil peserta
    if (role !== "peserta") {
      return res.status(403).json({
        status: "error",
        message: "Hanya peserta yang dapat memperbarui profil peserta."
      });
    }

    const allowedFields = [
      'no_telp', 'nama_lengkap', 'tempat_lahir', 'tanggal_lahir',
      'jenis_kelamin', 'alamat', 'profesi', 'instansi', 'no_reg_kes'
    ];

    const payload = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    const [updated] = await DataPeserta.update(payload, {
      where: { pengguna_id: penggunaId }
    });

    if (!updated) {
      return res.json({
        message: "Profil peserta berhasil diperbarui"
      });
    }

    const updatedData = await DataPeserta.findOne({
      where: { pengguna_id: penggunaId }
    });

    return res.json({
      status: "success",
      message: "Profil peserta berhasil diperbarui",
      data: updatedData
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Gagal memperbarui profil peserta",
      error: error.message
    });
  }
};

// Update email pengguna
exports.updateEmail = async (req, res) => {
  try {
    const penggunaId = req.user.pengguna_id;
    const { email } = req.body;

    const [updated] = await Pengguna.update({ email }, {
      where: { pengguna_id: penggunaId },
    });

    if (!updated)
      return res.json({ message: 'Email berhasil diperbarui' });

    res.json({
      message: 'Email berhasil diperbarui',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal memperbarui email',
      error: error.message,
    });
  }
};

// Update password pengguna
exports.updatePassword = async (req, res) => {
  try {
    const penggunaId = req.user.pengguna_id;
    const { current_password, new_password } = req.body;
    
    const bcrypt = require('bcryptjs');
    
    // Verifikasi password lama
    const pengguna = await Pengguna.findByPk(penggunaId);
    const isPasswordValid = await bcrypt.compare(current_password, pengguna.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password saat ini salah' });
    }
    
    // Hash password baru
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    // Update password
    const [updated] = await Pengguna.update({ 
      password_hash: hashedPassword 
    }, {
      where: { pengguna_id: penggunaId },
    });

    if (!updated)
      return res.json({ message: 'Password berhasil diperbarui' });

    res.json({
      message: 'Password berhasil diperbarui',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal memperbarui password',
      error: error.message,
    });
  }
};