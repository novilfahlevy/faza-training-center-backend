const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

// Baca template HTML dari file
const verificationTemplatePath = path.join(__dirname, '../views/emails/verificationEmail.html');
const verificationEmailTemplate = fs.readFileSync(verificationTemplatePath, 'utf8');

const registrationTemplatePath = path.join(__dirname, '../views/emails/trainingRegistrationEmail.html');
const registrationEmailTemplate = fs.readFileSync(registrationTemplatePath, 'utf8');

// Baca template notifikasi update status
const statusUpdateTemplatePath = path.join(__dirname, '../views/emails/statusUpdateEmail.html');
const statusUpdateEmailTemplate = fs.readFileSync(statusUpdateTemplatePath, 'utf8');

// Inisialisasi Resend dengan API key
const resend = new Resend(process.env.RESEND_API_KEY);

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
  const htmlContent = verificationEmailTemplate
    .replace(/{{userName}}/g, userName)
    .replace(/{{verificationUrl}}/g, verificationUrl);

  try {
    await resend.emails.send({
      from: 'Faza Training Center <onboarding@resend.dev>',
      to: user.email,
      subject: 'Verifikasi Email Akun Anda',
      html: htmlContent,
    });
    console.log(`Email verifikasi berhasil dikirim ke ${user.email}`);
  } catch (error) {
    console.error('Gagal mengirim email verifikasi:', error);
    // Lempar error agar bisa ditangkap di controller
    throw new Error('Gagal mengirim email verifikasi.');
  }
};

/**
 * Fungsi untuk mengirim email notifikasi pendaftaran pelatihan
 * @param {object} user - Objek user dari model Pengguna
 * @param {object} pelatihan - Objek pelatihan
 * @param {object} pendaftaran - Objek pendaftaran (PesertaPelatihan)
 * @param {string} userName - Nama lengkap user (opsional)
 */
const sendTrainingRegistrationEmail = async (user, pelatihan, pendaftaran, userName = 'Pengguna') => {
  // Buat URL pelatihan
  const trainingUrl = `${process.env.FRONTEND_URL || process.env.APP_URL}/pelatihan/${pelatihan.slug_pelatihan}`;
  
  // Format tanggal
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('id-ID', options);
  };
  
  // Tentukan status dan pesan
  let statusClass = 'pending';
  let statusMessage = 'Pendaftaran Anda sedang dalam proses verifikasi. Anda akan menerima notifikasi lagi setelah pembayaran dikonfirmasi.';
  
  if (pendaftaran.status_pendaftaran === 'terdaftar') {
    statusClass = 'confirmed';
    statusMessage = 'Pendaftaran Anda telah dikonfirmasi. Kami menantikan kehadiran Anda pada pelatihan ini.';
  }
  
  // Ganti placeholder di template dengan data aktual
  const htmlContent = registrationEmailTemplate
    .replace(/{{userName}}/g, userName)
    .replace(/{{trainingName}}/g, pelatihan.nama_pelatihan)
    .replace(/{{trainingDate}}/g, formatDate(pelatihan.tanggal_pelatihan))
    .replace(/{{trainingDuration}}/g, pelatihan.durasi_pelatihan)
    .replace(/{{trainingLocation}}/g, pelatihan.lokasi_pelatihan)
    .replace(/{{registrationDate}}/g, formatDate(pendaftaran.tanggal_pendaftaran))
    .replace(/{{registrationStatus}}/g, pendaftaran.status_pendaftaran === 'pending' ? 'Menunggu Konfirmasi' : 'Terkonfirmasi')
    .replace(/{{statusClass}}/g, statusClass)
    .replace(/{{statusMessage}}/g, statusMessage)
    .replace(/{{trainingUrl}}/g, trainingUrl);

  try {
    await resend.emails.send({
      from: 'Faza Training Center <onboarding@resend.dev>',
      to: user.email,
      subject: `Konfirmasi Pendaftaran: ${pelatihan.nama_pelatihan}`,
      html: htmlContent,
    });
    console.log(`Email notifikasi pendaftaran berhasil dikirim ke ${user.email}`);
  } catch (error) {
    console.error('Gagal mengirim email notifikasi pendaftaran:', error);
    // Lempar error agar bisa ditangkap di controller
    throw new Error('Gagal mengirim email notifikasi pendaftaran.');
  }
};

/**
 * Fungsi untuk mengirim email notifikasi perubahan status pendaftaran
 * @param {object} user - Objek user dari model Pengguna
 * @param {object} pelatihan - Objek pelatihan
 * @param {string} oldStatus - Status pendaftaran sebelumnya
 * @param {string} newStatus - Status pendaftaran yang baru
 * @param {string} userName - Nama lengkap user (opsional)
 */
const sendStatusUpdateEmail = async (user, pelatihan, oldStatus, newStatus, userName = 'Pengguna') => {
  // Buat URL pelatihan
  const trainingUrl = `${process.env.FRONTEND_URL || process.env.APP_URL}/pelatihan/${pelatihan.slug_pelatihan}`;

  // Helper untuk menerjemahkan status dan class CSS
  const getStatusDetails = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Menunggu Konfirmasi', class: 'pending' };
      case 'terdaftar':
        return { text: 'Terkonfirmasi', class: 'terdaftar' };
      case 'selesai':
        return { text: 'Selesai', class: 'selesai' };
      default:
        return { text: status, class: 'pending' };
    }
  };

  const oldStatusDetails = getStatusDetails(oldStatus);
  const newStatusDetails = getStatusDetails(newStatus);

  // Tentukan pesan berdasarkan status baru
  let statusMessage = 'Status pendaftaran Anda telah diperbarui.';
  if (newStatus === 'terdaftar') {
    statusMessage = 'Selamat! Pendaftaran Anda telah dikonfirmasi. Kami menantikan kehadiran Anda pada pelatihan ini.';
  } else if (newStatus === 'selesai') {
    statusMessage = 'Terima kasih telah mengikuti pelatihan ini. Semoga ilmu yang didapat bermanfaat.';
  } else if (newStatus === 'pending') {
    statusMessage = 'Pendaftaran Anda sedang dalam proses verifikasi kembali. Mohon perhatikan notifikasi selanjutnya.';
  }

  // Ganti placeholder di template dengan data aktual
  const htmlContent = statusUpdateEmailTemplate
    .replace(/{{userName}}/g, userName)
    .replace(/{{trainingName}}/g, pelatihan.nama_pelatihan)
    .replace(/{{oldStatusText}}/g, oldStatusDetails.text)
    .replace(/{{oldStatusClass}}/g, oldStatusDetails.class)
    .replace(/{{newStatusText}}/g, newStatusDetails.text)
    .replace(/{{newStatusClass}}/g, newStatusDetails.class)
    .replace(/{{statusMessage}}/g, statusMessage)
    .replace(/{{trainingUrl}}/g, trainingUrl);

  try {
    await resend.emails.send({
      from: 'Faza Training Center <onboarding@resend.dev>',
      to: user.email,
      subject: `Update Status: ${pelatihan.nama_pelatihan}`,
      html: htmlContent,
    });
    console.log(`Email notifikasi status berhasil dikirim ke ${user.email}`);
  } catch (error) {
    console.error('Gagal mengirim email notifikasi status:', error);
    throw new Error('Gagal mengirim email notifikasi status.');
  }
};

module.exports = { 
  sendVerificationEmail,
  sendTrainingRegistrationEmail,
  sendStatusUpdateEmail
};