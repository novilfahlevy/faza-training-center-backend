const Env = require("../../../config/env");

function makeDetailPelatihanResponse(data, withCompleteDataMitra = false) {
  return {
    id: data.pelatihan_id,
    thumbnail_url: data.thumbnail_url
      ? `${Env.APP_URL.replace(/\/$/, "")}/${data.thumbnail_url.replace(/^\//, "")}`
      : null,
    nama: data.nama_pelatihan,
    deskripsi: data.deskripsi_pelatihan,
    tanggal: data.tanggal_pelatihan,
    durasi: data.durasi_pelatihan,
    lokasi: data.lokasi_pelatihan,
    mitra: data.mitra
      ? withCompleteDataMitra
        ? {
          id: data.mitra.pengguna_id,
          nama: data.mitra.data_mitra.nama_mitra
        }
        : data.mitra.data_mitra.nama_mitra
      : null
  };
}

module.exports = makeDetailPelatihanResponse;