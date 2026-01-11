const express = require("express");
const router = express.Router();
require("dotenv").config();

// Import route modules
const animeRoutes = require("./anime");
const detailRoutes = require("./detail");
const genreRoutes = require("./genre");
const searchRoutes = require("./search");
const videoRoutes = require("./video");

// Home route - API documentation
router.get("/", function (req, res, next) {
  res.json({
    message: "Welcome to Anime API",
    author: "@Iqballbayhaqi",
    scraping_url: process.env.SCRAPE_URL,
    support_me: "https://ko-fi.com/iqballbaihaqi",
    routes: [
      {
        method: "GET",
        path: "/new-anime",
        description: "Get new anime list",
        query: {
          page: "number",
        },
      },
      {
        method: "GET",
        path: "/list-anime",
        description: "Get list anime",
        query: {
          page: "number",
        },
      },
      {
        method: "GET",
        path: "/ongoing-anime",
        description: "Get ongoing anime list",
        query: {
          page: "number",
        },
      },
      {
        method: "GET",
        path: "/completed-anime",
        description: "Get completed anime list",
        query: {
          page: "number",
        },
      },
      {
        method: "GET",
        path: "/detail-anime/:slug",
        description: "Get detail anime",
        params: {
          slug: "string",
        },
      },
      {
        method: "GET",
        path: "/detail-anime-episode/:slug",
        description: "Get detail anime episode",
        params: {
          slug: "string",
        },
      },
      {
        method: "GET",
        path: "/get-video/:action/:post/:nume/:type",
        description: "Get video url",
        params: {
          action: "string",
          post: "string",
          nume: "string",
          type: "string",
        },
      },
      {
        method: "GET",
        path: "/genres",
        description: "Get genres anime",
      },
      {
        method: "GET",
        path: "/genre-anime/:genre",
        description: "Get anime by genre",
        params: {
          genre: "string",
        },
        query: {
          page: "number",
        },
      },
      {
        method: "GET",
        path: "/search-anime",
        description: "Search anime by title",
        query: {
          search: "string",
          page: "number",
        },
      },
    ],
  });
});

// Use route modules
router.use("/", animeRoutes);
router.use("/", detailRoutes);
router.use("/", genreRoutes);
router.use("/", searchRoutes);
router.use("/", videoRoutes);

module.exports = router;
