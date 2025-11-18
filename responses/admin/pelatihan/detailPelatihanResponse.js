const Env = require("../../../config/env");

function makeDetailPelatihanResponse(data, withCompleteDataMitra = false) {
  return {
    id: data.pelatihan_id,
    thumbnail_url: data.thumbnail_url
      ? `${Env.APP_URL.replace(/\/$/, "")}/${data.thumbnail_url.replace(/^\//, "")}`
      : null,
    nama: data.nama_pelatihan,
    biaya: data.biaya,
    daring: data.daring,
    link_daring: data.link_daring,
    nomor_rekening: data.nomor_rekening,
    nama_bank: data.nama_bank,
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