const { scrapeGet, parseAnimeList, parsePagination, cheerio } = require("../utils/scraper");
require("dotenv").config();

const BASE_URL = process.env.SCRAPE_URL;

/**
 * Search anime by title
 */
const searchAnime = async (search, page = 1) => {
  const checkResponse = await scrapeGet(`${BASE_URL}/daftar-anime-2/?title=${search}&status=&type=&order=title`);
  const $check = cheerio.load(checkResponse.data);
  const checkPageSection = $check("div.pagination > span:nth-child(1)").text().trim();
  const totalPageCheck = checkPageSection.match(/of (\d+)/) ? parseInt(checkPageSection.match(/of (\d+)/)[1]) : 1;

  if (totalPageCheck && (totalPageCheck < page || page < 1)) {
    return {
      data: [],
      total_items: 0,
      current_page: 0,
      total_page: totalPageCheck,
    };
  }

  const response = await scrapeGet(`${BASE_URL}/daftar-anime-2/page/${page}/?title=${search}&status=&type=&order=title`);
  const $ = cheerio.load(response.data);
  const animeList = parseAnimeList($);
  const { current_page, total_page } = parsePagination($, "div.pagination > span:nth-child(1)");

  return {
    data: animeList,
    total_items: animeList.length,
    current_page,
    total_page,
  };
};

module.exports = {
  searchAnime,
};
