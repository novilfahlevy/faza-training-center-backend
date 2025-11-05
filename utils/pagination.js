const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalData, rows: records } = data;
  const activePage = page ? +page : 0;
  const totalPages = Math.ceil(totalData / limit);

  return { totalData, records, totalPages, activePage };
};

module.exports = {
  getPagination,
  getPagingData,
};