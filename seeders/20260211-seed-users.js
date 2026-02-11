const bcrypt = require('bcryptjs');
const { Pengguna, DataPeserta, DataMitra } = require('../models');

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding pengguna...');

    // 1. ADMIN ACCOUNT
    const adminEmail = 'admin@fazatraining.com';
    const adminExists = await Pengguna.findOne({ where: { email: adminEmail } });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await Pengguna.create({
        email: adminEmail,
        password_hash: hashedPassword,
        role: 'admin',
        is_verified: true,
        verified_at: new Date(),
      });
      console.log('✅ Admin account created: admin@fazatraining.com');
    } else {
      console.log('⏭️  Admin account already exists');
    }

    // 2. MITRA ACCOUNTS
    const mitraAccounts = [
      {
        email: 'mitra1@fazatraining.com',
        password: 'Mitra@123',
        nama_mitra: 'PT Solusi Teknologi Indonesia',
        deskripsi_mitra: 'Perusahaan IT terkemuka yang menyediakan solusi teknologi terpadu',
        alamat_mitra: 'Jl. Sudirman No. 456, Jakarta Pusat',
        telepon_mitra: '+62 21 1234 5678',
        website_mitra: 'https://solusitech.id',
      },
      {
        email: 'mitra2@fazatraining.com',
        password: 'Mitra@123',
        nama_mitra: 'CV Konsultan Bisnis Maju',
        deskripsi_mitra: 'Konsultan bisnis profesional dengan pengalaman lebih dari 15 tahun',
        alamat_mitra: 'Jl. Gatot Subroto No. 789, Jakarta Selatan',
        telepon_mitra: '+62 21 9876 5432',
        website_mitra: 'https://konsultanbisnis.co.id',
      },
    ];

    for (const mitra of mitraAccounts) {
      const mitraExists = await Pengguna.findOne({ where: { email: mitra.email } });
      
      if (!mitraExists) {
        const hashedPassword = await bcrypt.hash(mitra.password, 10);
        const penggunaData = await Pengguna.create({
          email: mitra.email,
          password_hash: hashedPassword,
          role: 'mitra',
          is_verified: true,
          verified_at: new Date(),
        });

        // Create associated DataMitra
        await DataMitra.create({
          pengguna_id: penggunaData.pengguna_id,
          nama_mitra: mitra.nama_mitra,
          deskripsi_mitra: mitra.deskripsi_mitra,
          alamat_mitra: mitra.alamat_mitra,
          telepon_mitra: mitra.telepon_mitra,
          website_mitra: mitra.website_mitra,
        });

        console.log(`✅ Mitra account created: ${mitra.email}`);
      } else {
        console.log(`⏭️  Mitra account already exists: ${mitra.email}`);
      }
    }

    // 3. PESERTA ACCOUNTS
    const pesertaAccounts = [
      {
        email: 'peserta1@gmail.com',
        password: 'Peserta@123',
        nama_lengkap: 'Ahmad Ridho Pratama',
        no_telp: '+62 812 3456 7890',
        alamat: 'Jl. Merdeka No. 123, Jakarta',
        asal_sekolah: 'SMA Negeri 1 Jakarta',
      },
      {
        email: 'peserta2@gmail.com',
        password: 'Peserta@123',
        nama_lengkap: 'Siti Nurhaliza',
        no_telp: '+62 821 8765 4321',
        alamat: 'Jl. Ahmad Yani No. 456, Bandung',
        asal_sekolah: 'SMK Negeri 3 Bandung',
      },
      {
        email: 'peserta3@gmail.com',
        password: 'Peserta@123',
        nama_lengkap: 'Budi Santoso',
        no_telp: '+62 852 9999 8888',
        alamat: 'Jl. Diponegoro No. 789, Surabaya',
        asal_sekolah: 'SMA Negeri 2 Surabaya',
      },
    ];

    for (const peserta of pesertaAccounts) {
      const pesertaExists = await Pengguna.findOne({ where: { email: peserta.email } });
      
      if (!pesertaExists) {
        const hashedPassword = await bcrypt.hash(peserta.password, 10);
        const penggunaData = await Pengguna.create({
          email: peserta.email,
          password_hash: hashedPassword,
          role: 'peserta',
          is_verified: true,
          verified_at: new Date(),
        });

        // Create associated DataPeserta
        await DataPeserta.create({
          pengguna_id: penggunaData.pengguna_id,
          nama_lengkap: peserta.nama_lengkap,
          no_telp: peserta.no_telp,
          alamat: peserta.alamat,
          asal_sekolah: peserta.asal_sekolah,
        });

        console.log(`✅ Peserta account created: ${peserta.email}`);
      } else {
        console.log(`⏭️  Peserta account already exists: ${peserta.email}`);
      }
    }

    console.log('✨ Pengguna seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding pengguna:', error);
    throw error;
  }
};

module.exports = seedUsers;
