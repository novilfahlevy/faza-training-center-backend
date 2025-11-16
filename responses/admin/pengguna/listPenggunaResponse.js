function makeListPenggunaResponse(data) {
  return {
    id: data.pengguna_id,
    role: data.role,
    email: data.email,
    nama_lengkap: data.role == 'peserta'
      ? data.data_peserta.nama_lengkap
      : data.role == 'mitra'
        ? data.data_mitra.nama_mitra
        : '-'
  };
}

module.exports = makeListPenggunaResponse;