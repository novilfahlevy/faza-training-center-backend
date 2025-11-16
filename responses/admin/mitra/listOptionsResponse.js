const Env = require("../../../config/env");

function makeListOptionsResponse(data) {
  return {
    id: data.pengguna_id,
    nama: data.data_mitra.nama_mitra
  };
}

module.exports = makeListOptionsResponse;