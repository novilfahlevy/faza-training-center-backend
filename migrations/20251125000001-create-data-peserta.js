'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('data_peserta', {
      data_peserta_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      no_telp: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      nama_lengkap: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tempat_lahir: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      tanggal_lahir: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      jenis_kelamin: {
        type: Sequelize.ENUM('L', 'P'),
        allowNull: true,
      },
      alamat: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      profesi: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      instansi: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      no_reg_kes: {
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
    await queryInterface.addIndex('data_peserta', ['pengguna_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('data_peserta');
  }
};
