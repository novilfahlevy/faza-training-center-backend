// /home/novilfahlevy/Projects/faza-training-center-backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pengguna, DataPeserta, DataMitra } = require('../models');
const Env = require('../config/env');

// Login untuk admin dan mitra
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const pengguna = await Pengguna.findOne({ where: { email } });
    if (!pengguna) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Hanya admin dan mitra yang bisa login melalui endpoint ini
    if (pengguna.role === 'peserta') {
      return res.status(401).json({ message: 'Email atau password salah' });
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

// Login khusus untuk peserta
exports.loginPeserta = async (req, res) => {
  try {
    const { email, password } = req.body;

    const pengguna = await Pengguna.findOne({
      where: { email },
      include: [{
        model: DataPeserta,
        as: 'data_peserta',
        attributes: ['nama_lengkap']
      }]
    });
    
    if (!pengguna) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    if (pengguna.role !== 'peserta') {
      return res.status(401).json({ message: 'Email atau password salah.' });
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
        nama_lengkap: pengguna.data_peserta.nama_lengkap,
        email: pengguna.email,
        role: pengguna.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// Registrasi pengguna baru
exports.register = async (req, res) => {
  try {
    const { email, password, role, ...dataDiri } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat pengguna baru
    const newPengguna = await Pengguna.create({
      email,
      password_hash: hashedPassword,
      role,
    });

    let dataTambahan = null;

    // Jika role 'peserta', buat data_peserta
    if (role === 'peserta') {
      const newDataPeserta = await DataPeserta.create({
        ...dataDiri,
        pengguna_id: newPengguna.pengguna_id,
      });
      dataTambahan = newDataPeserta;
    } 
    // Jika role 'mitra', buat data_mitra
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
        [role]: dataTambahan,
      },
    });
  } catch (error) {
    console.error("❌ Gagal registrasi:", error);
    res.status(500).json({ message: 'Gagal mendaftarkan pengguna', error: error.message });
  }
};