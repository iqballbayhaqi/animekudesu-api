const { scrapeGet, parseAnimeList, parsePagination, cheerio } = require("../utils/scraper");
require("dotenv").config();

const BASE_URL = process.env.SCRAPE_URL;

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

/**
 * Get new anime list
 */
const getNewAnime = async (page = 1) => {
  // Check total pages first
  const checkResponse = await scrapeGet(`${BASE_URL}/anime-terbaru/page/1`);
  const $check = cheerio.load(checkResponse.data);
  const checkPageSection = $check("#main > div.post-show > ul > div > span:nth-child(1)").text().trim();
  const totalPageCheck = parseInt(checkPageSection.match(/of (\d+)/)[1]);

  if (totalPageCheck < page || page < 1) {
    return {
      data: [],
      total_items: 0,
      current_page: 0,
      total_page: totalPageCheck,
    };
  }

  const response = await scrapeGet(`${BASE_URL}/anime-terbaru/page/${page}`);
  const $ = cheerio.load(response.data);

  const animeList = [];
  $("#main > div.post-show > ul > li").each((i, elem) => {
    const img = $(elem).find("img").attr("src");
    const alt = $(elem).find("img").attr("alt");
    const link = $(elem).find("a").attr("href").replace(BASE_URL, "");
    const title = $(elem).find("h2.entry-title > a").text();
    const episode = $(elem).find("div.dtla > span:nth-child(2)").text().trim();
    const posted_by = $(elem).find("div.dtla > span.author.vcard > author").text().trim();
    const released = $(elem).find("div.dtla > span:nth-child(4)").text().trim().replace("Released on: ", "");
    animeList.push({ img, alt, link, title, episode, posted_by, released });
  });

  const page_section = $("#main > div.post-show > ul > div > span:nth-child(1)").text().trim();
  const current_page = parseInt(page_section.match(/Page (\d+) of/)[1]);
  const total_page = parseInt(page_section.match(/of (\d+)/)[1]);

  return {
    data: animeList,
    total_items: animeList.length,
    current_page,
    total_page,
  };
};

/**
 * Get all anime list
 */
const getListAnime = async (page = 1) => {
  const checkResponse = await scrapeGet(`${BASE_URL}/daftar-anime-2`);
  const $check = cheerio.load(checkResponse.data);
  const checkPageSection = $check("#main > div.relat > div > span:nth-child(1)").text().trim();
  const totalPageCheck = parseInt(checkPageSection.match(/of (\d+)/)[1]);

  if (totalPageCheck < page || page < 1) {
    return {
      data: [],
      total_items: 0,
      current_page: 0,
      total_page: totalPageCheck,
    };
  }

  const response = await scrapeGet(`${BASE_URL}/daftar-anime-2/page/${page}`);
  const $ = cheerio.load(response.data);
  const animeList = parseAnimeList($);
  const { current_page, total_page } = parsePagination($);

  return {
    data: animeList,
    total_items: animeList.length,
    current_page,
    total_page,
  };
};

/**
 * Get ongoing anime list
 */
const getOngoingAnime = async (page = 1) => {
  const checkResponse = await scrapeGet(`${BASE_URL}/daftar-anime-2/?status=Currently+Airing`);
  const $check = cheerio.load(checkResponse.data);
  const checkPageSection = $check("#main > div.relat > div > span:nth-child(1)").text().trim();
  const totalPageCheck = parseInt(checkPageSection.match(/of (\d+)/)[1]);

  if (totalPageCheck < page || page < 1) {
    return {
      data: [],
      total_items: 0,
      current_page: 0,
      total_page: totalPageCheck,
    };
  }

  const response = await scrapeGet(`${BASE_URL}/daftar-anime-2/page/${page}/?status=Currently+Airing`);
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

/**
 * Get completed anime list
 */
const getCompletedAnime = async (page = 1) => {
  const checkResponse = await scrapeGet(`${BASE_URL}/daftar-anime-2/?status=Finished+Airing`);
  const $check = cheerio.load(checkResponse.data);
  const checkPageSection = $check("#main > div.relat > div > span:nth-child(1)").text().trim();
  const totalPageCheck = parseInt(checkPageSection.match(/of (\d+)/)[1]);

  if (totalPageCheck < page || page < 1) {
    return {
      data: [],
      total_items: 0,
      current_page: 0,
      total_page: totalPageCheck,
    };
  }

  const response = await scrapeGet(`${BASE_URL}/daftar-anime-2/page/${page}/?status=Finished+Airing`);
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

/**
 * Get anime by type
 */
const getAnimeByType = async (type, page = 1) => {
  const typeLower = type?.toLowerCase();
  
  if (!validTypes.includes(typeLower)) {
    return {
      error: true,
      message: "Invalid type",
      valid_types: validTypes.map(t => t.toUpperCase()),
    };
  }

  const typeParam = typeLower.charAt(0).toUpperCase() + typeLower.slice(1);

  const checkResponse = await scrapeGet(`${BASE_URL}/daftar-anime-2/?type=${typeParam}&order=title`);
  const $check = cheerio.load(checkResponse.data);
  const checkPageSection = $check("#main > div.relat > div > span:nth-child(1)").text().trim();
  const pageMatch = checkPageSection.match(/of (\d+)/);
  const totalPageCheck = pageMatch ? parseInt(pageMatch[1]) : 1;

  if (totalPageCheck < page || page < 1) {
    return {
      data: [],
      total_items: 0,
      current_page: 0,
      total_page: totalPageCheck,
      type: typeParam,
    };
  }

  const response = await scrapeGet(`${BASE_URL}/daftar-anime-2/page/${page}/?type=${typeParam}&order=title`);
  const $ = cheerio.load(response.data);
  const animeList = parseAnimeList($);
  const { current_page, total_page } = parsePagination($, "#main > div.pagination > span:nth-child(1)");

  return {
    data: animeList,
    total_items: animeList.length,
    current_page: current_page || parseInt(page),
    total_page: total_page || totalPageCheck,
    type: typeParam,
    available_types: validTypes.map(t => ({
      type: t.toUpperCase(),
      endpoint: `/type-anime/${t}`,
    })),
  };
};

/**
 * Get anime by order
 */
const getAnimeByOrder = async (order, page = 1) => {
  const orderLower = order?.toLowerCase();
  
  if (!validOrders[orderLower]) {
    return {
      error: true,
      message: "Invalid order",
      valid_orders: Object.keys(validOrders).map(key => ({
        order: key,
        name: validOrders[key].name,
        endpoint: `/order-anime/${key}`,
      })),
    };
  }

  const orderParam = validOrders[orderLower].param;

  const checkResponse = await scrapeGet(`${BASE_URL}/daftar-anime-2/?order=${orderParam}`);
  const $check = cheerio.load(checkResponse.data);
  const checkPageSection = $check("#main > div.relat > div > span:nth-child(1)").text().trim();
  const pageMatch = checkPageSection.match(/of (\d+)/);
  const totalPageCheck = pageMatch ? parseInt(pageMatch[1]) : 1;

  if (totalPageCheck < page || page < 1) {
    return {
      data: [],
      total_items: 0,
      current_page: 0,
      total_page: totalPageCheck,
      order: validOrders[orderLower].name,
    };
  }

  const response = await scrapeGet(`${BASE_URL}/daftar-anime-2/page/${page}/?order=${orderParam}`);
  const $ = cheerio.load(response.data);
  const animeList = parseAnimeList($);
  const { current_page, total_page } = parsePagination($, "#main > div.pagination > span:nth-child(1)");

  return {
    data: animeList,
    total_items: animeList.length,
    current_page: current_page || parseInt(page),
    total_page: total_page || totalPageCheck,
    order: validOrders[orderLower].name,
    available_orders: Object.keys(validOrders).map(key => ({
      order: key,
      name: validOrders[key].name,
      endpoint: `/order-anime/${key}`,
    })),
  };
};

module.exports = {
  getNewAnime,
  getListAnime,
  getOngoingAnime,
  getCompletedAnime,
  getAnimeByType,
  getAnimeByOrder,
  validTypes,
  validOrders,
};
