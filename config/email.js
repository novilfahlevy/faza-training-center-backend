const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Baca template HTML dari file
const templatePath = path.join(__dirname, '../views/emails/verificationEmail.html');
const emailTemplate = fs.readFileSync(templatePath, 'utf8');

// Buat transporter menggunakan SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // Contoh: 'smtp.gmail.com'
  port: process.env.EMAIL_PORT, // Contoh: 587
  secure: false, // true untuk port 465, false untuk port lainnya
  auth: {
    user: process.env.EMAIL_USER, // Email pengirim
    pass: process.env.EMAIL_PASS, // Password atau App Password email pengirim
  },
});

/**
 * Fungsi untuk mengirim email verifikasi
 * @param {object} user - Objek user dari model Pengguna
 * @param {string} token - Token verifikasi
 * @param {string} userName - Nama lengkap user (opsional)
 */
const sendVerificationEmail = async (user, token, userName = 'Pengguna') => {
  // Buat URL verifikasi
  // Pastikan APP_URL di .env menunjuk ke URL backend Anda
  const verificationUrl = `${process.env.APP_URL}/api/v1/auth/verify-email?token=${token}`;

  // Ganti placeholder di template dengan data aktual
  const htmlContent = emailTemplate
    .replace(/{{userName}}/g, userName)
    .replace(/{{verificationUrl}}/g, verificationUrl);

  const mailOptions = {
    from: `"Faza Training Center" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Verifikasi Email Akun Anda',
    html: htmlContent, // Gunakan konten HTML dari template
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email verifikasi berhasil dikirim ke ${user.email}`);
  } catch (error) {
    console.error('Gagal mengirim email verifikasi:', error);
    // Lempar error agar bisa ditangkap di controller
    throw new Error('Gagal mengirim email verifikasi.');
  }
};

module.exports = { sendVerificationEmail };