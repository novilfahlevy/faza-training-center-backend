'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('peserta_pelatihan', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      pelatihan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pelatihan',
          key: 'pelatihan_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      tanggal_pendaftaran: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      status_pendaftaran: {
        type: Sequelize.ENUM('terdaftar', 'pending', 'selesai'),
        allowNull: false,
        defaultValue: 'terdaftar',
      },
      bukti_pembayaran_filename: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    // Tambahkan index untuk foreign keys
    await queryInterface.addIndex('peserta_pelatihan', ['pelatihan_id']);
    await queryInterface.addIndex('peserta_pelatihan', ['pengguna_id']);
    await queryInterface.addIndex('peserta_pelatihan', ['status_pendaftaran']);
    
    // Tambahkan unique constraint untuk mencegah duplikasi pendaftaran
    await queryInterface.addIndex('peserta_pelatihan', ['pelatihan_id', 'pengguna_id'], {
      unique: true,
      name: 'unique_peserta_pelatihan'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('peserta_pelatihan');
  }
};
