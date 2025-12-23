const Env = require("../../../config/env");

function makeDetailPenggunaResponse(data) {
  const response = {
    id: data.pengguna_id,
    role: data.role,
    email: data.email,
  };

  // Tambahkan data peserta jika role adalah peserta
  if (data.role === 'peserta' && data.data_peserta) {
    response.nama_lengkap = data.data_peserta.nama_lengkap;
    response.no_telp = data.data_peserta.no_telp;
    response.tempat_lahir = data.data_peserta.tempat_lahir;
    response.tanggal_lahir = data.data_peserta.tanggal_lahir;
    response.jenis_kelamin = data.data_peserta.jenis_kelamin;
    response.alamat = data.data_peserta.alamat;
    response.profesi = data.data_peserta.profesi;
    response.instansi = data.data_peserta.instansi;
    response.no_reg_kes = data.data_peserta.no_reg_kes;
  }

  // Tambahkan data mitra jika role adalah mitra
  if (data.role === 'mitra' && data.data_mitra) {
    response.nama_mitra = data.data_mitra.nama_mitra;
    response.deskripsi_mitra = data.data_mitra.deskripsi_mitra;
    response.alamat_mitra = data.data_mitra.alamat_mitra;
    response.telepon_mitra = data.data_mitra.telepon_mitra;
    response.website_mitra = data.data_mitra.website_mitra;
    response.logo_mitra = `${Env.APP_URL.replace(/\/$/, '')}/${data.data_mitra.logo_mitra.replace(/^\//, '')}`;
  }

  return response;
}

module.exports = makeDetailPenggunaResponse;