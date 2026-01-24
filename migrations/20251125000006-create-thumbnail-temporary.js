'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('daftar_pelatihan_thumbnail_temporary', {
      thumbnail_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Tambahkan index untuk created_at agar mudah mencari file lama yang perlu dibersihkan
    await queryInterface.addIndex('daftar_pelatihan_thumbnail_temporary', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('daftar_pelatihan_thumbnail_temporary');
  }
};
