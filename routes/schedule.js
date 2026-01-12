const express = require("express");
const router = express.Router();
const { asyncHandler } = require("../middlewares/errorHandler");
const scheduleController = require("../controllers/scheduleController");

// GET /release-schedule - Get anime release schedule
router.get("/release-schedule", asyncHandler(scheduleController.getReleaseSchedule));

module.exports = router;
