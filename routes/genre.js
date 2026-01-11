const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middlewares/errorHandler");
const { scrapeGet, parseAnimeList, parsePagination, cheerio } = require("../utils/scraper");
require("dotenv").config();

// GET /genres - Get all genres
router.get("/genres", asyncHandler(async (req, res) => {
  const response = await scrapeGet(`${process.env.SCRAPE_URL}/daftar-anime-2/`);
  const html = response.data;
  const $ = cheerio.load(html);

  const genreList = [];
  
  $("tr.filter_tax > td.filter_act.genres > label").each((i, elem) => {
    const title = $(elem).text().trim();
    const id = $(elem).find("input").attr("value");
    genreList.push({ title, id });
  });

  res.json({
    data: genreList,
    total_items: genreList.length,
  });
}));

// GET /genre-anime/:genre - Get anime by genre
router.get("/genre-anime/:genre", asyncHandler(async (req, res) => {
  const response = await scrapeGet(`${process.env.SCRAPE_URL}/genre/${req.params.genre}/page/${req.query.page || 1}`);
  const $ = cheerio.load(response.data);
  const animeList = parseAnimeList($);
  const { current_page, total_page } = parsePagination($, "#main > div.pagination > span:nth-child(1)");

  res.json({
    data: animeList,
    total_items: animeList.length,
    current_page,
    total_page,
  });
}));

module.exports = router;
