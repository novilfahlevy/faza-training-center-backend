# 📚 Faza Training Center - Backend API

## 🎯 Pengenalan Singkat
Express.js dan MySQL API server untuk website manajemen pelatihan/kursus/seminar seputar medis bernama Faza Training Center (FTC) dengan 3 role:
- **Admin**: Mengelola semua data (pelatihan, pengguna, laporan, mitra)
- **Mitra**: Mengakses informasi pelatihan dan pesertanya
- **Peserta**: Hanya melihat dan mendaftar pelatihan

## 🚀 Cara menjalankan app
```bash
cp .env.example .env
# Sesuaikan data-data yang dibutuhkan di file .env

pnpm install

pnpm dev

# > faza-training-center-backend@1.0.0 dev
# > npm run migrate && nodemon index.js

# > faza-training-center-backend@1.0.0 migrate
# > npx sequelize-cli db:migrate --config config/config.js

# Sequelize CLI [Node: 18.20.3, CLI: 6.6.3, ORM: 6.37.7]

# Loaded configuration file "config/config.js".
# Using environment "development".
# No migrations were executed, database schema was already up to date.
# [nodemon] 3.1.10
# [nodemon] to restart at any time, enter `rs`
# [nodemon] watching path(s): *.*
# [nodemon] watching extensions: js,mjs,cjs,json
# [nodemon] starting `node index.js`
# [dotenv@17.2.3] injecting env (9) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
# 🚀 Server berjalan di http://localhost:3001
# ✅ Database berhasil terkoneksi.
```

## 🏗 Alur Arsitektur

```
Request (user kirim data ke server)
  ↓
Routes (di folder /routes, Request mencari endpoint yang sesuai)
  ↓
Middleware (di folder /middleware, pengecekan autentikasi dan role user)
  ↓
Controller (di folder /controller, alur logika fitur)
  ↓
Model (di folder /model, Controller ambil data dari database)
  ↓
Response (server kirim data ke user)
```

## 📁 Struktur Folder
| Folder | Fungsi |
|--------|--------|
| `/models/` | Model-model database (memakai Sequelize ORM). |
| `/controllers/` | Controller untuk membuat alur logika suatu fitur. |
| `/routes/` | Alamat-alamat yang dipakai frontend untuk mengakses controller/fitur. |
| `/middleware/` | Verifikasi autentikasi (user sudah login atau belum) dan role user. |
| `/config/` | Konfigurasi-konfigurasi database, email, dan env. |
| `/migrations/` | Migration database. |
| `/services/` | Kode untuk service, contohnya pengiriman email |
| `/utils/` | Fungsi-fungsi pembantu |
| `/uploads/` | Untuk nyimpan file-file yang diupload user (gambar thumbnail pelatihan, bukti pengiriman, dll) |

## 📊 Model-model database
| Model | Fungsi |
|-------|--------|
| `Pengguna` | Pengguna website (admin, mitra, peserta) |
| `DataPeserta` | Informasi peserta |
| `DataMitra` | Informasi mitra |
| `Pelatihan` | Pelatihan yang dikelola oleh FTC |
| `PelatihanMitra` | Untuk mapping mitra yang ikut mengelola pelatihan |
| `PesertaPelatihan` | Peserta yang mendaftar di pelatihan |
| `LaporanKegiatan` | Laporan kegiatan |
| `EditorImage` | Untuk nyimpan gambar-gambar yang ada di laporan kegiatan |
| `ThumbnailTemporary` | Untuk nyimpan thumbnail pelatihan |

## 📡 Endpoints Definition

### Auth
```
POST   /auth/login              # Login (admin/mitra)
POST   /auth/register           # Register (peserta)
POST   /auth/verify-email       # Verifikasi email
```

### Admin
```
GET    /admin/pelatihan         # List semua pelatihan
POST   /admin/pelatihan         # Create pelatihan
PUT    /admin/pelatihan/:id     # Update pelatihan
DELETE /admin/pelatihan/:id     # Delete pelatihan

GET    /admin/pengguna          # List pengguna
POST   /admin/pengguna          # Create pengguna
PUT    /admin/pengguna/:id      # Update pengguna

GET    /admin/mitra             # List mitra
POST   /admin/mitra             # Create mitra
PUT    /admin/mitra/:id         # Update mitra

GET    /admin/laporan-kegiatan  # List laporan
POST   /admin/laporan-kegiatan  # Create laporan
PUT    /admin/laporan-kegiatan/:id
DELETE /admin/laporan-kegiatan/:id

GET    /admin/dashboard         # Dashboard stats
```

### Publik (User)
```
GET    /pelatihan               # List pelatihan publik
GET    /pelatihan/:id           # Detail pelatihan
POST   /peserta-pelatihan       # Daftar pelatihan
GET    /mitra                   # List mitra publik
GET    /profile                 # Get user profile
```