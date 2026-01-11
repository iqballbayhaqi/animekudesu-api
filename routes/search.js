const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middlewares/errorHandler");
const { scrapeGet, parseAnimeList, parsePagination, cheerio } = require("../utils/scraper");
require("dotenv").config();

// GET /search-anime - Search anime by title
router.get("/search-anime", asyncHandler(async (req, res) => {
  // Check total pages first
  const checkResponse = await scrapeGet(`${process.env.SCRAPE_URL}/daftar-anime-2/?title=${req.query.search}&status=&type=&order=title`);
  const $check = cheerio.load(checkResponse.data);
  const checkPageSection = $check("#main > div.pagination > div > span:nth-child(1)").text().trim();
  const totalPageCheck = checkPageSection.match(/of (\d+)/) ? parseInt(checkPageSection.match(/of (\d+)/)[1]) : 1;

  if (totalPageCheck && (totalPageCheck < req.query.page || req.query.page < 1)) {
    return res.json({
      data: [],
      total_items: 0,
      current_page: 0,
      total_page: totalPageCheck,
    });
  }

  // Get anime list
  const response = await scrapeGet(`${process.env.SCRAPE_URL}/daftar-anime-2/page/${req.query.page || "1"}/?title=${req.query.search}&status=&type=&order=title`);
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
