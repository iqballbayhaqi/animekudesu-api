const { scrapeGet, cheerio } = require("../utils/scraper");
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

/**
 * Get anime detail
 */
const getAnimeDetail = async (slug) => {
  try {
    const response = await scrapeGet(`${BASE_URL}/anime/${slug}`);
    const $ = cheerio.load(response.data);

    const title = $(".entry-title").text().trim().replace("Nonton Anime ", "");
    const img = $("#infoarea > div > div.infoanime.widget_senction > div.thumb > img").attr("src");
    const rating = $("#infoarea > div > div.infoanime.widget_senction > div.thumb > div > div > div > div > span").text().trim();
    const rating_count = $("#infoarea > div > div.infoanime.widget_senction > div.thumb > div > div > div > div > i").text().trim();
    
    const description = $("#infoarea > div > div.infoanime.widget_senction > div.infox > div.desc > div > p");
    const descriptions = [];
    description.each((i, elem) => {
      descriptions.push($(elem).text().trim());
    });
    
    const genre = $("#infoarea > div > div.infoanime.widget_senction > div.infox > div.genre-info > a");
    const genres = [];
    genre.each((i, elem) => {
      genres.push({ tag: $(elem).text().trim(), link: $(elem).attr("href") });
    });
    
    const japanese_title = $(".infox > .spe > span:nth-child(1)").text().trim().replace("Japanese ", "");
    const english_title = $(".infox > .spe > span:nth-child(3)").text().trim().replace("English ", "");
    const type = $(".infox > .spe > span:nth-child(5)").text().trim().replace("Type ", "");
    const duration = $(".infox > .spe > span:nth-child(7)").text().trim().replace("Duration ", "");
    const season = $(".infox > .spe > span:nth-child(9)").text().trim().replace("Season ", "");
    const producer = $(".infox > .spe > span:nth-child(11)").text().trim().replace("Producer ", "");
    const synonims = $(".infox > .spe > span:nth-child(2)").text().trim().replace("Synonyms ", "");
    const status = $(".infox > .spe > span:nth-child(4)").text().trim().replace("Status ", "");
    const source = $(".infox > .spe > span:nth-child(6)").text().trim().replace("Source ", "");
    const total_episode = $(".infox > .spe > span:nth-child(8)").text().trim().replace("Total Episode ", "");
    const studio = $(".infox > .spe > span:nth-child(10)").text().trim().replace("Studio ", "");
    const released = $(".infox > .spe > span:nth-child(12)").text().replace("Released: ", "").trim();
    const trailer_video = $("#pembed > iframe").attr("src");
    
    const episode = $("#infoarea > div > div.whites.lsteps.widget_senction > div.lstepsiode.listeps > ul > li");
    const episodes = [];
    episode.each((i, elem) => {
      const episodeTitle = $(elem).find("span.lchx > a").text();
      const link = $(elem).find("span.lchx > a").attr("href").replace(BASE_URL, "");
      const episodeNum = Number($(elem).find("span.eps > a").text());
      episodes.push({ title: episodeTitle, link, detail_eps: `/detail-anime-episode${link}`, episode: episodeNum });
    });

    const result = {
      title,
      img,
      rating,
      rating_count,
      descriptions,
      genres,
      japanese_title,
      english_title,
      type,
      duration,
      season,
      producer,
      synonims,
      status,
      source,
      total_episode,
      studio,
      released,
      trailer_video,
      episodes,
    };

    // Save to backup if enabled
    if (USE_BACKUP) {
      await getBackupService().saveAnimeDetail(slug, result);
    }

    return result;
  } catch (error) {
    console.error('❌ Error scraping anime detail, trying backup:', error.message);
    
    // Fallback to SQLite backup
    if (USE_BACKUP) {
      const backupData = getBackupService().getAnimeDetailBackup(slug);
      if (backupData) {
        console.log('✅ Using backup data for anime detail:', slug);
        return {
          ...backupData,
          from_backup: true
        };
      }
    }
    
    throw error;
  }
};

/**
 * Get episode detail
 */
const getEpisodeDetail = async (slug) => {
  try {
    const response = await scrapeGet(`${BASE_URL}/${slug}`);
    const $ = cheerio.load(response.data);

    const title = $(".info_episode > div > h1").text().trim();
    const description = $(".info_episode  > div > div.entry-content.entry-content-single").text().trim();
    const episode_number = Number($("span[itemprop='episodeNumber']").text().trim());
    const video_url = $("#player_embed > .pframe > iframe").attr("src") || 'belum tersedia (segera)';
    
    const videoslist = $("#server > ul > li");
    const videos = [];
    videoslist.each((i, elem) => {
      const videoTitle = $(elem).find("span").text().trim();
      const id = $(elem).find(".east_player_option").attr("id");
      const post = $(elem).find(".east_player_option").attr("data-post");
      const nume = $(elem).find(".east_player_option").attr("data-nume");
      const action = "player_ajax";
      const type = $(elem).find(".east_player_option").attr("data-type");
      const video = `/get-video/${action}/${post}/${nume}/${type}`;
      videos.push({ id, title: videoTitle, post, action, nume, type, video });
    });

    const downloads = [];
    $(".download-eps").each((i, elem) => {
      const format = $(elem).find("p > b").text().trim();
      const list = [];
      $(elem).find("ul > li").each((j, li) => {
        const resolution = $(li).find("strong").text().trim();
        const links = [];
        $(li).find("span > a").each((k, a) => {
          const title = $(a).text().trim();
          const link = $(a).attr("href");
          links.push({ title, link });
        });
        list.push({ resolution, links });
      });
      downloads.push({ format, list });
    });

    const result = {
      title,
      description,
      episode_number,
      video_url,
      videos,
      downloads
    };

    // Save to backup if enabled
    if (USE_BACKUP) {
      await getBackupService().saveEpisodeDetail(slug, result);
    }

    return result;
  } catch (error) {
    console.error('❌ Error scraping episode detail, trying backup:', error.message);
    
    // Fallback to SQLite backup
    if (USE_BACKUP) {
      const backupData = getBackupService().getEpisodeDetailBackup(slug);
      if (backupData) {
        console.log('✅ Using backup data for episode detail:', slug);
        return {
          ...backupData,
          from_backup: true
        };
      }
    }
    
    throw error;
  }
};

const getBatchDetail = async (slug) => {
  try {
    const response = await scrapeGet(`${BASE_URL}/batch/${slug}`);
    const $ = cheerio.load(response.data);

    const title = $(".thumb-batch > img").attr("title");
    const img = $(".thumb-batch > img").attr("src");
    
    const downloads = [];
    $(".download-eps").each((i, elem) => {
      const format = $(elem).find("p > b").text().trim();
      const list = [];
      $(elem).find("ul > li").each((j, li) => {
        const resolution = $(li).find("strong").text().trim();
        const links = [];
        $(li).find("span > a").each((k, a) => {
          const title = $(a).text().trim();
          const link = $(a).attr("href");
          links.push({ title, link });
        });
        list.push({ resolution, links });
      });
      downloads.push({ format, list });
    });

    const result = {
      title,
      img,
      downloads
    };

    // Save to backup if enabled
    if (USE_BACKUP) {
      await getBackupService().saveBatchDetail(slug, result);
    }

    return result;
  } catch (error) {
    console.error('❌ Error scraping batch detail, trying backup:', error.message);
    
    // Fallback to SQLite backup
    if (USE_BACKUP) {
      const backupData = getBackupService().getBatchDetailBackup(slug);
      if (backupData) {
        console.log('✅ Using backup data for batch detail:', slug);
        return {
          ...backupData,
          from_backup: true
        };
      }
    }
    
    throw error;
  }
};

module.exports = {
  getAnimeDetail,
  getEpisodeDetail,
  getBatchDetail,
};
