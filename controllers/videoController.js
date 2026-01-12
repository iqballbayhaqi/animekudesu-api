const videoService = require("../services/videoService");

/**
 * Get video URL
 */
const getVideo = async (req, res) => {
  const { action, post, nume, type } = req.params;
  const result = await videoService.getVideo(action, post, nume, type);
  
  if (result.error) {
    return res.status(result.statusCode || 500).json(result);
  }
  
  res.json(result);
};

module.exports = {
  getVideo,
};
