const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

/**
 * Generate a certificate PDF for a participant.
 * @param {Object} data
 * @param {string} data.nama_lengkap - Participant full name
 * @param {string} data.nama_pelatihan - Training name
 * @param {string} data.tanggal_pelatihan - Training date (ISO string)
 * @param {string} data.durasi_pelatihan - Training duration (e.g. "3 hari")
 * @param {string} data.nomor_sertifikat - Certificate number
 * @param {number} data.peserta_pelatihan_id - PesertaPelatihan ID (for filename)
 * @returns {Promise<string>} filename (relative path from uploads/)
 */
function generateCertificatePDF(data) {
  return new Promise((resolve, reject) => {
    const filename = `cert_${data.peserta_pelatihan_id}_${Date.now()}.pdf`;
    const filePath = path.join(certDir, filename);

    // Landscape A4: 842 x 595
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageW = doc.page.width;
    const pageH = doc.page.height;

    // --- Outer border ---
    doc.rect(20, 20, pageW - 40, pageH - 40)
      .lineWidth(3)
      .strokeColor('#1a56db')
      .stroke();

    // --- Inner border ---
    doc.rect(30, 30, pageW - 60, pageH - 60)
      .lineWidth(1)
      .strokeColor('#93bbfb')
      .stroke();

    // --- Header ---
    doc.moveDown(2);
    doc.fontSize(14)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text('FAZA TRAINING CENTER', 0, 60, { align: 'center' });

    // --- Title ---
    doc.fontSize(36)
      .font('Helvetica-Bold')
      .fillColor('#1a56db')
      .text('SERTIFIKAT', 0, 90, { align: 'center' });

    // --- Subtitle ---
    doc.fontSize(12)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text('Sertifikat ini diberikan kepada:', 0, 140, { align: 'center' });

    // --- Participant Name ---
    doc.fontSize(28)
      .font('Helvetica-Bold')
      .fillColor('#111827')
      .text(data.nama_lengkap || 'Peserta', 0, 170, { align: 'center' });

    // --- Decorative line under name ---
    const lineY = 210;
    const lineW = 300;
    const lineX = (pageW - lineW) / 2;
    doc.moveTo(lineX, lineY)
      .lineTo(lineX + lineW, lineY)
      .lineWidth(2)
      .strokeColor('#1a56db')
      .stroke();

    // --- Description ---
    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    };

    doc.fontSize(12)
      .font('Helvetica')
      .fillColor('#374151')
      .text(
        `Atas partisipasinya dalam pelatihan:`,
        0, 230, { align: 'center' }
      );

    doc.fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#1a56db')
      .text(data.nama_pelatihan || '-', 50, 255, {
        align: 'center',
        width: pageW - 100,
      });

    // --- Training details ---
    const detailY = 300;
    doc.fontSize(11)
      .font('Helvetica')
      .fillColor('#374151');

    const details = [
      `Tanggal: ${formatDate(data.tanggal_pelatihan)}`,
      data.durasi_pelatihan ? `Durasi: ${data.durasi_pelatihan}` : null,
    ].filter(Boolean).join('    |    ');

    doc.text(details, 0, detailY, { align: 'center' });

    // --- Certificate number & issue date ---
    const issuedAt = data.issued_at ? new Date(data.issued_at) : new Date();
    const infoY = 360;

    doc.fontSize(9)
      .font('Helvetica')
      .fillColor('#9ca3af')
      .text(`No. Sertifikat: ${data.nomor_sertifikat}`, 0, infoY, { align: 'center' });

    doc.text(`Diterbitkan pada: ${formatDate(issuedAt)}`, 0, infoY + 16, { align: 'center' });

    // --- Signature area ---
    const sigY = 420;
    const sigCenterX = pageW / 2;

    // Signature line
    doc.moveTo(sigCenterX - 80, sigY + 40)
      .lineTo(sigCenterX + 80, sigY + 40)
      .lineWidth(1)
      .strokeColor('#374151')
      .stroke();

    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#374151')
      .text('Penyelenggara', sigCenterX - 80, sigY + 45, { width: 160, align: 'center' });

    doc.fontSize(9)
      .font('Helvetica')
      .fillColor('#6b7280')
      .text('Faza Training Center', sigCenterX - 80, sigY + 60, { width: 160, align: 'center' });

    // --- Footer ---
    doc.fontSize(8)
      .font('Helvetica')
      .fillColor('#d1d5db')
      .text('© Faza Training Center — Dokumen ini digenerate secara otomatis', 0, pageH - 50, {
        align: 'center',
      });

    doc.end();

    stream.on('finish', () => resolve(filename));
    stream.on('error', reject);
  });
}

/**
 * Delete a certificate PDF file.
 * @param {string} filename - The certificate filename
 */
function deleteCertificateFile(filename) {
  const filePath = path.join(certDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Get the full path of a certificate file.
 * @param {string} filename
 * @returns {string}
 */
function getCertificatePath(filename) {
  return path.join(certDir, filename);
}

module.exports = {
  generateCertificatePDF,
  deleteCertificateFile,
  getCertificatePath,
};
