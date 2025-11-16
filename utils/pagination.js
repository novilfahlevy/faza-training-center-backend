const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  
  // Jika page tidak ada atau kurang dari 1, gunakan page 1 sebagai default
  const currentPage = page && page > 0 ? +page : 1;
  
  // Hitung offset berdasarkan page yang dimulai dari 1
  // Contoh: page 1 -> offset 0, page 2 -> offset 10, dst.
  const offset = (currentPage - 1) * limit;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalData, rows: records } = data;
  
  // Jika page tidak ada atau kurang dari 1, gunakan page 1 sebagai default
  const activePage = page && page > 0 ? +page : 1;
  
  const totalPages = Math.ceil(totalData / limit);

  return { totalData, records, totalPages, activePage };
};

module.exports = {
  getPagination,
  getPagingData,
};