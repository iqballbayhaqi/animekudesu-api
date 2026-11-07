const test = require('node:test');
const assert = require('node:assert/strict');
const { validateScrapeResponse } = require('../utils/scrapeResponse');

test('rejects a Cloudflare challenge even when the HTTP status is 200', () => {
  assert.throws(
    () => validateScrapeResponse({ statusCode: 200, body: '<title>Just a moment...</title>' }),
    /upstream/i
  );
});

test('accepts a normal source page', () => {
  assert.doesNotThrow(() => validateScrapeResponse({ statusCode: 200, body: '<html><title>Anime</title></html>' }));
});
