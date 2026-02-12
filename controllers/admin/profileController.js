const { Pengguna, DataMitra, PlatformSettings } = require('../../models');

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

    const { nama_mitra, deskripsi_mitra, visi_misi, alamat_mitra, telepon_mitra, website_mitra, logo_mitra } = req.body;

    await DataMitra.update({
      nama_mitra,
      deskripsi_mitra,
      visi_misi,
      alamat_mitra,
      telepon_mitra,
      website_mitra,
      logo_mitra
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

// Get platform settings - untuk kontak info
exports.getPlatformSettings = async (req, res) => {
  try {
    // Get or create default record
    let settings = await PlatformSettings.findByPk(1);
    
    if (!settings) {
      settings = await PlatformSettings.create({
        setting_id: 1,
        whatsapp_number: '+62 852-1331-4700',
        email: 'fazatrainingcenter@gmail.com',
        address: 'Jl. Contoh No. 123, Jakarta Selatan, Indonesia'
      });
    }

    return res.json({
      status: "success",
      data: settings
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: 'Gagal mengambil pengaturan platform',
      error: error.message
    });
  }
};

// Update platform settings - hanya untuk admin
exports.updatePlatformSettings = async (req, res) => {
  try {
    const role = req.user.role;

    if (role !== 'admin') {
      return res.status(403).json({
        status: "error",
        message: 'Hanya admin yang dapat mengupdate pengaturan platform'
      });
    }

    const { whatsapp_number, email, address } = req.body;

    // Validasi nomor WhatsApp
    if (whatsapp_number && !whatsapp_number.startsWith('62')) {
      return res.status(400).json({
        status: "error",
        message: 'Nomor WhatsApp harus dimulai dengan 62'
      });
    }

    // Ensure at least one record exists
    let settings = await PlatformSettings.findByPk(1);
    if (!settings) {
      settings = await PlatformSettings.create({
        setting_id: 1,
        whatsapp_number,
        email,
        address
      });
    } else {
      await PlatformSettings.update({
        whatsapp_number,
        email,
        address
      }, {
        where: { setting_id: 1 }
      });
    }

    const updatedSettings = await PlatformSettings.findByPk(1);

    return res.json({
      status: "success",
      message: 'Pengaturan platform berhasil diperbarui',
      data: updatedSettings
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: 'Gagal memperbarui pengaturan platform',
      error: error.message
    });
  }
};
