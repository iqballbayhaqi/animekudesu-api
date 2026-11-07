const cheerio = require("cheerio");
const { validateScrapeResponse } = require('./scrapeResponse');
const { scrapeWithBrowser } = require('./browserScraper');
require("dotenv").config();

// Dynamic import untuk got-scraping (ESM module)
let gotScraping = null;
(async () => {
  const module = await import('got-scraping');
  gotScraping = module.gotScraping;
})();

// Helper function untuk scraping dengan got-scraping (bypass TLS fingerprinting)
const scrapeGet = async (url) => {
  if (url.startsWith(process.env.SCRAPE_URL || 'https://v2.samehadaku.how')) {
    return scrapeWithBrowser(url);
  }
  // Tunggu sampai gotScraping ready
  while (!gotScraping) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const response = await gotScraping({
    url,
    headerGeneratorOptions: {
      browsers: [{ name: 'chrome', minVersion: 100 }],
      devices: ['desktop'],
      operatingSystems: ['windows']
    }
  });
  validateScrapeResponse(response);
  
  return { data: response.body, status: response.statusCode };
};

// Helper untuk parse anime list dari HTML
const parseAnimeList = ($) => {
  const animeList = [];

  $("article.animepost, div.relat > article.animpost").each((i, elem) => {
    const slug = $(elem)
      .find("div.animposx > a")
      .attr("href")?.replace(/^https?:\/\/[^/]+\/anime/, "") || '';
    const img = $(elem).find("div.content-thumb > img").attr("src");
    const alt = $(elem).find("div.content-thumb > img").attr("alt");
    const type = $(elem).find("div.content-thumb > div.type").text().trim();
    const score = $(elem)
      .find("div.content-thumb > div.score")
      .text()
      .trim();
    const title = $(elem).find("div.stooltip > div.title").text().trim() || $(elem).find('a[title]').first().attr('title') || alt;
    const total_views = Number(
      $(elem)
        .find("div.stooltip > div.metadata > span:nth-child(3)")
        .text()
        .trim()
        .replace(" Views", "")
    );
    const description = $(elem)
      .find("div.stooltip > div.ttls")
      .text()
      .trim();
    const genre = $(elem).find("div.stooltip > div.genres > div > a");
    const genres = [];
    genre.each((i, elem) => {
      genres.push({
        tag: $(elem).text().trim(),
        link: $(elem).attr("href"),
      });
    });

    animeList.push({
      img,
      alt,
      slug,
      type,
      score,
      title,
      total_views,
      description,
      genres,
      detail_url: `/detail-anime${slug}`,
    });
  });

  return animeList;
};

// Helper untuk parse pagination
const parsePagination = ($, selector = "div.pagination > span:nth-child(1)") => {
  const page_section = $(selector).text().trim();
  const current_page = page_section ? parseInt(page_section.match(/Page (\d+) of/)?.[1] || 1) : 1;
  const total_page = page_section ? parseInt(page_section.match(/of (\d+)/)?.[1] || 1) : 1;
  return { current_page, total_page };
};

module.exports = {
  scrapeGet,
  parseAnimeList,
  parsePagination,
  cheerio
};
