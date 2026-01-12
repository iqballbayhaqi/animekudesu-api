require("dotenv").config();

const BASE_URL = process.env.SCRAPE_URL;

// Dynamic import untuk got-scraping (ESM module)
let gotScraping = null;
(async () => {
  const module = await import("got-scraping");
  gotScraping = module.gotScraping;
})();

// Helper: tunggu gotScraping ready
const waitForGotScraping = async () => {
  while (!gotScraping) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return gotScraping;
};

// Helper: detect Cloudflare challenge
const isCloudflareChallenge = (statusCode, body) => {
  const cfStatusCodes = [403, 503, 520, 521, 522, 523, 524];
  const cfSignatures = [
    "cloudflare",
    "cf-browser-verification",
    "cf_clearance",
    "challenge-platform",
    "Just a moment",
    "Checking your browser",
  ];

  if (cfStatusCodes.includes(statusCode)) {
    return cfSignatures.some((sig) =>
      body?.toLowerCase().includes(sig.toLowerCase())
    );
  }
  return false;
};

/**
 * Get video URL
 */
const getVideo = async (action, post, nume, type) => {
  const maxRetries = 3;
  const got = await waitForGotScraping();

  // Build form data as URLSearchParams for got-scraping
  const formBody = new URLSearchParams({
    action,
    post,
    nume,
    type,
  }).toString();

  let lastError = null;
  let response = null;

  // Retry loop untuk handle Cloudflare
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      response = await got({
        url: `${BASE_URL}/wp-admin/admin-ajax.php`,
        method: "POST",
        body: formBody,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Referer": BASE_URL,
          "Origin": BASE_URL,
        },
        headerGeneratorOptions: {
          browsers: [{ name: "chrome", minVersion: 100 }],
          devices: ["desktop"],
          operatingSystems: ["windows"],
        },
        timeout: { request: 30000 },
        retry: { limit: 0 },
      });

      // Check Cloudflare challenge
      if (isCloudflareChallenge(response.statusCode, response.body)) {
        console.warn(`[Attempt ${attempt}/${maxRetries}] Cloudflare challenge detected`);
        lastError = new Error("Cloudflare challenge detected");
        
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 2000 * attempt));
        }
        continue;
      }

      // Success
      break;
    } catch (err) {
      lastError = err;
      console.warn(`[Attempt ${attempt}/${maxRetries}] Request failed:`, err.message);

      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
  }

  // Jika semua retry gagal
  if (!response || isCloudflareChallenge(response?.statusCode, response?.body)) {
    return {
      error: true,
      statusCode: 503,
      message: "Cloudflare protection active",
      details: lastError?.message || null,
      params: { action, post, nume, type },
    };
  }

  // Parse response
  const iframeHtml = response.body;
  const urlMatch = iframeHtml.match(/src="([^"]+)"/);

  return {
    response: iframeHtml,
    url: urlMatch ? urlMatch[1] : null,
  };
};

module.exports = {
  getVideo,
};
