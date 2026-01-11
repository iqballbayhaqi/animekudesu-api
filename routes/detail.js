const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middlewares/errorHandler");
const { scrapeGet, cheerio } = require("../utils/scraper");
require("dotenv").config();

// GET /detail-anime/:slug - Get anime detail
router.get("/detail-anime/:slug", asyncHandler(async (req, res) => {
  const response = await scrapeGet(`${process.env.SCRAPE_URL}/anime/${req.params.slug}`);
  const html = response.data;
  const $ = cheerio.load(html);

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
    const title = $(elem).find("span.lchx > a").text();
    const link = $(elem).find("span.lchx > a").attr("href").replace(process.env.SCRAPE_URL, "");
    const episode = Number($(elem).find("span.eps > a").text());
    episodes.push({ title, link, detail_eps: `/detail-anime-episode${link}`, episode });
  });

  res.json({
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
  });
}));

// GET /detail-anime-episode/:slug - Get episode detail
router.get("/detail-anime-episode/:slug", asyncHandler(async (req, res) => {
  const response = await scrapeGet(`${process.env.SCRAPE_URL}/${req.params.slug}`);
  const html = response.data;
  const $ = cheerio.load(html);

  const title = $(".info_episode > div > h1").text().trim();
  const description = $(".info_episode  > div > div.entry-content.entry-content-single").text().trim();
  const episode_number = Number($("span[itemprop='episodeNumber']").text().trim());
  const video_url = $("#player_embed > .pframe > iframe").attr("src") || 'belum tersedia (segera)';
  
  const videoslist = $("#server > ul > li");
  const videos = [];
  videoslist.each((i, elem) => {
    const title = $(elem).find("span").text().trim();
    const id = $(elem).find(".east_player_option").attr("id");
    const post = $(elem).find(".east_player_option").attr("data-post");
    const nume = $(elem).find(".east_player_option").attr("data-nume");
    const action = "player_ajax";
    const type = $(elem).find(".east_player_option").attr("data-type");
    const video = `/get-video/${action}/${post}/${nume}/${type}`;
    videos.push({ id, title, post, action, nume, type, video });
  });

  res.json({
    title,
    description,
    episode_number,
    video_url,
    videos
  });
}));

module.exports = router;
