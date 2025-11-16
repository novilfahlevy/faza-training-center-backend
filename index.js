const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { db } = require('./models');
const Env = require('./config/env');
const path = require('path');

const app = express();
const PORT = Env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve file statis
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Gunakan routes API
app.use('/api/v1', routes);

// Route utama
app.get('/', (req, res) => res.json({ message: 'Selamat datang di API Faza Training Center 🚀' }));

// Koneksi ke database
(async () => {
  try {
    await db.authenticate();
    console.log('✅ Database berhasil terkoneksi.');
    await db.sync();
  } catch (err) {
    console.error('❌ Koneksi database gagal:', err);
  }
})();

app.listen(PORT, () => console.log(`🚀 Server berjalan di http://localhost:${PORT}`));