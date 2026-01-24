'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('laporan_kegiatan', {
      laporan_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      judul_laporan: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isi_laporan: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tanggal_laporan: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      pengguna_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pengguna',
          key: 'pengguna_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    });

    // Tambahkan index untuk foreign key dan tanggal
    await queryInterface.addIndex('laporan_kegiatan', ['pengguna_id']);
    await queryInterface.addIndex('laporan_kegiatan', ['tanggal_laporan']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('laporan_kegiatan');
  }
};
