'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pelatihan', {
      pelatihan_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      thumbnail_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nama_pelatihan: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      slug_pelatihan: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      deskripsi_pelatihan: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tanggal_pelatihan: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      durasi_pelatihan: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lokasi_pelatihan: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      biaya: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      daring: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      link_daring: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nomor_rekening: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nama_bank: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });

    // Tambahkan index untuk performa
    await queryInterface.addIndex('pelatihan', ['slug_pelatihan']);
    await queryInterface.addIndex('pelatihan', ['tanggal_pelatihan']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pelatihan');
  }
};
