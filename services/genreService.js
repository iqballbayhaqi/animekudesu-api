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

  if (!genreList.length) {
    const raw = $('[x-data^="genreMultiSelect"]').first().attr('x-data') || '';
    const match = raw.match(/genres:\s*(\[[\s\S]*?\])\s*,/);
    if (match) {
      JSON.parse(match[1]).forEach(({ name, slug }) => genreList.push({ title: name, id: slug }));
    }
  }

  return {
    data: genreList,
    total_items: genreList.length,
  };
};

/**
 * Get anime by genre
 */
const getAnimeByGenre = async (genre, page = 1) => {
  const pagePath = Number(page) > 1 ? `page/${page}/` : '';
  const response = await scrapeGet(`${BASE_URL}/daftar-anime-2/${pagePath}?genre%5B%5D=${encodeURIComponent(genre)}`);
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
  getAllGenres,
  getAnimeByGenre,
};
