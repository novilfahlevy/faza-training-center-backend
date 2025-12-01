// /home/novilfahlevy/Projects/faza-training-center-backend/migrations/20240523100000-create-pelatihan-mitra.js

'use strict';

module.exports = {
  /**
   * Fungsi untuk membuat tabel pelatihan_mitra.
   * @param {import('sequelize').QueryInterface} queryInterface - Interface untuk query database.
   * @param {import('sequelize').DataTypes} Sequelize - Tipe data Sequelize.
   */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pelatihan_mitra', {
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
          model: 'pelatihan', // Nama tabel yang direferensikan
          key: 'pelatihan_id', // Kolom kunci pada tabel yang direferensikan
        },
        onUpdate: 'CASCADE', // Jika pelatihan_id di tabel pelatihan diupdate, update juga di sini
        onDelete: 'CASCADE', // Jika pelatihan dihapus, hapus juga record terkait di tabel ini
      },
      pengguna_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pengguna', // Nama tabel yang direferensikan
          key: 'pengguna_id', // Kolom kunci pada tabel yang direferensikan
        },
        onUpdate: 'CASCADE', // Jika pengguna_id di tabel pengguna diupdate, update juga di sini
        onDelete: 'CASCADE', // Jika pengguna dihapus, hapus juga record terkait di tabel ini
      },
      role_mitra: {
        type: Sequelize.ENUM('pemateri', 'fasilitator', 'penyelenggara'),
        allowNull: false,
        defaultValue: 'pemateri',
      },
      // Anda bisa menambahkan timestamps jika ingin melacak kapan relasi ini dibuat/diperbarui
      // createdAt: {
      //   allowNull: false,
      //   type: Sequelize.DATE
      // },
      // updatedAt: {
      //   allowNull: false,
      //   type: Sequelize.DATE
      // }
    });

    // Menambahkan indeks gabungan untuk memastikan kombinasi pelatihan_id dan pengguna_id unik
    // Ini mencegah duplikasi entri untuk mitra yang sama pada pelatihan yang sama
    await queryInterface.addIndex('pelatihan_mitra', ['pelatihan_id', 'pengguna_id'], {
      unique: true,
      name: 'pelatihan_mitra_pelatihan_id_pengguna_id_unique'
    });
  },

  /**
   * Fungsi untuk menghapus tabel pelatihan_mitra.
   * @param {import('sequelize').QueryInterface} queryInterface - Interface untuk query database.
   * @param {import('sequelize').DataTypes} Sequelize - Tipe data Sequelize.
   */
  down: async (queryInterface, Sequelize) => {
    // Hapus indeks terlebih dahulu sebelum menghapus tabel
    await queryInterface.removeIndex('pelatihan_mitra', 'pelatihan_mitra_pelatihan_id_pengguna_id_unique');
    
    // Hapus tabel pelatihan_mitra
    await queryInterface.dropTable('pelatihan_mitra');
  }
};