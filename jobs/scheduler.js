const cron = require('node-cron');
const backupService = require('../services/backupService');
require('dotenv').config();

const TIMEZONE = process.env.BACKUP_TIMEZONE || 'Asia/Jakarta';

/**
 * Initialize and start the backup scheduler
 */
const startBackupScheduler = () => {
  console.log('📅 Initializing backup scheduler...');
  console.log(`⏰ Timezone: ${TIMEZONE}`);
  console.log('🕐 Schedule: Daily at 00:00 (midnight)');

  // Schedule daily backup at midnight WIB
  // Cron expression: '0 0 * * *' = every day at 00:00
  const task = cron.schedule('0 0 * * *', async () => {
    console.log('\n⏰ Scheduled backup triggered at:', new Date().toISOString());
    
    try {
      await backupService.runDailyBackup();
    } catch (error) {
      console.error('❌ Scheduled backup failed:', error);
    }
  }, {
    scheduled: true,
    timezone: TIMEZONE
  });

  console.log('✅ Backup scheduler started successfully');
  console.log('   Next backup will run at midnight (00:00) WIB\n');

  return task;
};

/**
 * Run backup immediately (for testing)
 */
const runBackupNow = async () => {
  console.log('\n🚀 Running manual backup...');
  try {
    const result = await backupService.runDailyBackup();
    console.log('✅ Manual backup completed successfully');
    return result;
  } catch (error) {
    console.error('❌ Manual backup failed:', error);
    throw error;
  }
};

module.exports = {
  startBackupScheduler,
  runBackupNow
};
