const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.BACKUP_DB_PATH || './data/backup.db';
const SCHEMA_PATH = path.join(__dirname, '../database/schema.sql');

let db = null;

/**
 * Initialize database connection and create tables
 */
const initDatabase = () => {
  try {
    // Create data directory if it doesn't exist
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`📁 Created database directory: ${dbDir}`);
    }

    // Open database connection
    db = new Database(DB_PATH, { verbose: console.log });
    console.log(`✅ SQLite database connected: ${DB_PATH}`);

    // Read and execute schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema);
    console.log('✅ Database tables initialized');

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    return db;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

/**
 * Get database instance
 */
const getDatabase = () => {
  if (!db) {
    return initDatabase();
  }
  return db;
};

/**
 * Close database connection
 */
const closeDatabase = () => {
  if (db) {
    db.close();
    console.log('🔒 Database connection closed');
    db = null;
  }
};

/**
 * Insert or update anime list
 */
const upsertAnimeList = (category, page, animeData) => {
  const database = getDatabase();
  const stmt = database.prepare(`
    INSERT INTO anime_list (category, page, slug, title, img, data_json, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(category, page, slug) 
    DO UPDATE SET 
      title = excluded.title,
      img = excluded.img,
      data_json = excluded.data_json,
      updated_at = CURRENT_TIMESTAMP
  `);

  const insert = database.transaction((items) => {
    for (const item of items) {
      stmt.run(
        category,
        page,
        item.slug || item.link,
        item.title,
        item.img,
        JSON.stringify(item)
      );
    }
  });

  insert(animeData);
};

/**
 * Get anime list from backup
 */
const getAnimeList = (category, page) => {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT data_json, updated_at 
    FROM anime_list 
    WHERE category = ? AND page = ?
    ORDER BY id
  `);

  const results = stmt.all(category, page);
  return results.map(row => ({
    ...JSON.parse(row.data_json),
    _backup_updated_at: row.updated_at
  }));
};

/**
 * Insert or update anime detail
 */
const upsertAnimeDetail = (slug, data) => {
  const database = getDatabase();
  const stmt = database.prepare(`
    INSERT INTO anime_detail (slug, title, data_json, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(slug) 
    DO UPDATE SET 
      title = excluded.title,
      data_json = excluded.data_json,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(slug, data.title, JSON.stringify(data));
};

/**
 * Get anime detail from backup
 */
const getAnimeDetail = (slug) => {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT data_json, updated_at 
    FROM anime_detail 
    WHERE slug = ?
  `);

  const result = stmt.get(slug);
  if (!result) return null;

  return {
    ...JSON.parse(result.data_json),
    _backup_updated_at: result.updated_at
  };
};

/**
 * Insert or update episode detail
 */
const upsertEpisodeDetail = (slug, data) => {
  const database = getDatabase();
  const stmt = database.prepare(`
    INSERT INTO episode_detail (slug, episode_number, title, data_json, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(slug) 
    DO UPDATE SET 
      episode_number = excluded.episode_number,
      title = excluded.title,
      data_json = excluded.data_json,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(slug, data.episode_number, data.title, JSON.stringify(data));
};

/**
 * Get episode detail from backup
 */
const getEpisodeDetail = (slug) => {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT data_json, updated_at 
    FROM episode_detail 
    WHERE slug = ?
  `);

  const result = stmt.get(slug);
  if (!result) return null;

  return {
    ...JSON.parse(result.data_json),
    _backup_updated_at: result.updated_at
  };
};

/**
 * Insert or update batch detail
 */
const upsertBatchDetail = (slug, data) => {
  const database = getDatabase();
  const stmt = database.prepare(`
    INSERT INTO batch_detail (slug, title, data_json, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(slug) 
    DO UPDATE SET 
      title = excluded.title,
      data_json = excluded.data_json,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(slug, data.title, JSON.stringify(data));
};

/**
 * Get batch detail from backup
 */
const getBatchDetail = (slug) => {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT data_json, updated_at 
    FROM batch_detail 
    WHERE slug = ?
  `);

  const result = stmt.get(slug);
  if (!result) return null;

  return {
    ...JSON.parse(result.data_json),
    _backup_updated_at: result.updated_at
  };
};

/**
 * Get database statistics
 */
const getDbStats = () => {
  const database = getDatabase();
  
  const animeListCount = database.prepare('SELECT COUNT(*) as count FROM anime_list').get();
  const animeDetailCount = database.prepare('SELECT COUNT(*) as count FROM anime_detail').get();
  const episodeDetailCount = database.prepare('SELECT COUNT(*) as count FROM episode_detail').get();
  const batchDetailCount = database.prepare('SELECT COUNT(*) as count FROM batch_detail').get();

  return {
    anime_list: animeListCount.count,
    anime_detail: animeDetailCount.count,
    episode_detail: episodeDetailCount.count,
    batch_detail: batchDetailCount.count
  };
};

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
  upsertAnimeList,
  getAnimeList,
  upsertAnimeDetail,
  getAnimeDetail,
  upsertEpisodeDetail,
  getEpisodeDetail,
  upsertBatchDetail,
  getBatchDetail,
  getDbStats
};
