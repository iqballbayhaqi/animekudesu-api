const express = require('express');
const router = express.Router();
const { runBackupNow } = require('../jobs/scheduler');
const { getDbStats } = require('../utils/db');

/**
 * @swagger
 * /backup/manual:
 *   post:
 *     summary: Trigger manual backup
 *     description: Manually run the daily backup process with real-time progress
 *     tags: [Backup]
 *     responses:
 *       200:
 *         description: Backup completed successfully
 *       500:
 *         description: Backup failed
 */
router.post('/manual', async (req, res) => {
  try {
    // Set headers for streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    // Override console.log to also write to response
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      const message = args.join(' ');
      originalLog(...args);
      res.write(message + '\n');
    };
    
    console.error = (...args) => {
      const message = args.join(' ');
      originalError(...args);
      res.write('ERROR: ' + message + '\n');
    };
    
    console.log('\n🚀 Manual backup triggered via API...\n');
    
    const { runDailyBackup } = require('../services/backupService');
    const stats = await runDailyBackup();
    
    // Restore original console functions
    console.log = originalLog;
    console.error = originalError;
    
    res.write('\n✅ BACKUP COMPLETED!\n');
    res.write('\n📊 Final Statistics:\n');
    res.write(JSON.stringify(stats, null, 2) + '\n');
    res.end();
  } catch (error) {
    console.error('❌ Manual backup failed:', error);
    res.write('\n❌ BACKUP FAILED: ' + error.message + '\n');
    res.status(500).end();
  }
});

/**
 * @swagger
 * /backup/stats:
 *   get:
 *     summary: Get database statistics
 *     description: Get current backup database statistics
 *     tags: [Backup]
 *     responses:
 *       200:
 *         description: Database statistics
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getDbStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
