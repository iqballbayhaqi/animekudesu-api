const validateScrapeResponse = ({ statusCode, body }) => {
  if (statusCode < 200 || statusCode >= 300 ||
      /<title>\s*Just a moment\.\.\.\s*<\/title>|_cf_chl_opt|challenge-platform/i.test(body || '')) {
    const error = new Error(`Upstream source unavailable (HTTP ${statusCode})`);
    error.statusCode = 502;
    throw error;
  }
};

module.exports = { validateScrapeResponse };
