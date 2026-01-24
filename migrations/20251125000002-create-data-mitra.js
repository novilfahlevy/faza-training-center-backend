'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('data_mitra', {
      mitra_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nama_mitra: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      deskripsi_mitra: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      alamat_mitra: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      telepon_mitra: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      website_mitra: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pengguna_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'pengguna',
          key: 'pengguna_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    // Tambahkan index untuk foreign key
    await queryInterface.addIndex('data_mitra', ['pengguna_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('data_mitra');
  }
};
