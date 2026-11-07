const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadService(scrapeGet) {
  const backup = [{ title: 'Saved anime', link: '/saved-anime/' }];
  const selector = { text: () => '', each: () => {} };
  const source = fs.readFileSync(path.join(__dirname, '../services/animeService.js'), 'utf8');
  const context = {
    module: { exports: {} },
    console: { error: () => {}, log: () => {} },
    process: { env: { SCRAPE_URL: 'https://source.example', USE_SQLITE_BACKUP: 'false' } },
    require(name) {
      if (name === '../utils/scraper') return { scrapeGet, cheerio: { load: () => () => selector } };
      if (name === './backupService') return {
        getAnimeListBackup: () => backup,
        getAnimeListPageCount: () => 12,
      };
      if (name === 'dotenv') return { config: () => {} };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(source, context);
  return context.module.exports;
}

test('uses saved anime when the source request fails', async () => {
  const service = loadService(async () => { throw new Error('Upstream HTTP 403'); });
  const result = await service.getNewAnime(1);
  assert.equal(result.data[0].title, 'Saved anime');
  assert.equal(result.from_backup, true);
});

test('uses saved anime when the source page contains no anime', async () => {
  const service = loadService(async () => ({ data: '<html></html>', status: 200 }));
  const result = await service.getNewAnime(1);
  assert.equal(result.data[0].title, 'Saved anime');
  assert.equal(result.from_backup, true);
});

test('uses saved page two when the source pagination is missing', async () => {
  const service = loadService(async () => ({ data: '<html></html>', status: 200 }));
  const result = await service.getNewAnime(2);
  assert.equal(result.data[0].title, 'Saved anime');
  assert.equal(result.from_backup, true);
  assert.equal(result.total_page, 12);
});
