const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AnimekudesuAPI",
      version: "1.0.0",
      description: "Unofficial API from Samehadaku site to get anime streaming data",
      contact: {
        name: "Iqball Bayhaqi",
        url: "https://ko-fi.com/iqballbaihaqi",
      },
      license: {
        name: "MIT",
        url: "https://choosealicense.com/licenses/mit/",
      },
    },
    servers: [
      {
        url: "/",
        description: "Current Server",
      },
    ],
    tags: [
      { name: "Anime", description: "Anime list endpoints" },
      { name: "Detail", description: "Anime detail endpoints" },
      { name: "Genre", description: "Genre endpoints" },
      { name: "Search", description: "Search endpoints" },
      { name: "Video", description: "Video endpoints" },
      { name: "Schedule", description: "Release schedule endpoints" },
    ],
    paths: {
      "/new-anime": {
        get: {
          tags: ["Anime"],
          summary: "Get new anime list",
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Page number",
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: { type: "array", items: { type: "object" } },
                      total_items: { type: "integer" },
                      current_page: { type: "integer" },
                      total_page: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/list-anime": {
        get: {
          tags: ["Anime"],
          summary: "Get all anime list",
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Page number",
            },
          ],
          responses: {
            200: { description: "Successful response" },
          },
        },
      },
      "/ongoing-anime": {
        get: {
          tags: ["Anime"],
          summary: "Get ongoing anime list",
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Page number",
            },
          ],
          responses: {
            200: { description: "Successful response" },
          },
        },
      },
      "/completed-anime": {
        get: {
          tags: ["Anime"],
          summary: "Get completed anime list",
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Page number",
            },
          ],
          responses: {
            200: { description: "Successful response" },
          },
        },
      },
      "/type-anime/{type}": {
        get: {
          tags: ["Anime"],
          summary: "Get anime by type",
          parameters: [
            {
              name: "type",
              in: "path",
              required: true,
              schema: { type: "string", enum: ["tv", "ova", "ona", "special", "movie"] },
              description: "Anime type",
            },
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Page number",
            },
          ],
          responses: {
            200: { description: "Successful response" },
            400: { description: "Invalid type" },
          },
        },
      },
      "/order-anime/{order}": {
        get: {
          tags: ["Anime"],
          summary: "Get anime list ordered by criteria",
          parameters: [
            {
              name: "order",
              in: "path",
              required: true,
              schema: { type: "string", enum: ["a-z", "z-a", "latest-update", "latest-added", "popular"] },
              description: "Order criteria",
            },
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Page number",
            },
          ],
          responses: {
            200: { description: "Successful response" },
            400: { description: "Invalid order" },
          },
        },
      },
      "/detail-anime/{slug}": {
        get: {
          tags: ["Detail"],
          summary: "Get anime detail",
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Anime slug (e.g., /naruto/)",
            },
          ],
          responses: {
            200: { description: "Successful response" },
          },
        },
      },
      "/detail-anime-episode/{slug}": {
        get: {
          tags: ["Detail"],
          summary: "Get anime episode detail",
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Episode slug",
            },
          ],
          responses: {
            200: { description: "Successful response" },
          },
        },
      },
      "/genres": {
        get: {
          tags: ["Genre"],
          summary: "Get all genres",
          responses: {
            200: { description: "Successful response" },
          },
        },
      },
      "/genre-anime/{genre}": {
        get: {
          tags: ["Genre"],
          summary: "Get anime by genre",
          parameters: [
            {
              name: "genre",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Genre name (e.g., action, comedy)",
            },
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Page number",
            },
          ],
          responses: {
            200: { description: "Successful response" },
          },
        },
      },
      "/search-anime": {
        get: {
          tags: ["Search"],
          summary: "Search anime by title",
          parameters: [
            {
              name: "search",
              in: "query",
              required: true,
              schema: { type: "string" },
              description: "Search keyword",
            },
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
              description: "Page number",
            },
          ],
          responses: {
            200: { description: "Successful response" },
          },
        },
      },
      "/get-video/{action}/{post}/{nume}/{type}": {
        get: {
          tags: ["Video"],
          summary: "Get video URL",
          parameters: [
            {
              name: "action",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Action parameter",
            },
            {
              name: "post",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Post ID",
            },
            {
              name: "nume",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Nume parameter",
            },
            {
              name: "type",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Type parameter",
            },
          ],
          responses: {
            200: { description: "Successful response" },
          },
        },
      },
      "/release-schedule": {
        get: {
          tags: ["Schedule"],
          summary: "Get anime release schedule",
          parameters: [
            {
              name: "day",
              in: "query",
              schema: { 
                type: "string", 
                enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"],
                default: "monday" 
              },
              description: "Day of the week",
            },
            {
              name: "perpage",
              in: "query",
              schema: { type: "integer", default: 50 },
              description: "Number of items per page",
            },
          ],
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      day: { type: "string" },
                      day_value: { type: "string" },
                      available_days: { type: "array", items: { type: "object" } },
                      total_anime: { type: "integer" },
                      data: { type: "array", items: { type: "object" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
