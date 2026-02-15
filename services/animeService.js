const { scrapeGet, parseAnimeList, parsePagination, cheerio } = require("../utils/scraper");
require("dotenv").config();

const BASE_URL = process.env.SCRAPE_URL;
const USE_BACKUP = process.env.USE_SQLITE_BACKUP === 'true';

// Lazy loading to avoid circular dependency
let backupService = null;
const getBackupService = () => {
  if (!backupService) {
    backupService = require('./backupService');
  }
  return backupService;
};

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
  try {
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

    const result = {
      data: animeList,
      total_items: animeList.length,
      current_page,
      total_page,
    };

    // Save to backup if enabled
    if (USE_BACKUP && animeList.length > 0) {
      await getBackupService().saveAnimeList('new', page, animeList);
    }

    return result;
  } catch (error) {
    console.error('❌ Error scraping new anime, trying backup:', error.message);
    
    // Fallback to SQLite backup
    if (USE_BACKUP) {
      const backupData = getBackupService().getAnimeListBackup('new', page);
      if (backupData && backupData.length > 0) {
        console.log('✅ Using backup data for new anime page', page);
        return {
          data: backupData,
          total_items: backupData.length,
          current_page: page,
          total_page: page,
          from_backup: true,
          backup_note: 'Data from SQLite backup due to scraping error'
        };
      }
    }
    
    throw error;
  }
};

/**
 * Get all anime list
 */
const getListAnime = async (page = 1) => {
  try {
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

    const result = {
      data: animeList,
      total_items: animeList.length,
      current_page,
      total_page,
    };

    if (USE_BACKUP && animeList.length > 0) {
      await getBackupService().saveAnimeList('list', page, animeList);
    }

    return result;
  } catch (error) {
    console.error('❌ Error scraping anime list, trying backup:', error.message);
    
    if (USE_BACKUP) {
      const backupData = getBackupService().getAnimeListBackup('list', page);
      if (backupData && backupData.length > 0) {
        console.log('✅ Using backup data for anime list page', page);
        return {
          data: backupData,
          total_items: backupData.length,
          current_page: page,
          total_page: page,
          from_backup: true
        };
      }
    }
    
    throw error;
  }
};

/**
 * Get ongoing anime list
 */
const getOngoingAnime = async (page = 1) => {
  try {
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

    const result = {
      data: animeList,
      total_items: animeList.length,
      current_page,
      total_page,
    };

    if (USE_BACKUP && animeList.length > 0) {
      await getBackupService().saveAnimeList('ongoing', page, animeList);
    }

    return result;
  } catch (error) {
    console.error('❌ Error scraping ongoing anime, trying backup:', error.message);
    
    if (USE_BACKUP) {
      const backupData = getBackupService().getAnimeListBackup('ongoing', page);
      if (backupData && backupData.length > 0) {
        console.log('✅ Using backup data for ongoing anime page', page);
        return {
          data: backupData,
          total_items: backupData.length,
          current_page: page,
          total_page: page,
          from_backup: true
        };
      }
    }
    
    throw error;
  }
};

/**
 * Get completed anime list
 */
const getCompletedAnime = async (page = 1) => {
  try {
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

    const result = {
      data: animeList,
      total_items: animeList.length,
      current_page,
      total_page,
    };

    if (USE_BACKUP && animeList.length > 0) {
      await getBackupService().saveAnimeList('completed', page, animeList);
    }

    return result;
  } catch (error) {
    console.error('❌ Error scraping completed anime, trying backup:', error.message);
    
    if (USE_BACKUP) {
      const backupData = getBackupService().getAnimeListBackup('completed', page);
      if (backupData && backupData.length > 0) {
        console.log('✅ Using backup data for completed anime page', page);
        return {
          data: backupData,
          total_items: backupData.length,
          current_page: page,
          total_page: page,
          from_backup: true
        };
      }
    }
    
    throw error;
  }
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
