const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cheerio = require('cheerio');

test('resolves a v2 player server from the episode data-embed attribute', async () => {
  let requestedUrl;
  const source = fs.readFileSync(path.join(__dirname, '../services/videoService.js'), 'utf8');
  const context = {
    module: { exports: {} },
    process: { env: { SCRAPE_URL: 'https://v2.samehadaku.how' } },
    require(name) {
      if (name === 'dotenv') return { config() {} };
      if (name === '../utils/scraper') return {
        cheerio,
        scrapeGet: async url => {
          requestedUrl = url;
          return { data: '<div class="east_player_option" data-post="17669" data-nume="2" data-type="schtml" data-embed="&lt;iframe src=&quot;https://mega.nz/embed/example&quot;&gt;&lt;/iframe&gt;"></div>' };
        },
      };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  };
  vm.runInNewContext(source, context);
  const result = await context.module.exports.getVideo('player_ajax', '17669', '2', 'schtml');
  assert.equal(requestedUrl, 'https://v2.samehadaku.how/?p=17669');
  assert.equal(result.url, 'https://mega.nz/embed/example');
  assert.match(result.response, /<iframe/);
});
