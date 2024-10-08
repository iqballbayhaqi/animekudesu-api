var express = require("express");
var router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");
const { route } = require(".");
const { path } = require("../app");
require("dotenv").config();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({
    message: "Welcome to Anime API",
    author: "@Iqballbayhaqi",
    scraping_url: process.env.SCRAPE_URL,
    support_me: 'https://ko-fi.com/iqballbaihaqi',
    routes: [
      {
        method: "GET",
        path: "/new-anime",
        description: "Get new anime list",
        query: {
          page: "number",
        },        
      },
      {
        method: "GET",
        path: "/list-anime",
        description: "Get list anime",
        query: {
          page: "number",
        },
      },
      {
        method: "GET",
        path: "/detail-anime/:slug",
        description: "Get detail anime",
        params: {
          slug: "string",
        },
      },
      {
        method: "GET",
        path: "/detail-anime-episode/:slug",
        description: "Get detail anime episode",
        params: {
          slug: "string",
        },
      },
      {
        method: "GET",
        path: "/get-video/:action/:post/:nume/:type",
        description: "Get video url",
        params: {
          action: "string",
          post: "string",
          nume: "string",
          type: "string",
        },
      },
      {
        method: "GET",
        path: "/genres",
        description: "Get genres anime",
      },
      {
        method: "GET",
        path: "/genre-anime/:genre",
        description: "Get anime by genre",
        params: {
          genre: "string",
        },
        query: {
          page: "number",
        },
      },
    ]
  });
});

router.get("/new-anime", function (req, res, next) {
  axios
    .get(`${process.env.SCRAPE_URL}/anime-terbaru/page/1`)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const page_section = $(
        "#main > div.post-show > ul > div > span:nth-child(1)"
      )
        .text()
        .trim();
      const total_page = parseInt(page_section.match(/of (\d+)/)[1]);

      if (total_page < req.query.page || req.query.page < 1) {
        return res.json({
          data: [],
          total_items: 0,
          current_page: 0,
          total_page,
        });
      }
    });

  axios
    .get(
      `${process.env.SCRAPE_URL}/anime-terbaru/page/${req.query.page || "1"}`
    )
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      const animeList = [];

      $("#main > div.post-show > ul > li").each((i, elem) => {
        const img = $(elem).find("img").attr("src");
        const alt = $(elem).find("img").attr("alt");
        const link = $(elem)
          .find("a")
          .attr("href")
          .replace(process.env.SCRAPE_URL, "");
        const title = $(elem).find("h2.entry-title > a").text();
        const episode = $(elem)
          .find("div.dtla > span:nth-child(2)")
          .text()
          .trim();
        const posted_by = $(elem)
          .find("div.dtla > span.author.vcard > author")
          .text()
          .trim();
        const released = $(elem)
          .find("div.dtla > span:nth-child(4)")
          .text()
          .trim()
          .replace("Released on: ", "");
        animeList.push({ img, alt, link, title, episode, posted_by, released });
      });

      const page_section = $(
        "#main > div.post-show > ul > div > span:nth-child(1)"
      )
        .text()
        .trim();
      const current_page = parseInt(page_section.match(/Page (\d+) of/)[1]);
      const total_page = parseInt(page_section.match(/of (\d+)/)[1]);

      res.json({
        data: animeList,
        total_items: animeList.length,
        current_page,
        total_page,
      });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.get("/list-anime", function (req, res, next) {
  axios.get(`${process.env.SCRAPE_URL}/daftar-anime-2`).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);
    const page_section = $("#main > div.relat > div > span:nth-child(1)")
      .text()
      .trim();
    const total_page = parseInt(page_section.match(/of (\d+)/)[1]);

    if (total_page < req.query.page || req.query.page < 1) {
      return res.json({
        data: [],
        total_items: 0,
        current_page: 0,
        total_page,
      });
    }
  });

  axios
    .get(
      `${process.env.SCRAPE_URL}/daftar-anime-2/page/${req.query.page || "1"}`
    )
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      const animeList = [];

      $("div.relat > article.animpost").each((i, elem) => {
        const slug = $(elem)
          .find("div.animposx > a")
          .attr("href")
          .replace(process.env.SCRAPE_URL + "/anime", "");
        const img = $(elem).find("div.content-thumb > img").attr("src");
        const alt = $(elem).find("div.content-thumb > img").attr("alt");
        const type = $(elem).find("div.content-thumb > div.type").text().trim();
        const score = $(elem)
          .find("div.content-thumb > div.score")
          .text()
          .trim();
        const title = $(elem).find("div.stooltip > div.title").text().trim();
        const total_views = Number(
          $(elem)
            .find("div.stooltip > div.metadata > span:nth-child(3)")
            .text()
            .trim()
            .replace(" Views", "")
        );
        const description = $(elem)
          .find("div.stooltip > div.ttls")
          .text()
          .trim();
        const genre = $(elem).find("div.stooltip > div.genres > div > a");
        const genres = [];
        genre.each((i, elem) => {
          genres.push({
            tag: $(elem).text().trim(),
            link: $(elem).attr("href"),
          });
        });

        animeList.push({
          img,
          alt,
          slug,
          type,
          score,
          title,
          total_views,
          description,
          genres,
          detail_url: `/detail-anime${slug}`,
        });
      });

      const page_section = $("#main > div.relat > div > span:nth-child(1)")
        .text()
        .trim();
      const current_page = parseInt(page_section.match(/Page (\d+) of/)[1]);
      const total_page = parseInt(page_section.match(/of (\d+)/)[1]);

      res.json({
        data: animeList,
        total_items: animeList.length,
        current_page,
        total_page,
      });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.get("/detail-anime/:slug", function (req, res, next) {
  axios
    .get(`${process.env.SCRAPE_URL}/anime/${req.params.slug}`)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      const title = $("#infoarea > div > div.infoanime.widget_senction > h1")
        .text()
        .trim()
        .replace("Nonton Anime ", "");
      const img = $(
        "#infoarea > div > div.infoanime.widget_senction > div.thumb > img"
      ).attr("src");
      const rating = $(
        "#infoarea > div > div.infoanime.widget_senction > div.thumb > div > div > div > div > span"
      )
        .text()
        .trim();
      const rating_count = $(
        "#infoarea > div > div.infoanime.widget_senction > div.thumb > div > div > div > div > i"
      )
        .text()
        .trim();
      const description = $(
        "#infoarea > div > div.infoanime.widget_senction > div.infox > div.desc > div > p"
      );
      const descriptions = [];
      description.each((i, elem) => {
        descriptions.push($(elem).text().trim());
      });
      const genre = $(
        "#infoarea > div > div.infoanime.widget_senction > div.infox > div.genre-info > a"
      );
      const genres = [];
      genre.each((i, elem) => {
        genres.push({ tag: $(elem).text().trim(), link: $(elem).attr("href") });
      });
      const japanese_title = $(
        "#infoarea > div > div.anim-senct > div.right-senc.widget_senction > div > div > div > span:nth-child(1)"
      )
        .text()
        .trim()
        .replace("Japanese ", "");
      const english_title = $(
        "#infoarea > div > div.anim-senct > div.right-senc.widget_senction > div > div > div > span:nth-child(3)"
      )
        .text()
        .trim()
        .replace("English ", "");
      const type = $(
        "#infoarea > div > div.anim-senct > div.right-senc.widget_senction > div > div > div > span:nth-child(5)"
      )
        .text()
        .trim()
        .replace("Type ", "");
      const duration = $(
        "#infoarea > div > div.anim-senct > div.right-senc.widget_senction > div > div > div > span:nth-child(7)"
      )
        .text()
        .trim()
        .replace("Duration ", "");
      const season = $(
        "#infoarea > div > div.anim-senct > div.right-senc.widget_senction > div > div > div > span:nth-child(9)"
      )
        .text()
        .trim()
        .replace("Season ", "");
      const producer = $(
        "#infoarea > div > div.anim-senct > div.right-senc.widget_senction > div > div > div > span:nth-child(11)"
      )
        .text()
        .trim()
        .replace("Producer ", "");
      const synonims = $(
        "#infoarea > div > div.anim-senct > div.right-senc.widget_senction > div > div > div > span:nth-child(2)"
      )
        .text()
        .trim()
        .replace("Synonyms ", "");
      const status = $(
        "#infoarea > div > div.anim-senct > div.right-senc.widget_senction > div > div > div > span:nth-child(4)"
      )
        .text()
        .trim()
        .replace("Status ", "");
      const source = $(
        "#infoarea > div > div.anim-senct > div.right-senc.widget_senction > div > div > div > span:nth-child(6)"
      )
        .text()
        .trim()
        .replace("Source ", "");
      const total_episode = $(
        "#infoarea > div > div.anim-senct > div.right-senc.widget_senction > div > div > div > span:nth-child(8)"
      )
        .text()
        .trim()
        .replace("Total Episode ", "");
      const studio = $(
        "#infoarea > div > div.anim-senct > div.right-senc.widget_senction > div > div > div > span:nth-child(10)"
      )
        .text()
        .trim()
        .replace("Studio ", "");
      const released = $(
        "#infoarea > div > div.anim-senct > div.right-senc.widget_senction > div > div > div > span:nth-child(12)"
      )
        .text()
        .replace("Released: ", "")
        .trim();
      const trailer_video = $("#pembed > iframe").attr("src");
      const episode = $(
        "#infoarea > div > div.whites.lsteps.widget_senction > div.lstepsiode.listeps > ul > li"
      );
      const episodes = [];
      episode.each((i, elem) => {
        const title = $(elem).find("span.lchx > a").text();
        const link = $(elem)
          .find("span.lchx > a")
          .attr("href")
          .replace(process.env.SCRAPE_URL, "");
        const episode = Number($(elem).find("span.eps > a").text());
        episodes.push({ title, link, detail_eps: `/detail-anime-episode${link}`, episode });
      });

      res.json({
        title,
        img,
        rating,
        rating_count,
        descriptions,
        genres,
        japanese_title,
        english_title,
        type,
        duration,
        season,
        producer,
        synonims,
        status,
        source,
        total_episode,
        studio,
        released,
        trailer_video,
        episodes,
      });
    })
    .catch((error) => {
      console.error(error);
    });
});

router.get("/detail-anime-episode/:slug", function (req, res, next) {
  axios
    .get(`${process.env.SCRAPE_URL}/${req.params.slug}`)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      const title = $(".info_episode > div > h1").text().trim();
      const description = $(".info_episode  > div > div.entry-content.entry-content-single").text().trim();
      const episode_number = Number($("span[itemprop='episodeNumber']").text().trim());
      const video_url = $("#player_embed > .pframe > iframe").attr("src") || 'belu tersedia ( segera )';
      const videoslist = $("#server > ul > li");
      const videos = [];
      videoslist.each((i, elem) => {
        const title = $(elem).find("span").text().trim();
        const id = $(elem).find(".east_player_option").attr("id");
        const post = $(elem).find(".east_player_option").attr("data-post");
        const nume = $(elem).find(".east_player_option").attr("data-nume");
        const action = "player_ajax"
        const type = $(elem).find(".east_player_option").attr("data-type");
        const video = `/get-video/${action}/${post}/${nume}/${type}`;
        videos.push({ id, title, post, action, nume, type, video });
      });

      res.json({
        title,
        description,
        episode_number,
        video_url,
        videos
      });
    })
    .catch((error) => {
      console.error(error);
    });
});

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
        url: urlMatch[1]
      });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Something went wrong" });
    });
});

router.get("/genres", function (req, res, next) {
  axios.get(`${process.env.SCRAPE_URL}/daftar-anime-2/`).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    const genreList = [];
    
    $("tr.filter_tax > td.filter_act.genres > label").each((i, elem) => {
      const title = $(elem).text().trim();
      const id = $(elem).find("input").attr("value");
      genreList.push({ title, id });
    });

    res.json({
      data: genreList,
      total_items: genreList.length,
    });
  });
});

router.get("/genre-anime/:genre", function (req, res, next) {
  axios.get(`${process.env.SCRAPE_URL}/genre/${req.params.genre}/page/${req.query.page || 1}`).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    const animeList = [];

    $("div.relat > article.animpost").each((i, elem) => {
      const slug = $(elem)
        .find("div.animposx > a")
        .attr("href")
        .replace(process.env.SCRAPE_URL + "/anime", "");
      const img = $(elem).find("div.content-thumb > img").attr("src");
      const alt = $(elem).find("div.content-thumb > img").attr("alt");
      const type = $(elem).find("div.content-thumb > div.type").text().trim();
      const score = $(elem)
        .find("div.content-thumb > div.score")
        .text()
        .trim();
      const title = $(elem).find("div.stooltip > div.title").text().trim();
      const total_views = Number(
        $(elem)
          .find("div.stooltip > div.metadata > span:nth-child(3)")
          .text()
          .trim()
          .replace(" Views", "")
      );
      const description = $(elem)
        .find("div.stooltip > div.ttls")
        .text()
        .trim();
      const genre = $(elem).find("div.stooltip > div.genres > div > a");
      const genres = [];
      genre.each((i, elem) => {
        genres.push({
          tag: $(elem).text().trim(),
          link: $(elem).attr("href"),
        });
      });

      animeList.push({
        img,
        alt,
        slug,
        type,
        score,
        title,
        total_views,
        description,
        genres,
        detail_url: `/detail-anime${slug}`,
      });
    });

    const page_section = $("#main > div.pagination > span:nth-child(1)")
      .text()
      .trim();
    const current_page = page_section ? parseInt(page_section.match(/Page (\d+) of/)[1]) : 1;
    const total_page = page_section ? parseInt(page_section.match(/of (\d+)/)[1]) : 1;

    res.json({
      data: animeList,
      total_items: animeList.length,
      current_page,
      total_page,
    });
  }
)});

module.exports = router;
