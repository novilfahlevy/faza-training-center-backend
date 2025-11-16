const makeProfilResponse = ({ user, peserta }) => {
  return {
    id: user.pengguna_id,
    email: user.email,
    role: user.role,

    nama_lengkap: peserta?.nama_lengkap || null,
    no_telp: peserta?.no_telp || null,
    jenis_kelamin: peserta?.jenis_kelamin || null,
    tempat_lahir: peserta?.tempat_lahir || null,
    tanggal_lahir: peserta?.tanggal_lahir || null,
    alamat: peserta?.alamat || null,
    profesi: peserta?.profesi || null,
    instansi: peserta?.instansi || null,
    no_reg_kes: peserta?.no_reg_kes || null,

    created_at: peserta?.created_at || user.created_at,
    updated_at: peserta?.updated_at || user.updated_at
  };
};

module.exports = makeProfilResponse;
