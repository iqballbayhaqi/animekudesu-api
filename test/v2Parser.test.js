const test = require('node:test');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const { parseAnimeList, parsePagination } = require('../utils/scraper');

test('parses anime cards and pagination from the v2 list structure', () => {
  const $ = cheerio.load(`
    <article class="animepost"><div class="animposx">
      <a href="https://v2.samehadaku.how/anime/one-piece/" title="One Piece">
        <div class="content-thumb"><img src="/poster.jpg" alt="One Piece"><div class="type">TV</div><div class="score">8.72</div></div>
      </a>
      <div class="stooltip"><div class="title">One Piece</div><div class="genres"><div><a href="/genre/action/">Action</a></div></div></div>
    </div></article>
    <div class="pagination"><span>Page 1 of 27</span></div>
  `);
  const items = parseAnimeList($);
  assert.equal(items.length, 1);
  assert.equal(items[0].slug, '/one-piece/');
  assert.equal(items[0].detail_url, '/detail-anime/one-piece/');
  assert.equal(items[0].title, 'One Piece');
  assert.deepEqual(parsePagination($), { current_page: 1, total_page: 27 });
});
