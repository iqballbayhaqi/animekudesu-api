const animeService = require("../services/animeService");

/**
 * Get new anime list
 */
const getNewAnime = async (req, res) => {
  const page = req.query.page || 1;
  const result = await animeService.getNewAnime(page);
  res.json(result);
};

/**
 * Get all anime list
 */
const getListAnime = async (req, res) => {
  const page = req.query.page || 1;
  const result = await animeService.getListAnime(page);
  res.json(result);
};

/**
 * Get ongoing anime list
 */
const getOngoingAnime = async (req, res) => {
  const page = req.query.page || 1;
  const result = await animeService.getOngoingAnime(page);
  res.json(result);
};

/**
 * Get completed anime list
 */
const getCompletedAnime = async (req, res) => {
  const page = req.query.page || 1;
  const result = await animeService.getCompletedAnime(page);
  res.json(result);
};

/**
 * Get anime by type
 */
const getAnimeByType = async (req, res) => {
  const { type } = req.params;
  const page = req.query.page || 1;
  const result = await animeService.getAnimeByType(type, page);
  
  if (result.error) {
    return res.status(400).json(result);
  }
  
  res.json(result);
};

/**
 * Get anime by order
 */
const getAnimeByOrder = async (req, res) => {
  const { order } = req.params;
  const page = req.query.page || 1;
  const result = await animeService.getAnimeByOrder(order, page);
  
  if (result.error) {
    return res.status(400).json(result);
  }
  
  res.json(result);
};

module.exports = {
  getNewAnime,
  getListAnime,
  getOngoingAnime,
  getCompletedAnime,
  getAnimeByType,
  getAnimeByOrder,
};
