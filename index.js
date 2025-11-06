// vercel-disable-edge
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { db } = require('./models');
const Env = require('./config/env');

const app = express();
const PORT = Env.PORT;

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
db.authenticate()
  .then(() => console.log('✅ Database berhasil terkoneksi dan tabel siap.'))
  .catch(err => console.error('❌ Unable to connect:', err));

db.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Gagal terkoneksi ke database:', err);
});