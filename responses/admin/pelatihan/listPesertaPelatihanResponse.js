const Env = require("../../../config/env");

function makeListPesertaPelatihanResponse(data) {
  return {
    id: data.id,
    pelatihan_id: data.pelatihan_id,
    nama_lengkap: data.peserta.data_peserta.nama_lengkap,
    email: data.peserta.email,
    no_telp: data.peserta.data_peserta.no_telp,
    bukti_pembayaran_filename: data.bukti_pembayaran_filename
      ? `${Env.APP_URL.replace(/\/$/, "")}/${data.bukti_pembayaran_filename.replace(/^\//, "")}`
      : null,
    status: data.status_pendaftaran
  };
}

module.exports = makeListPesertaPelatihanResponse;