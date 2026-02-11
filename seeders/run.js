/**
 * Seeder Runner - Jalankan semua seeder
 * Usage: npm run seed
 */

const seedUsers = require('./20260211-seed-users');
const seedPlatformSettings = require('./20260211-seed-platform-settings');
const { db } = require('../models');

const runSeeders = async () => {
  try {
    console.log('🚀 Starting database seeders...\n');

    // Authenticate database
    await db.authenticate();
    console.log('✅ Database connected\n');

    // Run seeders in order
    await seedUsers();
    console.log('');
    await seedPlatformSettings();
    console.log('');

    console.log('🎉 All seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeder failed:', error);
    process.exit(1);
  }
};

// Run seeders if this file is executed directly
if (require.main === module) {
  runSeeders();
}

module.exports = runSeeders;
