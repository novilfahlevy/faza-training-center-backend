const { DataTypes, Op } = require("sequelize");

const createSearchCondition = (query, modelAttributes) => {
  if (!query) return null;
  const searchConditions = Object.keys(modelAttributes)
    .filter(key => modelAttributes[key].type instanceof DataTypes.STRING || modelAttributes[key].type instanceof DataTypes.TEXT)
    .map(key => ({ [key]: { [Op.like]: `%${query}%` } }));
  
  return { [Op.or]: searchConditions };
};

module.exports = createSearchCondition;