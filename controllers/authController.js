const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pengguna, DataPeserta, DataMitra } = require('../models'); // 🔹 Impor model baru
const Env = require('../config/env');

// Login (tidak banyak perubahan)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const pengguna = await Pengguna.findOne({ where: { email } });
    if (!pengguna) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    if (pengguna.role == 'peserta') {
      return res.status(403).json({ message: 'Hanya admin dan mitra yang dapat mengakses halaman ini.' });
    }

    const isPasswordValid = await bcrypt.compare(password, pengguna.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { user_id: pengguna.pengguna_id, role: pengguna.role },
      Env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        user_id: pengguna.pengguna_id,
        email: pengguna.email,
        role: pengguna.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// Register (direvisi total)
exports.register = async (req, res) => {
  try {
    const { email, password, role, ...dataDiri } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Buat pengguna baru
    const newPengguna = await Pengguna.create({
      email,
      password_hash: hashedPassword,
      role,
    });

    let dataTambahan = null;

    // 2. Jika role 'peserta', buat data_peserta
    if (role === 'peserta') {
      const newDataPeserta = await DataPeserta.create({
        ...dataDiri,
        pengguna_id: newPengguna.pengguna_id,
      });
      dataTambahan = newDataPeserta;
    } 
    // 3. Jika role 'mitra', buat data_mitra
    else if (role === 'mitra') {
      const newDataMitra = await DataMitra.create({
        ...dataDiri,
        pengguna_id: newPengguna.pengguna_id,
      });
      dataTambahan = newDataMitra;
    }

    res.status(201).json({
      message: 'Registrasi berhasil',
      data: {
        pengguna: { user_id: newPengguna.pengguna_id, email: newPengguna.email, role: newPengguna.role },
        [role]: dataTambahan, // Kembalikan data_peserta atau data_mitra
      },
    });
  } catch (error) {
    console.error("❌ Gagal registrasi:", error);
    res.status(500).json({ message: 'Gagal mendaftarkan pengguna', error: error.message });
  }
};