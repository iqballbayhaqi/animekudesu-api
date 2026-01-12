const { scrapeGet, parseAnimeList, parsePagination, cheerio } = require("../utils/scraper");
require("dotenv").config();

const BASE_URL = process.env.SCRAPE_URL;

/**
 * Get all genres
 */
const getAllGenres = async () => {
  const response = await scrapeGet(`${BASE_URL}/daftar-anime-2/`);
  const $ = cheerio.load(response.data);

  const genreList = [];
  
  $("tr.filter_tax > td.filter_act.genres > label").each((i, elem) => {
    const title = $(elem).text().trim();
    const id = $(elem).find("input").attr("value");
    genreList.push({ title, id });
  });

  return {
    data: genreList,
    total_items: genreList.length,
  };
};

/**
 * Get anime by genre
 */
const getAnimeByGenre = async (genre, page = 1) => {
  const response = await scrapeGet(`${BASE_URL}/genre/${genre}/page/${page}`);
  const $ = cheerio.load(response.data);
  const animeList = parseAnimeList($);
  const { current_page, total_page } = parsePagination($, "#main > div.pagination > span:nth-child(1)");

  return {
    data: animeList,
    total_items: animeList.length,
    current_page,
    total_page,
  };
};

module.exports = {
  getAllGenres,
  getAnimeByGenre,
};
