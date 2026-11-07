const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('daily backup does not save fallback data as a fresh scrape', async () => {
  let writes = 0;
  const source = fs.readFileSync(path.join(__dirname, '../services/backupService.js'), 'utf8');
  const db = {
    upsertAnimeList: () => { writes += 1; },
    getAnimeList: () => [],
    getDbStats: () => ({ anime_list: 0, anime_detail: 0, episode_detail: 0, batch_detail: 0 }),
  };
  const cachedResult = {
    data: [{ title: 'Old anime', link: '/old-anime/' }],
    current_page: 1,
    total_page: 1,
    from_backup: true,
  };
  const animeService = {
    getNewAnime: async () => cachedResult,
    getOngoingAnime: async () => cachedResult,
    getCompletedAnime: async () => cachedResult,
    getListAnime: async () => cachedResult,
  };
  const context = {
    module: { exports: {} },
    console: { log: () => {}, error: () => {} },
    require(name) {
      if (name === '../utils/db') return db;
      if (name === './animeService') return animeService;
      if (name === './detailService') return {};
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(source, context);
  await context.module.exports.runDailyBackup();
  assert.equal(writes, 0);
});
