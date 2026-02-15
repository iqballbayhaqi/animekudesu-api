-- SQLite Schema for Anime Backup Database

-- Anime List Table (for all anime list pages)
CREATE TABLE IF NOT EXISTS anime_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category VARCHAR(50) NOT NULL, -- 'new', 'ongoing', 'completed', 'list', 'type', 'order'
  page INTEGER NOT NULL,
  slug VARCHAR(255) NOT NULL,
  title TEXT NOT NULL,
  img TEXT,
  data_json TEXT NOT NULL, -- JSON string of full anime object
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, page, slug)
);

-- Anime Detail Table
CREATE TABLE IF NOT EXISTS anime_detail (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  data_json TEXT NOT NULL, -- JSON string of full anime detail
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Episode Detail Table
CREATE TABLE IF NOT EXISTS episode_detail (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug VARCHAR(255) NOT NULL UNIQUE,
  episode_number INTEGER,
  title TEXT,
  data_json TEXT NOT NULL, -- JSON string of full episode detail
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Batch Detail Table
CREATE TABLE IF NOT EXISTS batch_detail (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title TEXT,
  data_json TEXT NOT NULL, -- JSON string of full batch detail
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_anime_list_category_page ON anime_list(category, page);
CREATE INDEX IF NOT EXISTS idx_anime_list_slug ON anime_list(slug);
CREATE INDEX IF NOT EXISTS idx_anime_detail_slug ON anime_detail(slug);
CREATE INDEX IF NOT EXISTS idx_episode_detail_slug ON episode_detail(slug);
CREATE INDEX IF NOT EXISTS idx_batch_detail_slug ON batch_detail(slug);
