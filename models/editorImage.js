// /home/novilfahlevy/Projects/faza-training-center-backend/models/editorImage.js
const { DataTypes } = require('sequelize');
const db = require('../config/database');

const EditorImage = db.define('editor_images', {
  image_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nama file gambar yang disimpan di server',
  },
  original_filename: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Nama file asli saat di-upload',
  },
  url: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'URL untuk mengakses gambar',
  },
  mimetype: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'MIME type gambar (image/jpeg, image/png, dll)',
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Ukuran file dalam bytes',
  },
  pengguna_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID pengguna yang meng-upload gambar',
  },
}, {
  tableName: 'editor_images',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = EditorImage;
