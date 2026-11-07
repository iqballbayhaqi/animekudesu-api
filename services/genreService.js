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
  const response = await scrapeGet(`${BASE_URL}/genre/${genre}/page/${page}`);
  const $ = cheerio.load(response.data);
  const animeList = parseAnimeList($);
  if (!animeList.length) {
    $('.post-show > ul > li').each((_, elem) => {
      const a = $(elem).find('h2.entry-title > a');
      const url = a.attr('href') || '';
      const slug = url.replace(/^https?:\/\/[^/]+\/anime/, '').replace(/\/$/, '');
      if (!slug) return;
      animeList.push({ title: a.text().trim(), slug, img: $(elem).find('.thumb img').attr('src'), alt: $(elem).find('.thumb img').attr('alt'), type: '', score: '', genres: [{ tag: genre, link: `${BASE_URL}/genre/${genre}/` }], detail_url: `/detail-anime${slug}` });
    });
  }
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
