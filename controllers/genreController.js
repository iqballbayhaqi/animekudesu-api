const genreService = require("../services/genreService");

/**
 * Get all genres
 */
const getAllGenres = async (req, res) => {
  const result = await genreService.getAllGenres();
  res.json(result);
};

/**
 * Get anime by genre
 */
const getAnimeByGenre = async (req, res) => {
  const { genre } = req.params;
  const page = req.query.page || 1;
  const result = await genreService.getAnimeByGenre(genre, page);
  res.json(result);
};

module.exports = {
  getAllGenres,
  getAnimeByGenre,
};
