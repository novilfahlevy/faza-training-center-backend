'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('data_mitra', 'visi_misi', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'deskripsi_mitra',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('data_mitra', 'visi_misi');
  },
};
