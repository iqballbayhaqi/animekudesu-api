const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const scraper = require('../utils/scraper');

test('genre pages use the v2 anime list filter instead of the shared latest widget', async () => {
  const urls = [];
  const source = fs.readFileSync(path.join(__dirname, '../services/genreService.js'), 'utf8');
  const context = {
    module: { exports: {} },
    process: { env: { SCRAPE_URL: 'https://v2.samehadaku.how' } },
    require(name) {
      if (name === 'dotenv') return { config() {} };
      if (name === '../utils/scraper') return {
        ...scraper,
        scrapeGet: async url => {
          urls.push(url);
          const title = url.includes('adult-cast') ? 'Adult Cast Anime' : 'Action Anime';
          return { data: `<article class="animepost"><div class="animposx"><a href="https://v2.samehadaku.how/anime/${title.toLowerCase().replaceAll(' ', '-')}/"><div class="content-thumb"><img src="/poster.jpg" alt="${title}"></div></a><div class="stooltip"><div class="title">${title}</div></div></div></article><div class="pagination"><span>Page 2 of 3</span></div>` };
        },
      };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(source, context);
  const action = await context.module.exports.getAnimeByGenre('action', 2);
  const adult = await context.module.exports.getAnimeByGenre('adult-cast', 2);
  assert.match(urls[0], /daftar-anime-2\/page\/2\/\?genre%5B%5D=action$/);
  assert.match(urls[1], /daftar-anime-2\/page\/2\/\?genre%5B%5D=adult-cast$/);
  assert.equal(action.data[0].title, 'Action Anime');
  assert.equal(adult.data[0].title, 'Adult Cast Anime');
  assert.equal(action.total_page, 3);
});
