// /home/novilfahlevy/Projects/faza-training-center-backend/migrations/20251204120000-create-editor-images.js

'use strict';

module.exports = {
  /**
   * Fungsi untuk membuat tabel editor_images.
   * Tabel ini digunakan untuk menyimpan gambar yang di-upload melalui React Quill text editor.
   * @param {import('sequelize').QueryInterface} queryInterface - Interface untuk query database.
   * @param {import('sequelize').DataTypes} Sequelize - Tipe data Sequelize.
   */
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('editor_images', {
      image_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nama file gambar yang disimpan di server',
      },
      original_filename: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Nama file asli saat di-upload',
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'URL untuk mengakses gambar',
      },
      mimetype: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'MIME type gambar (image/jpeg, image/png, dll)',
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Ukuran file dalam bytes',
      },
      pengguna_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'pengguna',
          key: 'pengguna_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID pengguna yang meng-upload gambar',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Menambahkan indeks untuk pencarian berdasarkan pengguna_id
    await queryInterface.addIndex('editor_images', ['pengguna_id'], {
      name: 'editor_images_pengguna_id_idx'
    });

    // Menambahkan indeks untuk pencarian berdasarkan filename
    await queryInterface.addIndex('editor_images', ['filename'], {
      name: 'editor_images_filename_idx'
    });
  },

  /**
   * Fungsi untuk menghapus tabel editor_images.
   * @param {import('sequelize').QueryInterface} queryInterface - Interface untuk query database.
   */
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('editor_images');
  }
};
