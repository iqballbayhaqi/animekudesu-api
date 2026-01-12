const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middlewares/errorHandler");
const { scrapeGet, parseAnimeList, parsePagination, cheerio } = require("../utils/scraper");
require("dotenv").config();

// GET /new-anime - Get new anime list
router.get("/new-anime", asyncHandler(async (req, res) => {
  // Check total pages first
  const checkResponse = await scrapeGet(`${process.env.SCRAPE_URL}/anime-terbaru/page/1`);
  const $check = cheerio.load(checkResponse.data);
  const checkPageSection = $check("#main > div.post-show > ul > div > span:nth-child(1)").text().trim();
  const totalPageCheck = parseInt(checkPageSection.match(/of (\d+)/)[1]);

  if (totalPageCheck < req.query.page || req.query.page < 1) {
    return res.json({
      data: [],
      total_items: 0,
      current_page: 0,
      total_page: totalPageCheck,
    });
  }

  // Get anime list
  const response = await scrapeGet(`${process.env.SCRAPE_URL}/anime-terbaru/page/${req.query.page || "1"}`);
  const html = response.data;
  const $ = cheerio.load(html);

  const animeList = [];

  $("#main > div.post-show > ul > li").each((i, elem) => {
    const img = $(elem).find("img").attr("src");
    const alt = $(elem).find("img").attr("alt");
    const link = $(elem)
      .find("a")
      .attr("href")
      .replace(process.env.SCRAPE_URL, "");
    const title = $(elem).find("h2.entry-title > a").text();
    const episode = $(elem)
      .find("div.dtla > span:nth-child(2)")
      .text()
      .trim();
    const posted_by = $(elem)
      .find("div.dtla > span.author.vcard > author")
      .text()
      .trim();
    const released = $(elem)
      .find("div.dtla > span:nth-child(4)")
      .text()
      .trim()
      .replace("Released on: ", "");
    animeList.push({ img, alt, link, title, episode, posted_by, released });
  });

  const page_section = $("#main > div.post-show > ul > div > span:nth-child(1)").text().trim();
  const current_page = parseInt(page_section.match(/Page (\d+) of/)[1]);
  const total_page = parseInt(page_section.match(/of (\d+)/)[1]);

  res.json({
    data: animeList,
    total_items: animeList.length,
    current_page,
    total_page,
  });
}));

// GET /list-anime - Get all anime list
router.get("/list-anime", asyncHandler(async (req, res) => {
  // Check total pages first
  const checkResponse = await scrapeGet(`${process.env.SCRAPE_URL}/daftar-anime-2`);
  const $check = cheerio.load(checkResponse.data);
  const checkPageSection = $check("#main > div.relat > div > span:nth-child(1)").text().trim();
  const totalPageCheck = parseInt(checkPageSection.match(/of (\d+)/)[1]);

  if (totalPageCheck < req.query.page || req.query.page < 1) {
    return res.json({
      data: [],
      total_items: 0,
      current_page: 0,
      total_page: totalPageCheck,
    });
  }

  // Get anime list
  const response = await scrapeGet(
    `${process.env.SCRAPE_URL}/daftar-anime-2/page/${req.query.page || "1"}`
  );
  const $ = cheerio.load(response.data);
  const animeList = parseAnimeList($);
  const { current_page, total_page } = parsePagination($);

  res.json({
    data: animeList,
    total_items: animeList.length,
    current_page,
    total_page,
  });
}));

// GET /ongoing-anime - Get ongoing anime list
router.get("/ongoing-anime", asyncHandler(async (req, res) => {
  // Check total pages first
  const checkResponse = await scrapeGet(`${process.env.SCRAPE_URL}/daftar-anime-2/?status=Currently+Airing`);
  const $check = cheerio.load(checkResponse.data);
  const checkPageSection = $check("#main > div.relat > div > span:nth-child(1)").text().trim();
  const totalPageCheck = parseInt(checkPageSection.match(/of (\d+)/)[1]);

  if (totalPageCheck < req.query.page || req.query.page < 1) {
    return res.json({
      data: [],
      total_items: 0,
      current_page: 0,
      total_page: totalPageCheck,
    });
  }

  // Get anime list
  const response = await scrapeGet(`${process.env.SCRAPE_URL}/daftar-anime-2/page/${req.query.page || "1"}/?status=Currently+Airing`);
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

// GET /completed-anime - Get completed anime list
router.get("/completed-anime", asyncHandler(async (req, res) => {
  // Check total pages first
  const checkResponse = await scrapeGet(`${process.env.SCRAPE_URL}/daftar-anime-2/?status=Finished+Airing`);
  const $check = cheerio.load(checkResponse.data);
  const checkPageSection = $check("#main > div.relat > div > span:nth-child(1)").text().trim();
  const totalPageCheck = parseInt(checkPageSection.match(/of (\d+)/)[1]);

  if (totalPageCheck < req.query.page || req.query.page < 1) {
    return res.json({
      data: [],
      total_items: 0,
      current_page: 0,
      total_page: totalPageCheck,
    });
  }

  // Get anime list
  const response = await scrapeGet(`${process.env.SCRAPE_URL}/daftar-anime-2/page/${req.query.page || "1"}/?status=Finished+Airing`);
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

// Valid anime types
const validTypes = ["tv", "ova", "ona", "special", "movie"];

// Valid order options
const validOrders = {
  "a-z": { param: "title", name: "A-Z (Alphabet)" },
  "z-a": { param: "titlereverse", name: "Z-A (Reverse Alphabet)" },
  "latest-update": { param: "update", name: "Latest Update" },
  "latest-added": { param: "latest", name: "Latest Added" },
  "popular": { param: "popular", name: "Popular" },
};

// GET /order-anime/:order - Get anime list by order
router.get("/order-anime/:order", asyncHandler(async (req, res) => {
  const order = req.params.order?.toLowerCase();
  
  // Validate order
  if (!validOrders[order]) {
    return res.status(400).json({
      message: "Invalid order",
      valid_orders: Object.keys(validOrders).map(key => ({
        order: key,
        name: validOrders[key].name,
        endpoint: `/order-anime/${key}`,
      })),
    });
  }

  const orderParam = validOrders[order].param;
  const page = req.query.page || 1;

  // Check total pages first
  const checkResponse = await scrapeGet(`${process.env.SCRAPE_URL}/daftar-anime-2/?order=${orderParam}`);
  const $check = cheerio.load(checkResponse.data);
  const checkPageSection = $check("#main > div.relat > div > span:nth-child(1)").text().trim();
  const pageMatch = checkPageSection.match(/of (\d+)/);
  const totalPageCheck = pageMatch ? parseInt(pageMatch[1]) : 1;

  if (totalPageCheck < page || page < 1) {
    return res.json({
      data: [],
      total_items: 0,
      current_page: 0,
      total_page: totalPageCheck,
      order: validOrders[order].name,
    });
  }

  // Get anime list
  const response = await scrapeGet(`${process.env.SCRAPE_URL}/daftar-anime-2/page/${page}/?order=${orderParam}`);
  const $ = cheerio.load(response.data);
  const animeList = parseAnimeList($);
  const { current_page, total_page } = parsePagination($, "#main > div.pagination > span:nth-child(1)");

  res.json({
    data: animeList,
    total_items: animeList.length,
    current_page: current_page || parseInt(page),
    total_page: total_page || totalPageCheck,
    order: validOrders[order].name,
    available_orders: Object.keys(validOrders).map(key => ({
      order: key,
      name: validOrders[key].name,
      endpoint: `/order-anime/${key}`,
    })),
  });
}));

// GET /type-anime/:type - Get anime list by type
router.get("/type-anime/:type", asyncHandler(async (req, res) => {
  const type = req.params.type?.toLowerCase();
  
  // Validate type
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      message: "Invalid type",
      valid_types: validTypes.map(t => t.toUpperCase()),
    });
  }

  // Format type for URL (capitalize first letter)
  const typeParam = type.charAt(0).toUpperCase() + type.slice(1);
  const page = req.query.page || 1;

  // Check total pages first
  const checkResponse = await scrapeGet(`${process.env.SCRAPE_URL}/daftar-anime-2/?type=${typeParam}&order=title`);
  const $check = cheerio.load(checkResponse.data);
  const checkPageSection = $check("#main > div.relat > div > span:nth-child(1)").text().trim();
  const pageMatch = checkPageSection.match(/of (\d+)/);
  const totalPageCheck = pageMatch ? parseInt(pageMatch[1]) : 1;

  if (totalPageCheck < page || page < 1) {
    return res.json({
      data: [],
      total_items: 0,
      current_page: 0,
      total_page: totalPageCheck,
      type: typeParam,
    });
  }

  // Get anime list
  const response = await scrapeGet(`${process.env.SCRAPE_URL}/daftar-anime-2/page/${page}/?type=${typeParam}&order=title`);
  const $ = cheerio.load(response.data);
  const animeList = parseAnimeList($);
  const { current_page, total_page } = parsePagination($, "#main > div.pagination > span:nth-child(1)");

  res.json({
    data: animeList,
    total_items: animeList.length,
    current_page: current_page || parseInt(page),
    total_page: total_page || totalPageCheck,
    type: typeParam,
    available_types: validTypes.map(t => ({
      type: t.toUpperCase(),
      endpoint: `/type-anime/${t}`,
    })),
  });
}));

module.exports = router;
