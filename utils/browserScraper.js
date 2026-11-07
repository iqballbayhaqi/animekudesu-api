const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { validateScrapeResponse } = require('./scrapeResponse');

puppeteer.use(StealthPlugin());

let browserPromise;
let active = 0;
const waiting = [];
const cache = new Map();

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    }).then(browser => {
      browser.on('disconnected', () => { browserPromise = undefined; });
      return browser;
    }).catch(error => {
      browserPromise = undefined;
      throw error;
    });
  }
  return browserPromise;
}

async function scrapeWithBrowser(url) {
  const cached = cache.get(url);
  if (cached && cached.expires > Date.now()) return cached.value;
  if (active >= 2) await new Promise(resolve => waiting.push(resolve));
  active++;
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      let page;
      try {
        const browser = await getBrowser();
        page = await browser.newPage();
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        // Challenge pages can complete a navigation after the first response.
        await new Promise(resolve => setTimeout(resolve, 2500));
        const data = await page.content();
        const status = response?.status() || 0;
        validateScrapeResponse({ statusCode: status, body: data });
        const value = { data, status };
        cache.set(url, { value, expires: Date.now() + 5 * 60 * 1000 });
        if (cache.size > 100) cache.delete(cache.keys().next().value);
        return value;
      } catch (error) {
        if (browserPromise) {
          const browser = await browserPromise.catch(() => null);
          if (browser && !browser.isConnected()) browserPromise = undefined;
        }
        if (attempt === 1) throw error;
      } finally {
        if (page) await page.close().catch(() => {});
      }
    }
  } finally {
    active--;
    waiting.shift()?.();
  }
}

module.exports = { scrapeWithBrowser };
