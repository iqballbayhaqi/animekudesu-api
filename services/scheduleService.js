const { scrapeGet, cheerio } = require("../utils/scraper");
require("dotenv").config();

const BASE_URL = process.env.SCRAPE_URL;

// Day mapping (Indonesian to English)
const dayMap = {
  senin: "monday",
  selasa: "tuesday",
  rabu: "wednesday",
  kamis: "thursday",
  jumat: "friday",
  jumaat: "friday",
  sabtu: "saturday",
  minggu: "sunday",
  monday: "monday",
  tuesday: "tuesday",
  wednesday: "wednesday",
  thursday: "thursday",
  friday: "friday",
  saturday: "saturday",
  sunday: "sunday",
};

// Day names in Indonesian
const dayNames = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
};

// Available days list
const availableDays = [
  { day: "Senin", day_value: "monday" },
  { day: "Selasa", day_value: "tuesday" },
  { day: "Rabu", day_value: "wednesday" },
  { day: "Kamis", day_value: "thursday" },
  { day: "Jumat", day_value: "friday" },
  { day: "Sabtu", day_value: "saturday" },
  { day: "Minggu", day_value: "sunday" },
];

/**
 * Get release schedule
 */
const getReleaseSchedule = async (day, perPage = 50, debug = false) => {
  const dayParam = day?.toLowerCase();
  const targetDay = dayMap[dayParam] || "monday";

  const apiUrl = `${BASE_URL}/jadwal-rilis/`;
  const response = await scrapeGet(apiUrl);
  
  // Debug mode
  if (debug) {
    return {
      message: "Debug mode",
      api_url: apiUrl,
      raw_response: response.data.substring(0, 3000),
    };
  }

  const $ = cheerio.load(response.data);
  const animeList = [];
  $(`.result-schedule[x-show="activeDay === '${targetDay}'"] .animepost`).slice(0, perPage).each((_, elem) => {
    const card = $(elem);
    const a = card.find('.animposx > a').first();
    const url = a.attr('href') || '';
    const slug = url.replace(/^https?:\/\/[^/]+\/anime/, '');
    if (!slug) return;
    animeList.push({
      title: card.find('.data h2').text().trim() || a.attr('title') || '',
      slug,
      img: card.find('.content-thumb img').attr('src') || '',
      type: card.find('.content-thumb .type').text().trim(),
      score: parseFloat(card.find('.content-thumb .score').text().match(/[\d.]+/)?.[0]) || null,
      genres: card.find('.data > .type').text().split(',').map(s => s.trim()).filter(Boolean),
      time: card.find('.data_tw .ltseps').text().trim(),
      schedule: dayNames[targetDay],
      description: '',
      detail_url: `/detail-anime${slug}`,
    });
  });

  return {
    message: "Jadwal Rilis Anime",
    day: dayNames[targetDay],
    day_value: targetDay,
    available_days: availableDays.map(d => ({
      ...d,
      endpoint: `/release-schedule?day=${d.day_value}`,
    })),
    total_anime: animeList.length,
    data: animeList,
  };
};

module.exports = {
  getReleaseSchedule,
  dayMap,
  dayNames,
  availableDays,
};
