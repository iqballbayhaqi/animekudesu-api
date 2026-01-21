const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middlewares/errorHandler");
const detailController = require("../controllers/detailController");

// GET /detail-anime/:slug - Get anime detail
router.get("/detail-anime/:slug", asyncHandler(detailController.getAnimeDetail));

// GET /detail-anime-episode/:slug - Get episode detail
router.get("/detail-anime-episode/:slug", asyncHandler(detailController.getEpisodeDetail));

// GET /download-anime/:slug - Get batch detail
router.get("/download-anime/:slug", asyncHandler(detailController.getBatchDetail));

module.exports = router;
