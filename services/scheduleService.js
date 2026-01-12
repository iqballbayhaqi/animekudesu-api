const { scrapeGet } = require("../utils/scraper");
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

  const apiUrl = `${BASE_URL}/wp-json/custom/v1/all-schedule?perpage=${perPage}&day=${targetDay}&type=schtml`;
  const response = await scrapeGet(apiUrl);
  
  // Debug mode
  if (debug) {
    return {
      message: "Debug mode",
      api_url: apiUrl,
      raw_response: response.data.substring(0, 3000),
    };
  }

  // Parse JSON response
  let scheduleData;
  try {
    scheduleData = JSON.parse(response.data);
  } catch (e) {
    return {
      error: true,
      message: "Failed to parse schedule data",
      errorDetail: e.message,
      raw_response: response.data.substring(0, 1000),
    };
  }

  // Map API response to anime list
  const animeList = scheduleData.map((item) => ({
    title: item.title,
    slug: `/${item.slug}/`,
    img: item.featured_img_src,
    type: item.east_type || "",
    score: item.east_score ? parseFloat(item.east_score) : null,
    genres: item.genre ? item.genre.split(", ").map(g => g.trim()).filter(g => g) : [],
    time: item.east_time || "",
    schedule: item.east_schedule || "",
    description: item.content ? item.content.replace(/<[^>]*>/g, "").substring(0, 200) + "..." : "",
    detail_url: `/detail-anime/${item.slug}/`,
  }));

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
