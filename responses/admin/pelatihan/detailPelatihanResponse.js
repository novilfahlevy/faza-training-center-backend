// /home/novilfahlevy/Projects/faza-training-center-backend/responses/admin/pelatihan/detailPelatihanResponse.js
const Env = require("../../../config/env");

function makeDetailPelatihanResponse(data, withCompleteDataMitra = false) {
  // Proses data mitra
  const mitraList = data.mitra_pelatihan ? data.mitra_pelatihan.map(mitra => {
    if (withCompleteDataMitra) {
      return {
        id: mitra.pengguna_id,
        email: mitra.email,
        data_mitra: mitra.data_mitra,
        role: mitra.PelatihanMitra ? mitra.PelatihanMitra.role_mitra : null
      };
    } else {
      return {
        id: mitra.pengguna_id,
        nama: mitra.data_mitra ? mitra.data_mitra.nama_mitra : null,
        role: mitra.PelatihanMitra ? mitra.PelatihanMitra.role_mitra : null
      };
    }
  }) : [];

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
    mitra: mitraList // Ubah dari objek tunggal ke array
  };
}

module.exports = makeDetailPelatihanResponse;