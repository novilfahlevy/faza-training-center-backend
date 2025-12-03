const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Pengguna, DataPeserta, DataMitra } = require('../models');
const Env = require('../config/env');
const { sendVerificationEmail } = require('../config/email'); // Impor fungsi email

// Login untuk admin dan mitra
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const pengguna = await Pengguna.findOne({ where: { email } });
    if (!pengguna) {
      return res.status(404).json({ message: 'Akun tidak ditemukan. Silakan daftar.' });
    }

    // Hanya admin dan mitra yang bisa login melalui endpoint ini
    if (pengguna.role === 'peserta') {
      return res.status(401).json({ message: 'Akses tidak diizinkan pada endpoint ini' });
    }

    const isPasswordValid = await bcrypt.compare(password, pengguna.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password tidak tepat' });
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
    console.error('❌ Login error (admin/mitra):', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// Login khusus untuk peserta
exports.loginPeserta = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    const pengguna = await Pengguna.findOne({
      where: { email },
      include: [{
        model: DataPeserta,
        as: 'data_peserta',
        attributes: ['nama_lengkap']
      }]
    });

    if (!pengguna) {
      return res.status(404).json({ message: 'Akun peserta tidak ditemukan. Silakan daftar.' });
    }

    if (pengguna.role !== 'peserta') {
      return res.status(401).json({ message: 'Akses hanya untuk peserta' });
    }

    // Jika peserta belum verifikasi email, beri tahu dengan jelas
    if (pengguna.is_verified === false) {
      return res.status(403).json({ message: 'Akun belum diverifikasi. Silakan periksa email Anda untuk verifikasi.' });
    }

    const isPasswordValid = await bcrypt.compare(password, pengguna.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password tidak tepat' });
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
        nama_lengkap: pengguna.data_peserta?.nama_lengkap || null,
        email: pengguna.email,
        role: pengguna.role,
      },
    });
  } catch (error) {
    console.error('❌ Login peserta error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// Registrasi pengguna baru
exports.register = async (req, res) => {
  try {
    const { email, password, role, ...dataDiri } = req.body || {};

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, dan role wajib diisi' });
    }

    // Cek apakah email sudah terdaftar
    const existing = await Pengguna.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email sudah terdaftar. Silakan login atau gunakan email lain.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat pengguna baru
    const newPengguna = await Pengguna.create({
      email,
      password_hash: hashedPassword,
      role,
      is_verified: role === 'peserta' ? false : true, // Admin & mitra dianggap sudah verified
      email_verification_token: role === 'peserta' ? crypto.randomBytes(32).toString('hex') : null,
    });

    let dataTambahan = null;

    try {
      // Jika role 'peserta', buat data_peserta dan kirim email verifikasi
      if (role === 'peserta') {
        const newDataPeserta = await DataPeserta.create({
          ...dataDiri,
          pengguna_id: newPengguna.pengguna_id,
        });
        dataTambahan = newDataPeserta;

        // Kirim email verifikasi
        try {
          await sendVerificationEmail(newPengguna, newPengguna.email_verification_token, dataTambahan.nama_lengkap);
        } catch (emailError) {
          // Jika email gagal dikirim, hapus user yang baru dibuat untuk menjaga konsistensi
          await Pengguna.destroy({ where: { pengguna_id: newPengguna.pengguna_id } });
          await DataPeserta.destroy({ where: { pengguna_id: newPengguna.pengguna_id } });
          return res.status(500).json({ message: 'Registrasi gagal. Tidak dapat mengirim email verifikasi.', error: emailError.message });
        }
      }

      // Jika role 'mitra', buat data_mitra
      else if (role === 'mitra') {
        const newDataMitra = await DataMitra.create({
          ...dataDiri,
          pengguna_id: newPengguna.pengguna_id,
        });
        dataTambahan = newDataMitra;
      }

    } catch (innerError) {
      // Jika pembuatan data tambahan gagal, hapus pengguna yang sudah dibuat
      try {
        await Pengguna.destroy({ where: { pengguna_id: newPengguna.pengguna_id } });
      } catch (cleanupErr) {
        console.error('❌ Gagal membersihkan pengguna setelah error:', cleanupErr);
      }
      console.error('❌ Gagal membuat data tambahan saat registrasi:', innerError);
      return res.status(500).json({ message: 'Gagal membuat data pengguna. Silakan coba lagi.', error: innerError.message });
    }

    res.status(201).json({
      message: role === 'peserta'
        ? 'Registrasi berhasil! Silakan periksa email Anda untuk verifikasi.'
        : 'Registrasi berhasil.',
      data: {
        pengguna: { user_id: newPengguna.pengguna_id, email: newPengguna.email, role: newPengguna.role },
        [role]: dataTambahan,
      },
    });
  } catch (error) {
    console.error('❌ Gagal registrasi:', error);
    res.status(500).json({ message: 'Gagal mendaftarkan pengguna', error: error.message });
  }
};

// ... impor dan fungsi lainnya tetap sama

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const pengguna = await Pengguna.findOne({ where: { email_verification_token: token } });

    if (!pengguna) {
      // 🔹 JIKA TOKEN TIDAK VALID, ALIHKAN KE HALAMAN GAGAL DI FRONTEND
      return res.redirect(`${process.env.FRONTEND_URL}/register?verification_status=failure`);
    }

    // Update status pengguna
    await pengguna.update({
      is_verified: true,
      email_verification_token: null, // Hapus token setelah digunakan
      verified_at: new Date(),
    });

    // 🔹 JIKA VERIFIKASI BERHASIL, ALIHKAN KE HALAMAN SUKSES DI FRONTEND
    return res.redirect(`${process.env.FRONTEND_URL}/login?verification_status=success`);

  } catch (error) {
    console.error("❌ Gagal verifikasi email:", error);
    // Untuk error server, Anda bisa tetap mengembalikan JSON atau mengalihkan ke halaman error umum
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};