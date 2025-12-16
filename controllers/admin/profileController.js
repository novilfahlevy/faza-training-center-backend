const { Pengguna, DataMitra } = require('../../models');

exports.getProfile = async (req, res) => {
  try {
    const penggunaId = req.user.pengguna_id;
    const role = req.user.role;

    let includeOptions = [];
    
    if (role === 'mitra') {
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
      return res.status(404).json({ 
        status: "error",
        message: 'Pengguna tidak ditemukan' 
      });
    }

    return res.json({
      status: "success",
      data: pengguna
    });
  } catch (error) {
    return res.status(500).json({ 
      status: "error",
      message: 'Gagal mengambil data profil', 
      error: error.message 
    });
  }
};

// Update email - untuk admin dan mitra
exports.updateEmail = async (req, res) => {
  try {
    const penggunaId = req.user.pengguna_id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: 'Email harus diisi'
      });
    }

    // Check if email already exists
    const existingEmail = await Pengguna.findOne({
      where: { email },
      attributes: ['pengguna_id']
    });

    if (existingEmail && existingEmail.pengguna_id !== penggunaId) {
      return res.status(400).json({
        status: "error",
        message: 'Email sudah digunakan'
      });
    }

    await Pengguna.update({ email }, {
      where: { pengguna_id: penggunaId },
    });

    return res.json({
      status: "success",
      message: 'Email berhasil diperbarui',
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: 'Gagal memperbarui email',
      error: error.message,
    });
  }
};

// Update password - untuk admin dan mitra
exports.updatePassword = async (req, res) => {
  try {
    const penggunaId = req.user.pengguna_id;
    const { current_password, new_password } = req.body;
    
    const bcrypt = require('bcryptjs');
    
    if (!current_password || !new_password) {
      return res.status(400).json({
        status: "error",
        message: 'Password saat ini dan password baru harus diisi'
      });
    }

    // Verifikasi password lama
    const pengguna = await Pengguna.findByPk(penggunaId);
    if (!pengguna) {
      return res.status(404).json({
        status: "error",
        message: 'Pengguna tidak ditemukan'
      });
    }

    const isPasswordValid = await bcrypt.compare(current_password, pengguna.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        status: "error",
        message: 'Password saat ini salah' 
      });
    }
    
    // Hash password baru
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    // Update password
    await Pengguna.update({ 
      password_hash: hashedPassword 
    }, {
      where: { pengguna_id: penggunaId },
    });

    return res.json({
      status: "success",
      message: 'Password berhasil diperbarui',
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: 'Gagal memperbarui password',
      error: error.message,
    });
  }
};

// Update data mitra - hanya untuk mitra
exports.updateMitra = async (req, res) => {
  try {
    const penggunaId = req.user.pengguna_id;
    const role = req.user.role;

    if (role !== 'mitra') {
      return res.status(403).json({
        status: "error",
        message: 'Hanya mitra yang dapat mengupdate data mitra'
      });
    }

    const { nama_mitra, deskripsi_mitra, alamat_mitra, telepon_mitra, website_mitra } = req.body;

    await DataMitra.update({
      nama_mitra,
      deskripsi_mitra,
      alamat_mitra,
      telepon_mitra,
      website_mitra
    }, {
      where: { pengguna_id: penggunaId }
    });

    const updatedMitra = await DataMitra.findOne({
      where: { pengguna_id: penggunaId }
    });

    return res.json({
      status: "success",
      message: 'Data mitra berhasil diperbarui',
      data: updatedMitra
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: 'Gagal memperbarui data mitra',
      error: error.message
    });
  }
};
