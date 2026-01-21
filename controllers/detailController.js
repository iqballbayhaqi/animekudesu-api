const detailService = require("../services/detailService");

/**
 * Get anime detail
 */
const getAnimeDetail = async (req, res) => {
  const { slug } = req.params;
  const result = await detailService.getAnimeDetail(slug);
  res.json(result);
};

/**
 * Get episode detail
 */
const getEpisodeDetail = async (req, res) => {
  const { slug } = req.params;
  const result = await detailService.getEpisodeDetail(slug);
  res.json(result);
};

/**
 * Get batch detail
 */
const getBatchDetail = async (req, res) => {
  const { slug } = req.params;
  const result = await detailService.getBatchDetail(slug);
  res.json(result);
};

module.exports = {
  getAnimeDetail,
  getEpisodeDetail,
  getBatchDetail,
};
