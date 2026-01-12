const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middlewares/errorHandler");
const videoController = require("../controllers/videoController");

// GET /get-video/:action/:post/:nume/:type - Get video URL
router.get("/get-video/:action/:post/:nume/:type", asyncHandler(videoController.getVideo));

module.exports = router;
