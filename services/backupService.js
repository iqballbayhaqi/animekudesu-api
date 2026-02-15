const { 
  upsertAnimeList, 
  getAnimeList, 
  upsertAnimeDetail, 
  getAnimeDetail,
  upsertEpisodeDetail,
  getEpisodeDetail,
  upsertBatchDetail,
  getBatchDetail,
  getDbStats
} = require('../utils/db');

const animeService = require('./animeService');
const detailService = require('./detailService');

/**
 * Save anime list to database
 */
const saveAnimeList = async (category, page, data) => {
  try {
    if (Array.isArray(data) && data.length > 0) {
      upsertAnimeList(category, page, data);
      console.log(`✅ Saved ${data.length} items to backup: ${category} page ${page}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error saving anime list (${category} page ${page}):`, error.message);
    return false;
  }
};

/**
 * Get anime list from database
 */
const getAnimeListBackup = (category, page) => {
  try {
    const data = getAnimeList(category, page);
    return data;
  } catch (error) {
    console.error(`❌ Error getting anime list backup (${category} page ${page}):`, error.message);
    return [];
  }
};

/**
 * Save anime detail to database
 */
const saveAnimeDetail = async (slug, data) => {
  try {
    upsertAnimeDetail(slug, data);
    console.log(`✅ Saved anime detail to backup: ${slug}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving anime detail (${slug}):`, error.message);
    return false;
  }
};

/**
 * Get anime detail from database
 */
const getAnimeDetailBackup = (slug) => {
  try {
    return getAnimeDetail(slug);
  } catch (error) {
    console.error(`❌ Error getting anime detail backup (${slug}):`, error.message);
    return null;
  }
};

/**
 * Save episode detail to database
 */
const saveEpisodeDetail = async (slug, data) => {
  try {
    upsertEpisodeDetail(slug, data);
    console.log(`✅ Saved episode detail to backup: ${slug}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving episode detail (${slug}):`, error.message);
    return false;
  }
};

/**
 * Get episode detail from database
 */
const getEpisodeDetailBackup = (slug) => {
  try {
    return getEpisodeDetail(slug);
  } catch (error) {
    console.error(`❌ Error getting episode detail backup (${slug}):`, error.message);
    return null;
  }
};

/**
 * Save batch detail to database
 */
const saveBatchDetail = async (slug, data) => {
  try {
    upsertBatchDetail(slug, data);
    console.log(`✅ Saved batch detail to backup: ${slug}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving batch detail (${slug}):`, error.message);
    return false;
  }
};

/**
 * Get batch detail from database
 */
const getBatchDetailBackup = (slug) => {
  try {
    return getBatchDetail(slug);
  } catch (error) {
    console.error(`❌ Error getting batch detail backup (${slug}):`, error.message);
    return null;
  }
};

/**
 * Crawl all pages for a specific category
 */
const crawlCategory = async (categoryName, crawlFunction, maxPages = null) => {
  console.log(`\n🔄 Starting crawl for category: ${categoryName}`);
  let page = 1;
  let hasMore = true;
  let totalItems = 0;

  while (hasMore) {
    try {
      console.log(`  📄 Crawling ${categoryName} page ${page}...`);
      const result = await crawlFunction(page);

      if (result.data && result.data.length > 0) {
        // Save to database
        await saveAnimeList(categoryName, page, result.data);
        totalItems += result.data.length;

        // Check if there are more pages
        if (result.current_page >= result.total_page) {
          hasMore = false;
        } else if (maxPages && page >= maxPages) {
          console.log(`  ⚠️ Reached max pages limit (${maxPages}) for ${categoryName}`);
          hasMore = false;
        } else {
          page++;
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`  ❌ Error crawling ${categoryName} page ${page}:`, error.message);
      hasMore = false;
    }
  }

  console.log(`✅ Completed ${categoryName}: ${totalItems} items across ${page} pages`);
  return { totalItems, totalPages: page };
};

/**
 * Backup anime details for anime in the list
 */
const backupAnimeDetails = async (category, maxPages = 3) => {
  console.log(`\n📦 Backing up anime details for ${category}...`);
  let totalBackedUp = 0;

  for (let page = 1; page <= maxPages; page++) {
    try {
      const animeList = getAnimeList(category, page);
      
      for (const anime of animeList) {
        try {
          const slug = (anime.slug || anime.link || '').replace(/^\/anime\//, '');
          if (slug) {
            // Check if we already have recent data (less than 7 days old)
            const existing = getAnimeDetail(slug);
            const shouldUpdate = !existing || 
              (new Date() - new Date(existing._backup_updated_at)) > 7 * 24 * 60 * 60 * 1000;

            if (shouldUpdate) {
              const detail = await detailService.getAnimeDetail(slug);
              await saveAnimeDetail(slug, detail);
              totalBackedUp++;
              
              // Small delay
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        } catch (error) {
          console.error(`  ⚠️ Failed to backup detail for ${anime.title}:`, error.message);
        }
      }
    } catch (error) {
      console.error(`  ❌ Error processing page ${page}:`, error.message);
    }
  }

  console.log(`✅ Backed up ${totalBackedUp} anime details for ${category}`);
  return totalBackedUp;
};

/**
 * Run daily comprehensive backup
 */
const runDailyBackup = async () => {
  const startTime = Date.now();
  console.log('\n' + '='.repeat(60));
  console.log('🚀 STARTING DAILY BACKUP');
  console.log('📅 Time:', new Date().toISOString());
  console.log('='.repeat(60));

  const stats = {
    categories: {},
    detailsBackedUp: 0,
    startTime: new Date().toISOString(),
    errors: []
  };

  try {
    // 1. Crawl New Anime
    stats.categories.new = await crawlCategory('new', animeService.getNewAnime);

    // 2. Crawl Ongoing Anime
    stats.categories.ongoing = await crawlCategory('ongoing', animeService.getOngoingAnime);

    // 3. Crawl Completed Anime
    stats.categories.completed = await crawlCategory('completed', animeService.getCompletedAnime);

    // 4. Crawl All Anime List
    stats.categories.list = await crawlCategory('list', animeService.getListAnime);

    // 5. Backup anime details (sample from recent pages)
    console.log('\n📦 Starting anime details backup...');
    stats.detailsBackedUp += await backupAnimeDetails('new', 2);
    stats.detailsBackedUp += await backupAnimeDetails('ongoing', 3);

    // Get final database statistics
    const dbStats = getDbStats();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log('✅ BACKUP COMPLETED SUCCESSFULLY');
    console.log('⏱️  Duration:', duration, 'minutes');
    console.log('📊 Database Statistics:');
    console.log('  - Anime List entries:', dbStats.anime_list);
    console.log('  - Anime Details:', dbStats.anime_detail);
    console.log('  - Episode Details:', dbStats.episode_detail);
    console.log('  - Batch Details:', dbStats.batch_detail);
    console.log('='.repeat(60) + '\n');

    stats.endTime = new Date().toISOString();
    stats.duration = duration;
    stats.dbStats = dbStats;

    return stats;
  } catch (error) {
    console.error('\n❌ BACKUP FAILED:', error);
    stats.errors.push(error.message);
    throw error;
  }
};

module.exports = {
  saveAnimeList,
  getAnimeListBackup,
  saveAnimeDetail,
  getAnimeDetailBackup,
  saveEpisodeDetail,
  getEpisodeDetailBackup,
  saveBatchDetail,
  getBatchDetailBackup,
  runDailyBackup
};
