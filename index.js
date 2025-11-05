require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { db } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route utama
app.get('/', (req, res) => {
  res.json({ message: 'Selamat datang di API Faza Training Center' });
});

// Gunakan routes API
app.use('/api/v1', routes);

// Koneksi ke database dan start server
db.sync().then(() => {
  console.log('Database berhasil terkoneksi dan tabel siap.');
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Gagal terkoneksi ke database:', err);
});