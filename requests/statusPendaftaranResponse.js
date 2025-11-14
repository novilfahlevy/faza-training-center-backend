const Env = require("../config/env");

function makeStatusPendaftaranResponse(data) {
  return {
    pelatihan_id: data.pelatihan_id,
    pengguna_id: data.peserta.pengguna_id,
    status: data.status_pendaftaran,
    bukti_pembayaran_url: data.bukti_pembayaran_filename
      ? `${Env.APP_URL.replace(/\/$/, "")}/${data.bukti_pembayaran_filename.replace(/^\//, "")}`
      : null,
  }
}

module.exports = makeStatusPendaftaranResponse;