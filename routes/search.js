const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middlewares/errorHandler");
const searchController = require("../controllers/searchController");

// GET /search-anime - Search anime by title
router.get("/search-anime", asyncHandler(searchController.searchAnime));

module.exports = router;
