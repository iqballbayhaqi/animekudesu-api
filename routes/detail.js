const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middlewares/errorHandler");
const detailController = require("../controllers/detailController");

// GET /detail-anime/:slug - Get anime detail
router.get("/detail-anime/:slug", asyncHandler(detailController.getAnimeDetail));

// GET /detail-anime-episode/:slug - Get episode detail
router.get("/detail-anime-episode/:slug", asyncHandler(detailController.getEpisodeDetail));

module.exports = router;
