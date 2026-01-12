const scheduleService = require("../services/scheduleService");

/**
 * Get release schedule
 */
const getReleaseSchedule = async (req, res) => {
  const { day, perpage, debug } = req.query;
  const result = await scheduleService.getReleaseSchedule(day, perpage || 50, debug === "true");
  
  if (result.error) {
    return res.status(500).json(result);
  }
  
  res.json(result);
};

module.exports = {
  getReleaseSchedule,
};
