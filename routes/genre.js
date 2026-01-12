const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middlewares/errorHandler");
const genreController = require("../controllers/genreController");

// GET /genres - Get all genres
router.get("/genres", asyncHandler(genreController.getAllGenres));

// GET /genre-anime/:genre - Get anime by genre
router.get("/genre-anime/:genre", asyncHandler(genreController.getAnimeByGenre));

module.exports = router;
