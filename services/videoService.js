const { scrapeGet, cheerio } = require('../utils/scraper');
require('dotenv').config();

const BASE_URL = process.env.SCRAPE_URL;

/** Resolve the server embed from the episode page used by Samehadaku v2. */
const getVideo = async (action, post, nume, type) => {
  if (action !== 'player_ajax' || !/^\d+$/.test(post) || !/^\d+$/.test(nume) || type !== 'schtml') {
    return { error: true, statusCode: 400, message: 'Invalid player parameters' };
  }

  const response = await scrapeGet(`${BASE_URL}/?p=${post}`);
  const $ = cheerio.load(response.data);
  const player = $('.east_player_option').filter((_, elem) =>
    $(elem).attr('data-post') === post &&
    $(elem).attr('data-nume') === nume &&
    $(elem).attr('data-type') === type
  ).first();
  const embed = player.attr('data-embed') || '';
  const url = cheerio.load(embed)('iframe').first().attr('src') || player.attr('data-url') || null;

  if (!url || !/^https?:\/\//i.test(url)) {
    return { error: true, statusCode: 404, message: 'Player server unavailable' };
  }
  return { response: embed, url };
};

module.exports = { getVideo };
