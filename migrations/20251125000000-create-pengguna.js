'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pengguna', {
      pengguna_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('admin', 'mitra', 'peserta'),
        allowNull: false,
      },
    });

    // Tambahkan index untuk performa
    await queryInterface.addIndex('pengguna', ['email']);
    await queryInterface.addIndex('pengguna', ['role']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pengguna');
  }
};
