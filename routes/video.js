const express = require("express");
const router = express.Router();
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

// GET /get-video/:action/:post/:nume/:type - Get video URL
router.get("/get-video/:action/:post/:nume/:type", function (req, res, next) {
  const formData = new FormData();
  formData.append("action", req.params.action);
  formData.append("post", req.params.post);
  formData.append("nume", req.params.nume);
  formData.append("type", req.params.type);

  axios
    .post(`${process.env.SCRAPE_URL}/wp-admin/admin-ajax.php`, formData, {
      headers: formData.getHeaders(),
    })
    .then((response) => {
      const iframeHtml = response.data;
      const urlMatch = iframeHtml.match(/src="([^"]+)"/);
      res.json({
        response: response.data,
        url: urlMatch ? urlMatch[1] : null
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Something went wrong" });
    });
});

module.exports = router;
