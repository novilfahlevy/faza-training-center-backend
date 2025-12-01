// /home/novilfahlevy/Projects/faza-training-center-backend/responses/main/pelatihan/listPelatihanResponse.js
const Env = require("../../../config/env");

function makeListPelatihanResponse(data) {
  return data.map(item => {
    // Proses data mitra
    const mitraList = item.mitra_pelatihan ? item.mitra_pelatihan.map(mitra => ({
      id: mitra.pengguna_id,
      nama: mitra.data_mitra ? mitra.data_mitra.nama_mitra : null,
      role: mitra.PelatihanMitra ? mitra.PelatihanMitra.role_mitra : null
    })) : [];

    return {
      pelatihan_id: item.pelatihan_id,
      nama_pelatihan: item.nama_pelatihan,
      biaya_pelatihan: item.biaya,
      daring: item.daring,
      slug_pelatihan: item.slug_pelatihan,
      lokasi_pelatihan: item.lokasi_pelatihan,
      tanggal_pelatihan: item.tanggal_pelatihan,
      thumbnail_url: item.thumbnail_url
        ? `${Env.APP_URL.replace(/\/$/, "")}/${item.thumbnail_url.replace(/^\//, "")}`
        : null,
      mitra: mitraList // Tambahkan array mitra
    };
  });
}

module.exports = makeListPelatihanResponse;