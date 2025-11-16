const Env = require("../../../config/env");

function makeListPelatihanResponse(data) {
  return {
    id: data.pelatihan_id,
    thumbnail_url: data.thumbnail_url
      ? `${Env.APP_URL.replace(/\/$/, "")}/${data.thumbnail_url.replace(/^\//, "")}`
      : null,
    nama: data.nama_pelatihan,
    tanggal: data.tanggal_pelatihan,
    durasi: data.durasi_pelatihan,
    lokasi: data.lokasi_pelatihan
  };
}

module.exports = makeListPelatihanResponse;