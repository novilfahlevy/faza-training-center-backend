'use strict';

module.exports = {
  /**
   * Fungsi untuk menerapkan migrasi (menambahkan kolom).
   * @param {import('sequelize').QueryInterface} queryInterface - Interface untuk query database.
   * @param {import('sequelize').Sequelize} Sequelize - Objek Sequelize.
   */
  async up(queryInterface, Sequelize) {
    // Menambahkan kolom 'is_verified'
    await queryInterface.addColumn('pengguna', 'is_verified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Nilai default untuk pengguna yang sudah ada
    });

    // Menambahkan kolom 'email_verification_token'
    await queryInterface.addColumn('pengguna', 'email_verification_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Menambahkan kolom 'verified_at'
    await queryInterface.addColumn('pengguna', 'verified_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  /**
   * Fungsi untuk membatalkan migrasi (menghapus kolom).
   * @param {import('sequelize').QueryInterface} queryInterface - Interface untuk query database.
   * @param {import('sequelize').Sequelize} Sequelize - Objek Sequelize.
   */
  async down(queryInterface, Sequelize) {
    // Menghapus kolom 'verified_at'
    await queryInterface.removeColumn('pengguna', 'verified_at');

    // Menghapus kolom 'email_verification_token'
    await queryInterface.removeColumn('pengguna', 'email_verification_token');

    // Menghapus kolom 'is_verified'
    await queryInterface.removeColumn('pengguna', 'is_verified');
  }
};