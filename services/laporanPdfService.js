const PDFDocument = require('pdfkit');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const Env = require('../config/env');

/* ── colour palette ─────────────────────────────────────────────── */
const DARK_BLUE  = '#1e3a8a';
const MID_BLUE   = '#2563eb';
const GOLD       = '#b45309';
const GRAY       = '#6b7280';
const LIGHT_GRAY = '#f3f4f6';
const WHITE      = '#ffffff';

/* ── page constants ─────────────────────────────────────────────── */
const PAGE_W = 595.28;  // A4 portrait width in pt
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

/* ── helper: format tanggal Indonesia ───────────────────────────── */
const BULAN = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];

function formatTanggal(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/* ── helper: sanitise filename ──────────────────────────────────── */
function sanitiseFilename(str) {
  return str.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_').substring(0, 80);
}

/* ── helper: get uploader name ──────────────────────────────────── */
function getUploaderName(uploader) {
  if (!uploader) return '-';
  if (uploader.data_peserta?.nama_lengkap) return uploader.data_peserta.nama_lengkap;
  if (uploader.data_mitra?.nama_mitra) return uploader.data_mitra.nama_mitra;
  return uploader.email || '-';
}

function getRoleLabel(role) {
  if (role === 'admin') return 'Admin';
  if (role === 'mitra') return 'Mitra';
  return 'Peserta';
}

/* ════════════════════════════════════════════════════════════════════
   HTML → PDFKit renderer (cheerio-based)
   ════════════════════════════════════════════════════════════════════ */

function renderHtmlToPdf(doc, html) {
  if (!html) return;
  const $ = cheerio.load(html, { decodeEntities: true });

  const uploadsDir = path.join(__dirname, '../uploads');

  function ensureSpace(needed) {
    if (doc.y + needed > doc.page.height - MARGIN) {
      doc.addPage();
    }
  }

  /**
   * Walk a cheerio node and render it to the doc.
   * Supports: p, h1-h6, strong/b, em/i, u, ul, ol, li, br, blockquote, a, img
   */
  function walkNodes(nodes, opts = {}) {
    nodes.each(function () {
      const el = $(this);
      const tagRaw = this.tagName;
      const tag = tagRaw ? tagRaw.toLowerCase() : null;

      // Text node
      if (this.type === 'text') {
        const text = $(this).text();
        if (!text.trim() && !text.includes('\n')) return;
        const fontStyle = [];
        if (opts.bold) fontStyle.push('Bold');
        if (opts.italic) fontStyle.push('Italic');
        const fontName = fontStyle.length
          ? `Helvetica-${fontStyle.join('')}`
          : 'Helvetica';
        doc.font(fontName).fontSize(opts.fontSize || 10).fillColor(opts.color || '#333333');

        if (opts.continued) {
          doc.text(text, { continued: true, underline: opts.underline || false, link: opts.link || undefined });
        } else {
          doc.text(text, { underline: opts.underline || false, link: opts.link || undefined });
        }
        return;
      }

      if (!tag) return;

      // Headings
      const headingMatch = tag.match(/^h([1-6])$/);
      if (headingMatch) {
        const level = parseInt(headingMatch[1]);
        const sizes = { 1: 20, 2: 17, 3: 15, 4: 13, 5: 12, 6: 11 };
        ensureSpace(sizes[level] + 15);
        doc.moveDown(0.5);
        walkNodes(el.contents(), { ...opts, bold: true, fontSize: sizes[level], color: DARK_BLUE, continued: false });
        doc.moveDown(0.3);
        return;
      }

      if (tag === 'p') {
        ensureSpace(20);
        walkNodes(el.contents(), { ...opts, continued: false });
        doc.moveDown(0.4);
        return;
      }

      if (tag === 'br') {
        doc.moveDown(0.3);
        return;
      }

      if (tag === 'strong' || tag === 'b') {
        walkNodes(el.contents(), { ...opts, bold: true });
        return;
      }

      if (tag === 'em' || tag === 'i') {
        walkNodes(el.contents(), { ...opts, italic: true });
        return;
      }

      if (tag === 'u') {
        walkNodes(el.contents(), { ...opts, underline: true });
        return;
      }

      if (tag === 'a') {
        const href = el.attr('href') || '';
        walkNodes(el.contents(), { ...opts, color: MID_BLUE, underline: true, link: href });
        return;
      }

      if (tag === 'blockquote') {
        ensureSpace(25);
        const savedX = MARGIN;
        const quoteX = savedX + 15;
        // Draw left border line
        doc.save()
          .moveTo(savedX + 8, doc.y)
          .lineTo(savedX + 8, doc.y + 2)
          .lineWidth(2)
          .strokeColor(GRAY)
          .stroke()
          .restore();

        doc.x = quoteX;
        walkNodes(el.contents(), { ...opts, italic: true, color: GRAY });
        doc.x = savedX;
        doc.moveDown(0.4);
        return;
      }

      if (tag === 'ul' || tag === 'ol') {
        const isOrdered = tag === 'ol';
        let counter = 0;
        el.children('li').each(function () {
          counter++;
          ensureSpace(18);
          const bullet = isOrdered ? `${counter}. ` : '•  ';
          doc.font('Helvetica').fontSize(opts.fontSize || 10).fillColor(opts.color || '#333333');
          const bulletW = doc.widthOfString(bullet);
          doc.text(bullet, MARGIN + 15, doc.y, { continued: true, width: CONTENT_W - 15 });
          walkNodes($(this).contents(), { ...opts, continued: false });
        });
        doc.moveDown(0.3);
        return;
      }

      if (tag === 'img') {
        const src = el.attr('src') || '';
        try {
          let imgBuffer = null;

          if (src.startsWith('data:')) {
            // Base64 encoded image
            const base64Data = src.split(',')[1];
            if (base64Data) {
              imgBuffer = Buffer.from(base64Data, 'base64');
            }
          } else if (src.includes('/uploads/')) {
            // Local file - extract path after /uploads/
            const relPath = src.substring(src.indexOf('/uploads/') + '/uploads/'.length);
            const absPath = path.join(uploadsDir, relPath);
            if (fs.existsSync(absPath)) {
              imgBuffer = fs.readFileSync(absPath);
            }
          } else if (src.startsWith('/')) {
            // Other local path
            const absPath = path.join(uploadsDir, '..', src);
            if (fs.existsSync(absPath)) {
              imgBuffer = fs.readFileSync(absPath);
            }
          }
          // Skip remote URLs to avoid SSRF and blocking I/O

          if (imgBuffer) {
            ensureSpace(200);
            const maxW = CONTENT_W - 30;
            doc.image(imgBuffer, MARGIN + 15, doc.y, { fit: [maxW, 350] });
            doc.moveDown(1);
          }
        } catch (_err) {
          // Silently skip images that can't be loaded
        }
        return;
      }

      // Any other element — just recurse into children
      walkNodes(el.contents(), opts);
    });
  }

  walkNodes($('body').contents());
}

/* ════════════════════════════════════════════════════════════════════
   Draw metadata row (key-value)
   ════════════════════════════════════════════════════════════════════ */

function drawMetaRow(doc, label, value, y) {
  const labelW = 150;
  doc.font('Helvetica-Bold').fontSize(10).fillColor(DARK_BLUE)
    .text(label, MARGIN, y, { width: labelW });
  doc.font('Helvetica').fontSize(10).fillColor('#333333')
    .text(`:  ${value || '-'}`, MARGIN + labelW, y, { width: CONTENT_W - labelW });
  return Math.max(
    doc.heightOfString(label, { width: labelW }),
    doc.heightOfString(`:  ${value || '-'}`, { width: CONTENT_W - labelW })
  );
}

/* ════════════════════════════════════════════════════════════════════
   Draw peserta table
   ════════════════════════════════════════════════════════════════════ */

function drawPesertaTable(doc, pesertaList) {
  if (!pesertaList || pesertaList.length === 0) return;

  // Section heading
  if (doc.y + 60 > doc.page.height - MARGIN) doc.addPage();
  doc.moveDown(1);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(DARK_BLUE)
    .text('Daftar Peserta', MARGIN);
  doc.moveDown(0.3);
  doc.moveTo(MARGIN, doc.y).lineTo(MARGIN + CONTENT_W, doc.y)
    .lineWidth(1).strokeColor(MID_BLUE).stroke();
  doc.moveDown(0.5);

  // Column definitions
  const cols = [
    { header: 'No',    width: 30,  align: 'center' },
    { header: 'Nama',  width: 160, align: 'left' },
    { header: 'Email', width: 160, align: 'left' },
    { header: 'No. HP', width: 90, align: 'left' },
    { header: 'Status', width: 55, align: 'center' },
  ];

  const ROW_PAD = 6;
  const HEADER_BG = DARK_BLUE;
  const ROW_H_MIN = 22;

  function drawTableHeader(y) {
    let x = MARGIN;
    // Header background
    doc.save()
      .rect(MARGIN, y, CONTENT_W, ROW_H_MIN + ROW_PAD * 2)
      .fill(HEADER_BG);
    // Header text
    cols.forEach(c => {
      doc.font('Helvetica-Bold').fontSize(8).fillColor(WHITE)
        .text(c.header, x + 4, y + ROW_PAD, { width: c.width - 8, align: c.align });
      x += c.width;
    });
    doc.restore();
    return y + ROW_H_MIN + ROW_PAD * 2;
  }

  function getStatusLabel(status) {
    const map = {
      'pending': 'Pending',
      'terdaftar': 'Terdaftar',
      'selesai': 'Selesai',
      'tidak_hadir': 'Tidak Hadir',
    };
    return map[status] || status || '-';
  }

  let tableY = doc.y;
  tableY = drawTableHeader(tableY);

  pesertaList.forEach((p, i) => {
    const nama = p.data_peserta?.nama_lengkap || p.pengguna?.data_peserta?.nama_lengkap || '-';
    const email = p.pengguna?.email || '-';
    const hp = p.data_peserta?.nomor_hp || p.pengguna?.data_peserta?.nomor_hp || '-';
    const status = getStatusLabel(p.status);

    // Calculate row height based on content
    doc.font('Helvetica').fontSize(8);
    const namaH = doc.heightOfString(nama, { width: cols[1].width - 8 });
    const emailH = doc.heightOfString(email, { width: cols[2].width - 8 });
    const rowH = Math.max(ROW_H_MIN, namaH + 4, emailH + 4) + ROW_PAD * 2;

    // Check page break
    if (tableY + rowH > doc.page.height - MARGIN) {
      doc.addPage();
      tableY = MARGIN;
      tableY = drawTableHeader(tableY);
    }

    // Zebra striping
    if (i % 2 === 0) {
      doc.save().rect(MARGIN, tableY, CONTENT_W, rowH).fill(LIGHT_GRAY).restore();
    }

    // Row border bottom
    doc.save()
      .moveTo(MARGIN, tableY + rowH)
      .lineTo(MARGIN + CONTENT_W, tableY + rowH)
      .lineWidth(0.3).strokeColor('#d1d5db').stroke()
      .restore();

    // Cell data
    let x = MARGIN;
    const cellY = tableY + ROW_PAD;
    const rowData = [
      { text: String(i + 1), width: cols[0].width, align: 'center' },
      { text: nama,          width: cols[1].width, align: 'left' },
      { text: email,         width: cols[2].width, align: 'left' },
      { text: hp,            width: cols[3].width, align: 'left' },
      { text: status,        width: cols[4].width, align: 'center' },
    ];

    rowData.forEach(cell => {
      doc.font('Helvetica').fontSize(8).fillColor('#333333')
        .text(cell.text, x + 4, cellY, { width: cell.width - 8, align: cell.align });
      x += cell.width;
    });

    tableY += rowH;
  });

  doc.y = tableY;
}

/* ════════════════════════════════════════════════════════════════════
   Main: generate laporan PDF → stream to response
   ════════════════════════════════════════════════════════════════════ */

function generateLaporanPdf(res, laporan, pesertaList) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'portrait',
      margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      bufferPages: true,
      info: {
        Title: laporan.judul_laporan || 'Laporan Kegiatan',
        Author: 'Faza Training Center',
      },
    });

    // Sanitised filename for Content-Disposition
    const safeName = sanitiseFilename(laporan.judul_laporan || 'Laporan');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Laporan_${safeName}.pdf"`);

    doc.pipe(res);

    doc.on('error', reject);
    res.on('error', reject);

    /* ─── Page 1: Header ─── */
    // Top accent bar
    doc.save()
      .rect(0, 0, PAGE_W, 8)
      .fill(DARK_BLUE);
    doc.restore();

    // Title block
    doc.moveDown(1.5);
    doc.font('Helvetica-Bold').fontSize(22).fillColor(DARK_BLUE)
      .text('LAPORAN KEGIATAN', MARGIN, doc.y, { align: 'center', width: CONTENT_W });
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(10).fillColor(GRAY)
      .text('Faza Training Center', MARGIN, doc.y, { align: 'center', width: CONTENT_W });
    doc.moveDown(0.8);

    // Divider line
    doc.moveTo(MARGIN, doc.y)
      .lineTo(MARGIN + CONTENT_W, doc.y)
      .lineWidth(1.5).strokeColor(GOLD).stroke();
    doc.moveDown(1);

    /* ─── Metadata section ─── */
    let y = doc.y;
    const lineH = 18;

    const uploaderName = getUploaderName(laporan.uploader);
    const uploaderRole = getRoleLabel(laporan.uploader?.role);

    const metaRows = [
      ['Judul Laporan', laporan.judul_laporan],
      ['Tanggal Laporan', formatTanggal(laporan.tanggal_laporan)],
      ['Pengunggah', `${uploaderName} (${uploaderRole})`],
      ['Status', laporan.status === 'final' ? 'Final' : 'Draft'],
      ['Pelatihan Terkait', laporan.pelatihan?.nama_pelatihan || '-'],
    ];

    metaRows.forEach(([label, value]) => {
      const h = drawMetaRow(doc, label, value, y);
      y += Math.max(h, lineH);
    });

    // Mitra penyelenggara (if available)
    if (laporan.pelatihan?.mitra_pelatihan?.length > 0) {
      const mitraNames = laporan.pelatihan.mitra_pelatihan
        .map(m => {
          const name = m.data_mitra?.nama_mitra || 'Unknown';
          const role = m.PelatihanMitra?.role_mitra || 'pemateri';
          return `${name} (${role})`;
        })
        .join(', ');
      const h = drawMetaRow(doc, 'Mitra Penyelenggara', mitraNames, y);
      y += Math.max(h, lineH);
    }

    doc.y = y;
    doc.moveDown(0.8);

    // Divider
    doc.moveTo(MARGIN, doc.y)
      .lineTo(MARGIN + CONTENT_W, doc.y)
      .lineWidth(0.5).strokeColor('#d1d5db').stroke();
    doc.moveDown(1);

    /* ─── Isi Laporan section ─── */
    doc.font('Helvetica-Bold').fontSize(14).fillColor(DARK_BLUE)
      .text('Isi Laporan', MARGIN);
    doc.moveDown(0.3);
    doc.moveTo(MARGIN, doc.y)
      .lineTo(MARGIN + CONTENT_W, doc.y)
      .lineWidth(1).strokeColor(MID_BLUE).stroke();
    doc.moveDown(0.6);

    if (laporan.isi_laporan) {
      renderHtmlToPdf(doc, laporan.isi_laporan);
    } else {
      doc.font('Helvetica').fontSize(10).fillColor(GRAY)
        .text('(Tidak ada isi laporan)', MARGIN);
    }

    /* ─── Peserta table section ─── */
    if (pesertaList && pesertaList.length > 0) {
      drawPesertaTable(doc, pesertaList);
    }

    /* ─── Footer on every page ─── */
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      // Bottom accent bar
      doc.save()
        .rect(0, doc.page.height - 8, PAGE_W, 8)
        .fill(DARK_BLUE);
      doc.restore();
      // Page number
      doc.font('Helvetica').fontSize(8).fillColor(GRAY)
        .text(
          `Halaman ${i + 1} dari ${pages.count}`,
          MARGIN,
          doc.page.height - 28,
          { width: CONTENT_W, align: 'center' }
        );
    }

    doc.end();

    // Resolve when finished streaming
    res.on('finish', () => resolve());
  });
}

module.exports = { generateLaporanPdf };
