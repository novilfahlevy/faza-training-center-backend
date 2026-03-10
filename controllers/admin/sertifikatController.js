const { Sertifikat, PesertaPelatihan, Pengguna, DataPeserta, Pelatihan } = require("../../models");
const { generateCertificatePDF, deleteCertificateFile, getCertificatePath } = require("../../services/certificateService");
const { sendStatusUpdateEmail } = require("../../services/emailService");
const fs = require("fs");
const archiver = require("archiver");

/**
 * Generate certificate for a single peserta (internal helper).
 * Returns existing cert if already generated. Creates new one if not.
 */
const generateCertificateForPeserta = async (pesertaPelatihan) => {
  // Check if certificate already exists
  const existing = await Sertifikat.findOne({
    where: { peserta_pelatihan_id: pesertaPelatihan.id },
  });
  if (existing) return existing;

  const year = new Date().getFullYear();
  const nomorSertifikat = `FTC/${pesertaPelatihan.pelatihan_id}/${pesertaPelatihan.id}/${year}`;
  const issuedAt = new Date();

  const namaLengkap = pesertaPelatihan.peserta?.data_peserta?.nama_lengkap
    || pesertaPelatihan.peserta?.email
    || 'Peserta';

  const filename = await generateCertificatePDF({
    peserta_pelatihan_id: pesertaPelatihan.id,
    nama_lengkap: namaLengkap,
    nama_pelatihan: pesertaPelatihan.pelatihan?.nama_pelatihan || '-',
    tanggal_pelatihan: pesertaPelatihan.pelatihan?.tanggal_pelatihan,
    durasi_pelatihan: pesertaPelatihan.pelatihan?.durasi_pelatihan,
    nomor_sertifikat: nomorSertifikat,
    issued_at: issuedAt,
  });

  const sertifikat = await Sertifikat.create({
    peserta_pelatihan_id: pesertaPelatihan.id,
    nomor_sertifikat: nomorSertifikat,
    filename,
    issued_at: issuedAt,
  });

  return sertifikat;
};

/**
 * Delete certificate for a peserta (internal helper).
 */
const deleteCertificateForPeserta = async (pesertaPelatihanId) => {
  const cert = await Sertifikat.findOne({
    where: { peserta_pelatihan_id: pesertaPelatihanId },
  });
  if (cert) {
    deleteCertificateFile(cert.filename);
    await cert.destroy();
  }
};

/**
 * Download a single certificate PDF.
 * GET /admin/sertifikat/:id/download
 */
exports.downloadCertificate = async (req, res) => {
  try {
    const cert = await Sertifikat.findByPk(req.params.id, {
      include: [
        {
          model: PesertaPelatihan,
          as: "peserta_pelatihan",
          include: [
            { model: Pengguna, as: "peserta", include: [{ model: DataPeserta, as: "data_peserta" }] },
            { model: Pelatihan, as: "pelatihan" },
          ],
        },
      ],
    });

    if (!cert) {
      return res.status(404).json({ message: "Sertifikat tidak ditemukan" });
    }

    const filePath = getCertificatePath(cert.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File sertifikat tidak ditemukan di server" });
    }

    const namaLengkap = cert.peserta_pelatihan?.peserta?.data_peserta?.nama_lengkap || 'peserta';
    const namaPelatihan = cert.peserta_pelatihan?.pelatihan?.nama_pelatihan || 'pelatihan';
    const downloadName = `Sertifikat_${namaLengkap.replace(/\s+/g, '_')}_${namaPelatihan.replace(/\s+/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("❌ Error downloadCertificate:", error);
    res.status(500).json({ message: "Gagal mengunduh sertifikat", error: error.message });
  }
};

/**
 * Download all certificates for a pelatihan as a ZIP file.
 * GET /admin/sertifikat/pelatihan/:pelatihanId/download-all
 */
exports.downloadAllCertificates = async (req, res) => {
  try {
    const { pelatihanId } = req.params;

    const pesertaList = await PesertaPelatihan.findAll({
      where: { pelatihan_id: pelatihanId, status_pendaftaran: 'selesai' },
      include: [
        { model: Pengguna, as: "peserta", include: [{ model: DataPeserta, as: "data_peserta" }] },
        { model: Pelatihan, as: "pelatihan" },
      ],
    });

    // Collect only peserta that have certificates
    const certsData = [];
    for (const pp of pesertaList) {
      const cert = await Sertifikat.findOne({ where: { peserta_pelatihan_id: pp.id } });
      if (cert) {
        const filePath = getCertificatePath(cert.filename);
        if (fs.existsSync(filePath)) {
          const namaLengkap = pp.peserta?.data_peserta?.nama_lengkap || 'peserta';
          certsData.push({ filePath, downloadName: `Sertifikat_${namaLengkap.replace(/\s+/g, '_')}.pdf` });
        }
      }
    }

    if (certsData.length === 0) {
      return res.status(404).json({ message: "Tidak ada sertifikat yang tersedia untuk diunduh" });
    }

    const pelatihan = await Pelatihan.findByPk(pelatihanId);
    const namaPelatihan = pelatihan?.nama_pelatihan?.replace(/\s+/g, '_') || 'pelatihan';

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="Sertifikat_${namaPelatihan}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err) => {
      console.error("❌ Error archiving:", err);
      res.status(500).json({ message: "Gagal membuat arsip ZIP" });
    });
    archive.pipe(res);

    for (const { filePath, downloadName } of certsData) {
      archive.file(filePath, { name: downloadName });
    }

    await archive.finalize();
  } catch (error) {
    console.error("❌ Error downloadAllCertificates:", error);
    res.status(500).json({ message: "Gagal mengunduh semua sertifikat", error: error.message });
  }
};

/**
 * Mark all 'terdaftar' peserta as 'selesai' and generate certificates.
 * POST /admin/sertifikat/pelatihan/:pelatihanId/mark-all-attended
 */
exports.markAllAttended = async (req, res) => {
  try {
    const { pelatihanId } = req.params;

    const pesertaList = await PesertaPelatihan.findAll({
      where: { pelatihan_id: pelatihanId, status_pendaftaran: 'terdaftar' },
      include: [
        { model: Pengguna, as: "peserta", include: [{ model: DataPeserta, as: "data_peserta" }] },
        { model: Pelatihan, as: "pelatihan" },
      ],
    });

    if (pesertaList.length === 0) {
      return res.status(200).json({
        message: "Tidak ada peserta dengan status 'terdaftar' untuk diperbarui",
        updated: 0,
      });
    }

    let updated = 0;
    for (const pp of pesertaList) {
      const oldStatus = pp.status_pendaftaran;
      pp.status_pendaftaran = 'selesai';
      await pp.save();

      // Generate certificate
      await generateCertificateForPeserta(pp);

      // Send email notification (don't fail if email send fails)
      try {
        const userName = pp.peserta?.data_peserta?.nama_lengkap || pp.peserta?.email;
        await sendStatusUpdateEmail(pp.peserta, pp.pelatihan, oldStatus, 'selesai', userName);
      } catch (emailError) {
        console.error("❌ Gagal mengirim email:", emailError);
      }

      updated++;
    }

    res.status(200).json({
      message: `${updated} peserta berhasil ditandai hadir dan sertifikat diterbitkan`,
      updated,
    });
  } catch (error) {
    console.error("❌ Error markAllAttended:", error);
    res.status(500).json({ message: "Gagal menandai peserta hadir", error: error.message });
  }
};

// Export internal helpers for use in pelatihanController
exports.generateCertificateForPeserta = generateCertificateForPeserta;
exports.deleteCertificateForPeserta = deleteCertificateForPeserta;
