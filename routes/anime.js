const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middlewares/errorHandler");
const animeController = require("../controllers/animeController");

// GET /new-anime - Get new anime list
router.get("/new-anime", asyncHandler(animeController.getNewAnime));

// GET /list-anime - Get all anime list
router.get("/list-anime", asyncHandler(animeController.getListAnime));

// GET /ongoing-anime - Get ongoing anime list
router.get("/ongoing-anime", asyncHandler(animeController.getOngoingAnime));

// GET /completed-anime - Get completed anime list
router.get("/completed-anime", asyncHandler(animeController.getCompletedAnime));

// GET /type-anime/:type - Get anime list by type
router.get("/type-anime/:type", asyncHandler(animeController.getAnimeByType));

// GET /order-anime/:order - Get anime list by order
router.get("/order-anime/:order", asyncHandler(animeController.getAnimeByOrder));

module.exports = router;
