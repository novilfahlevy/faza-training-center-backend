'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('peserta_pelatihan', 'status_pendaftaran', {
      type: Sequelize.ENUM('terdaftar', 'pending', 'selesai', 'tidak_hadir'),
      allowNull: false,
      defaultValue: 'terdaftar',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('peserta_pelatihan', 'status_pendaftaran', {
      type: Sequelize.ENUM('terdaftar', 'pending', 'selesai'),
      allowNull: false,
      defaultValue: 'terdaftar',
    });
  }
};
