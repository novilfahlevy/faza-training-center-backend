const { PlatformSettings } = require('../models');

const seedPlatformSettings = async () => {
  try {
    console.log('🌱 Seeding platform settings...');

    // Check if settings already exists
    const existingSettings = await PlatformSettings.findByPk(1);

    if (!existingSettings) {
      await PlatformSettings.create({
        setting_id: 1,
        whatsapp_number: '+62 852-1331-4700',
        email: 'fazatrainingcenter@gmail.com',
        address: 'Jl. Contoh No. 123, Jakarta Selatan, Indonesia',
      });
      console.log('✅ Platform settings created with default values');
    } else {
      console.log('⏭️  Platform settings already exist');
    }

    console.log('✨ Platform settings seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding platform settings:', error);
    throw error;
  }
};

module.exports = seedPlatformSettings;
