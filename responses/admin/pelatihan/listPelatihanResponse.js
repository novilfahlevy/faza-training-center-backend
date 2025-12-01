// /home/novilfahlevy/Projects/faza-training-center-backend/responses/admin/pelatihan/listPelatihanResponse.js
const Env = require("../../../config/env");

function makeListPelatihanResponse(data) {
  // Proses data mitra
  const mitraList = data.mitra_pelatihan ? data.mitra_pelatihan.map(mitra => ({
    id: mitra.pengguna_id,
    nama: mitra.data_mitra ? mitra.data_mitra.nama_mitra : null,
    role: mitra.PelatihanMitra ? mitra.PelatihanMitra.role_mitra : null
  })) : [];

  return {
    id: data.pelatihan_id,
    thumbnail_url: data.thumbnail_url
      ? `${Env.APP_URL.replace(/\/$/, "")}/${data.thumbnail_url.replace(/^\//, "")}`
      : null,
    nama: data.nama_pelatihan,
    tanggal: data.tanggal_pelatihan,
    durasi: data.durasi_pelatihan,
    lokasi: data.lokasi_pelatihan,
    mitra: mitraList // Ubah dari objek tunggal ke array
  };
}

module.exports = makeListPelatihanResponse;