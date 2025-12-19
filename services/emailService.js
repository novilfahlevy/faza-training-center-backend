// services/emailService.js
const fetch = require('node-fetch');

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'https://faza-training-center-email-service.netlify.app/.netlify/functions/send-email';

const sendEmail = async (type, to, subject, data) => {
  try {
    const response = await fetch(EMAIL_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        to,
        subject,
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Email functions
const sendVerificationEmail = async (user, token, userName = 'Pengguna') => {
  const verificationUrl = `${process.env.APP_URL}/api/v1/auth/verify-email?token=${token}`;
  
  return sendEmail('verification', user.email, 'Verifikasi Email Akun Anda', {
    userName,
    verificationUrl,
  });
};

const sendTrainingRegistrationEmail = async (user, pelatihan, pendaftaran, userName = 'Pengguna') => {
  const trainingUrl = `${process.env.FRONTEND_URL || process.env.APP_URL}/pelatihan/${pelatihan.slug_pelatihan}`;
  
  // Format tanggal
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('id-ID', options);
  };
  
  // Tentukan status dan pesan
  let status = 'pending';
  let statusMessage = 'Pendaftaran Anda sedang dalam proses verifikasi. Anda akan menerima notifikasi lagi setelah pembayaran dikonfirmasi.';
  
  if (pendaftaran.status_pendaftaran === 'terdaftar') {
    status = 'confirmed';
    statusMessage = 'Pendaftaran Anda telah dikonfirmasi. Kami menantikan kehadiran Anda pada pelatihan ini.';
  }
  
  return sendEmail('registration', user.email, `Konfirmasi Pendaftaran: ${pelatihan.nama_pelatihan}`, {
    userName,
    trainingName: pelatihan.nama_pelatihan,
    trainingDate: formatDate(pelatihan.tanggal_pelatihan),
    trainingDuration: pelatihan.durasi_pelatihan,
    trainingLocation: pelatihan.lokasi_pelatihan,
    registrationDate: formatDate(pendaftaran.tanggal_pendaftaran),
    registrationStatus: status === 'pending' ? 'Menunggu Konfirmasi' : 'Terkonfirmasi',
    status,
    statusMessage,
    trainingUrl,
  });
};

const sendStatusUpdateEmail = async (user, pelatihan, oldStatus, newStatus, userName = 'Pengguna') => {
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

  return sendEmail('statusUpdate', user.email, `Update Status: ${pelatihan.nama_pelatihan}`, {
    userName,
    trainingName: pelatihan.nama_pelatihan,
    oldStatusText: oldStatusDetails.text,
    oldStatusClass: oldStatusDetails.class,
    newStatusText: newStatusDetails.text,
    newStatusClass: newStatusDetails.class,
    statusMessage,
    trainingUrl,
  });
};

module.exports = { 
  sendVerificationEmail,
  sendTrainingRegistrationEmail,
  sendStatusUpdateEmail
};