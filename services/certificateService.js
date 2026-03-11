const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

/**
 * Generate a certificate PDF for a participant.
 * @param {Object} data
 * @param {string} data.nama_lengkap
 * @param {string} data.nama_pelatihan
 * @param {string} data.tanggal_pelatihan
 * @param {string} data.durasi_pelatihan
 * @param {string} data.nomor_sertifikat
 * @param {number} data.peserta_pelatihan_id
 * @returns {Promise<string>} filename
 */
function generateCertificatePDF(data) {
  return new Promise((resolve, reject) => {
    const filename = `cert_${data.peserta_pelatihan_id}_${Date.now()}.pdf`;
    const filePath = path.join(certDir, filename);

    // Landscape A4: ~842 × 595 pt
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const W = doc.page.width;
    const H = doc.page.height;

    // ── Palette ──────────────────────────────────────────────────────
    const DARK_BLUE  = '#1e3a8a';
    const MID_BLUE   = '#1d4ed8';
    const PANEL_MID  = '#1e40af'; // slightly lighter for circle bg
    const LIGHT_BLUE = '#bfdbfe';
    const SUBTLE     = '#2551b8'; // panel decorative outlines
    const GOLD       = '#b45309';
    const GRAY       = '#6b7280';
    const SLATE      = '#334155';
    const WHITE      = '#ffffff';

    // ── Dimensions ───────────────────────────────────────────────────
    const PANEL_W  = 205;          // left sidebar width
    const STRIP_W  = 5;            // gold separator strip
    const RX       = PANEL_W + STRIP_W; // right panel start X
    const RW       = W - RX;      // right panel width

    const formatDate = (d) => {
      if (!d) return '-';
      return new Date(d).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
    };

    // ════ BACKGROUNDS ════════════════════════════════════════════════
    doc.rect(0, 0, PANEL_W, H).fill(DARK_BLUE);
    doc.rect(PANEL_W, 0, STRIP_W, H).fill(GOLD);
    doc.rect(RX, 0, RW, H).fill(WHITE);

    // ════ LEFT PANEL DECORATION ═════════════════════════════════════
    // Top gold accent bar
    doc.rect(0, 0, PANEL_W, 5).fill(GOLD);

    // Large background circles (decorative, use a slightly lighter hue)
    doc.circle(PANEL_W / 2, H * 0.52, 90)
      .lineWidth(0.6).strokeColor(SUBTLE).stroke();
    doc.circle(PANEL_W / 2, H * 0.52, 72)
      .lineWidth(0.4).strokeColor(SUBTLE).stroke();

    // Badge circle
    const BADGE_Y = 75;
    doc.circle(PANEL_W / 2, BADGE_Y, 38).fill(PANEL_MID);
    doc.circle(PANEL_W / 2, BADGE_Y, 38)
      .lineWidth(1.5).strokeColor(GOLD).stroke();
    doc.fontSize(19).font('Helvetica-Bold').fillColor(WHITE)
      .text('FTC', PANEL_W / 2 - 19, BADGE_Y - 12, { width: 38, align: 'center' });

    // Company name
    doc.fontSize(15).font('Helvetica-Bold').fillColor(GOLD)
      .text('FAZA', 0, 128, { width: PANEL_W, align: 'center' });
    doc.fontSize(7.5).font('Helvetica').fillColor(LIGHT_BLUE)
      .text('TRAINING  CENTER', 0, 147, { width: PANEL_W, align: 'center' });

    // Thin gold divider
    doc.moveTo(26, 165).lineTo(PANEL_W - 26, 165)
      .lineWidth(0.5).strokeColor(GOLD).stroke();

    // Subtitle tagline
    doc.fontSize(6.5).font('Helvetica').fillColor('#7eb3f7')
      .text('Lembaga Pelatihan &', 0, 172, { width: PANEL_W, align: 'center' })
      .text('Pengembangan SDM', 0, 182, { width: PANEL_W, align: 'center' });

    // Three dot decoration (middle area)
    [H * 0.60, H * 0.635, H * 0.67].forEach(cy => {
      doc.circle(PANEL_W / 2, cy, 2.5).fill(SUBTLE);
    });

    // Bottom section — year
    doc.moveTo(26, H - 60).lineTo(PANEL_W - 26, H - 60)
      .lineWidth(0.5).strokeColor(GOLD).stroke();
    doc.fontSize(7).font('Helvetica').fillColor(LIGHT_BLUE)
      .text('Diterbitkan', 0, H - 54, { width: PANEL_W, align: 'center' });
    doc.fontSize(22).font('Helvetica-Bold').fillColor(WHITE)
      .text(new Date().getFullYear().toString(), 0, H - 42, { width: PANEL_W, align: 'center' });

    // Bottom gold bar
    doc.rect(0, H - 5, PANEL_W, 5).fill(GOLD);

    // ════ RIGHT PANEL BORDER ACCENTS ════════════════════════════════
    // Thin outer frame on 3 sides (top, right, bottom)
    doc.rect(RX, 0, RW, 3).fill(DARK_BLUE);
    doc.rect(W - 3, 0, 3, H).fill(DARK_BLUE);
    doc.rect(RX, H - 3, RW, 3).fill(DARK_BLUE);

    // Thin inner guide lines (subtle)
    doc.rect(RX, 3, RW - 3, 0.5).fill('#e2e8f0');
    doc.rect(RX, H - 3.5, RW - 3, 0.5).fill('#e2e8f0');

    // ════ RIGHT PANEL CONTENT ════════════════════════════════════════
    const PAD   = 52;          // horizontal padding inside right panel
    const CX    = RX + PAD;
    const CW    = RW - PAD * 2;
    const MID_X = RX + RW / 2; // horizontal center of right panel

    // Estimate content block height for vertical centering
    // SERTIFIKAT(42) + KEHADIRAN(14) + line(22) + label(14) + name(36)
    // + underline(16) + sep(16) + desc(14) + training(varies) + details(14)
    const trainingLines = doc.heightOfString(data.nama_pelatihan || '-', {
      width: CW, fontSize: 16, lineGap: 2,
    });
    const EST_H = 42 + 14 + 22 + 14 + 36 + 16 + 16 + 14 + trainingLines + 14;

    // Footer row sits 46pt from bottom inside right panel
    const FOOTER_LINE_Y = H - 46;
    const CONTENT_ZONE_H = FOOTER_LINE_Y - 6; // usable height above footer
    let y = Math.round((CONTENT_ZONE_H - EST_H) / 2);
    if (y < 12) y = 12;

    // ── "SERTIFIKAT" ─────────────────────────────────────────────────
    doc.fontSize(36).font('Helvetica-Bold').fillColor(DARK_BLUE)
      .text('SERTIFIKAT', CX, y, { width: CW, align: 'center' });
    y += 44;

    // ── "KEHADIRAN" spaced, gold ──────────────────────────────────────
    doc.fontSize(10).font('Helvetica').fillColor(GOLD)
      .text('K  E  H  A  D  I  R  A  N', CX, y, { width: CW, align: 'center' });
    y += 16;

    // ── Gold line with diamond ────────────────────────────────────────
    doc.moveTo(MID_X - 160, y).lineTo(MID_X + 160, y)
      .lineWidth(1).strokeColor(GOLD).stroke();
    doc.save().translate(MID_X, y)
      .path('M 0 -4.5 L 5 0 L 0 4.5 L -5 0 Z').fill(GOLD).restore();
    y += 24;

    // ── "Diberikan kepada:" ───────────────────────────────────────────
    doc.fontSize(9).font('Helvetica-Oblique').fillColor(GRAY)
      .text('Diberikan kepada:', CX, y, { width: CW, align: 'center' });
    y += 16;

    // ── Participant name ──────────────────────────────────────────────
    doc.fontSize(28).font('Helvetica-Bold').fillColor(SLATE)
      .text(data.nama_lengkap || 'Peserta', CX, y, { width: CW, align: 'center' });
    y += 36;

    // ── Gold underline ────────────────────────────────────────────────
    const ulW = Math.min(280, CW * 0.55);
    doc.moveTo(MID_X - ulW / 2, y).lineTo(MID_X + ulW / 2, y)
      .lineWidth(2).strokeColor(GOLD).stroke();
    y += 16;

    // ── Thin separator ────────────────────────────────────────────────
    doc.moveTo(CX + 10, y).lineTo(CX + CW - 10, y)
      .lineWidth(0.4).strokeColor('#e2e8f0').stroke();
    y += 18;

    // ── Description ───────────────────────────────────────────────────
    doc.fontSize(9).font('Helvetica').fillColor(GRAY)
      .text('Atas keikutsertaannya dalam pelatihan:', CX, y, { width: CW, align: 'center' });
    y += 16;

    // ── Training name ─────────────────────────────────────────────────
    doc.fontSize(16).font('Helvetica-Bold').fillColor(MID_BLUE)
      .text(data.nama_pelatihan || '-', CX, y, {
        width: CW, align: 'center', lineGap: 2,
      });
    y += trainingLines + 10;

    // ── Training details ──────────────────────────────────────────────
    const details = [
      `Tanggal: ${formatDate(data.tanggal_pelatihan)}`,
      data.durasi_pelatihan ? `Durasi: ${data.durasi_pelatihan}` : null,
    ].filter(Boolean).join('    ·    ');

    doc.fontSize(9).font('Helvetica').fillColor(GRAY)
      .text(details, CX, y, { width: CW, align: 'center' });

    // ════ FOOTER ROW ════════════════════════════════════════════════
    doc.moveTo(RX + 16, FOOTER_LINE_Y).lineTo(W - 16, FOOTER_LINE_Y)
      .lineWidth(0.5).strokeColor('#cbd5e1').stroke();

    const issuedAt = data.issued_at ? new Date(data.issued_at) : new Date();
    const FY  = FOOTER_LINE_Y + 8;
    const FX  = RX + 20;
    const FW  = (RW - 40) / 3;

    // Left: cert number
    doc.fontSize(6.5).font('Helvetica').fillColor(GRAY)
      .text('No. Sertifikat', FX, FY, { width: FW });
    doc.fontSize(8).font('Helvetica-Bold').fillColor(DARK_BLUE)
      .text(data.nomor_sertifikat || '-', FX, FY + 11, { width: FW });

    // Centre: penyelenggara
    doc.fontSize(6.5).font('Helvetica').fillColor(GRAY)
      .text('Penyelenggara', FX + FW, FY, { width: FW, align: 'center' });
    doc.fontSize(8).font('Helvetica-Bold').fillColor(DARK_BLUE)
      .text('Faza Training Center', FX + FW, FY + 11, { width: FW, align: 'center' });

    // Right: issued date
    doc.fontSize(6.5).font('Helvetica').fillColor(GRAY)
      .text('Diterbitkan pada', FX + FW * 2, FY, { width: FW, align: 'right' });
    doc.fontSize(8).font('Helvetica-Bold').fillColor(DARK_BLUE)
      .text(formatDate(issuedAt), FX + FW * 2, FY + 11, { width: FW, align: 'right' });

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

