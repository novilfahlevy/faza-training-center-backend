const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pengguna } = require('../models');

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari pengguna berdasarkan email
    const pengguna = await Pengguna.findOne({ where: { email } });
    if (!pengguna) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Bandingkan password yang dimasukkan dengan hash di database
    const isPasswordValid = await bcrypt.compare(password, pengguna.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Buat token JWT
    const token = jwt.sign(
      { user_id: pengguna.user_id, role: pengguna.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token berlaku 1 hari
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        user_id: pengguna.user_id,
        email: pengguna.email,
        role: pengguna.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// Register (opsional, bisa digunakan untuk registrasi calon peserta/ mitra baru)
// Untuk sederhananya, ini hanya membuat user, profil detailnya dibuat oleh admin
exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newPengguna = await Pengguna.create({ email, password_hash: hashedPassword, role });
        res.status(201).json({ message: 'Pengguna berhasil didaftarkan', data: { user_id: newPengguna.user_id, email: newPengguna.email, role: newPengguna.role } });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mendaftarkan pengguna', error: error.message });
    }
}