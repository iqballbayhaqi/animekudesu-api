const express = require("express");
const router = express.Router();
require("dotenv").config();

// Import route modules
const animeRoutes = require("./anime");
const detailRoutes = require("./detail");
const genreRoutes = require("./genre");
const searchRoutes = require("./search");
const videoRoutes = require("./video");
const scheduleRoutes = require("./schedule");

// Home route - API documentation
router.get("/", function (req, res, next) {
  res.json({
    message: "Welcome to Anime API",
    author: "@Iqballbayhaqi",
    scraping_url: process.env.SCRAPE_URL,
    support_me: "https://ko-fi.com/iqballbaihaqi",
    documentation: "/api-docs"
  });
});

// Use route modules
router.use("/", animeRoutes);
router.use("/", detailRoutes);
router.use("/", genreRoutes);
router.use("/", searchRoutes);
router.use("/", videoRoutes);
router.use("/", scheduleRoutes);

module.exports = router;
