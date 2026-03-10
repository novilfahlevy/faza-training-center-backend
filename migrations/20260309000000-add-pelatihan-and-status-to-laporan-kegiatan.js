'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add pelatihan_id column
    await queryInterface.addColumn('laporan_kegiatan', 'pelatihan_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'pelatihan',
        key: 'pelatihan_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Add status column
    await queryInterface.addColumn('laporan_kegiatan', 'status', {
      type: Sequelize.ENUM('draft', 'final'),
      allowNull: false,
      defaultValue: 'draft',
    });

    // Add indexes
    await queryInterface.addIndex('laporan_kegiatan', ['pelatihan_id']);
    await queryInterface.addIndex('laporan_kegiatan', ['status']);
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('laporan_kegiatan', ['status']);
    await queryInterface.removeIndex('laporan_kegiatan', ['pelatihan_id']);
    
    // Remove columns
    await queryInterface.removeColumn('laporan_kegiatan', 'status');
    await queryInterface.removeColumn('laporan_kegiatan', 'pelatihan_id');
  }
};
