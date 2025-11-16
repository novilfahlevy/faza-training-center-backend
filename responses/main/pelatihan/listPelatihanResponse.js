const Env = require("../../../config/env");

function makeListPelatihanResponse(data) {
  return data.map(item => ({
    pelatihan_id: item.pelatihan_id,
    nama_pelatihan: item.nama_pelatihan,
    slug_pelatihan: item.slug_pelatihan,
    lokasi_pelatihan: item.lokasi_pelatihan,
    tanggal_pelatihan: item.tanggal_pelatihan,
    thumbnail_url: item.thumbnail_url
      ? `${Env.APP_URL.replace(/\/$/, "")}/${item.thumbnail_url.replace(/^\//, "")}`
      : null,
  }));
}

module.exports = makeListPelatihanResponse;
