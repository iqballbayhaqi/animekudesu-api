const searchService = require("../services/searchService");

/**
 * Search anime by title
 */
const searchAnime = async (req, res) => {
  const { search } = req.query;
  const page = req.query.page || 1;
  const result = await searchService.searchAnime(search, page);
  res.json(result);
};

module.exports = {
  searchAnime,
};
