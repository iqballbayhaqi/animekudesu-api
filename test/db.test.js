const test = require('node:test');
const assert = require('node:assert/strict');

process.env.BACKUP_DB_PATH = ':memory:';
const db = require('../utils/db');

test('counts saved pages within the requested category', () => {
  db.initDatabase();
  try {
    db.upsertAnimeList('new', 1, [{ link: '/one/', title: 'One', img: '' }]);
    db.upsertAnimeList('new', 2, [{ link: '/two/', title: 'Two', img: '' }]);
    db.upsertAnimeList('ongoing', 7, [{ slug: '/seven/', title: 'Seven', img: '' }]);
    assert.equal(db.getAnimeListPageCount('new'), 2);
    assert.equal(db.getAnimeListPageCount('ongoing'), 7);
  } finally {
    db.closeDatabase();
  }
});
