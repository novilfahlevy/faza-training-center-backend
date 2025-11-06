// vercel-disable-edge
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('../routes');
const { db } = require('../models');
const Env = require('../config/env');

const app = express();
const PORT = Env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route utama
app.get('/', (req, res) => {
  res.json({ message: 'Selamat datang di API Faza Training Center 🚀' });
});

// Gunakan routes API
app.use('/api/v1', routes);

// Koneksi ke database
(async () => {
  try {
    await db.authenticate();
    console.log('✅ Database berhasil terkoneksi dan tabel siap.');
    await db.sync();
  } catch (err) {
    console.error('❌ Unable to connect to the database:', err);
  }
})();

// Ekspor app untuk Vercel
module.exports = app;

// Jalankan server hanya saat lokal (bukan di Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  });
}
