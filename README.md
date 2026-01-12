![animekudesu-api](https://socialify.git.ci/iqballbayhaqi/animekudesu-api/image?forks=1&issues=1&language=1&name=1&owner=1&pulls=1&stargazers=1&theme=Light)

# AnimekudesuAPI

Unofficial REST API untuk mendapatkan data anime dari [Samehadaku](https://samehadaku.email/). API ini menyediakan berbagai endpoint untuk mengakses informasi anime, episode, genre, jadwal rilis, dan lainnya.

## Features

- 📺 List anime (ongoing, completed, new)
- 🎬 Filter berdasarkan type (TV, OVA, ONA, Special, Movie)
- 🔤 Sorting (A-Z, Z-A, Popular, Latest Update, Latest Added)
- 🔍 Search anime by title
- 📅 Jadwal rilis anime
- 🎭 List genre dan anime per genre
- 📖 Detail anime dan episode
- 🎥 Video URL streaming
- 📚 Swagger UI Documentation
- 🏗️ MVC Architecture

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Architecture:** MVC (Model-View-Controller)
- **Scraping:** Cheerio, Got-Scraping
- **Documentation:** Swagger UI

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/iqballbayhaqi/animekudesu-api
cd animekudesu-api
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 3. Environment Setup

Buat file `.env` di root folder:

```env
SCRAPE_URL=https://v1.samehadaku.how
PORT=3000
```

### 4. Run Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## API Documentation

Akses Swagger UI di: `http://localhost:3000/api-docs`

## API Endpoints

### Anime List

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/new-anime` | Anime terbaru | `page` |
| GET | `/list-anime` | Semua anime | `page` |
| GET | `/ongoing-anime` | Anime ongoing | `page` |
| GET | `/completed-anime` | Anime completed | `page` |

### Filter & Sort

| Method | Endpoint | Description | Params |
|--------|----------|-------------|--------|
| GET | `/type-anime/:type` | Filter by type | `type`: tv, ova, ona, special, movie |
| GET | `/order-anime/:order` | Sort anime | `order`: a-z, z-a, latest-update, latest-added, popular |

### Detail

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/detail-anime/:slug` | Detail anime |
| GET | `/detail-anime-episode/:slug` | Detail episode |

### Genre

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/genres` | List semua genre |
| GET | `/genre-anime/:genre` | Anime berdasarkan genre |

### Search

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/search-anime` | Cari anime | `search`, `page` |

### Schedule

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/release-schedule` | Jadwal rilis | `day` (monday-sunday), `perpage` |

### Video

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/get-video/:action/:post/:nume/:type` | Get video URL |

## Project Structure (MVC)

```
animekudesu-new-be/
├── bin/
│   └── www                    # Server entry point
├── controllers/               # Handle request/response
│   ├── index.js
│   ├── animeController.js
│   ├── detailController.js
│   ├── genreController.js
│   ├── scheduleController.js
│   ├── searchController.js
│   └── videoController.js
├── middlewares/
│   └── errorHandler.js        # Error handling middleware
├── routes/                    # Route definitions
│   ├── index.js
│   ├── anime.js
│   ├── detail.js
│   ├── genre.js
│   ├── schedule.js
│   ├── search.js
│   └── video.js
├── services/                  # Business logic & data fetching
│   ├── index.js
│   ├── animeService.js
│   ├── detailService.js
│   ├── genreService.js
│   ├── scheduleService.js
│   ├── searchService.js
│   └── videoService.js
├── utils/
│   └── scraper.js             # Scraping utilities
├── views/                     # View templates (Jade)
├── app.js                     # Express app config
├── swagger.js                 # Swagger configuration
└── package.json
```

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │ ──▶ │    Routes    │ ──▶ │ Controllers │ ──▶ │  Services   │
│  (Request)  │     │  (Endpoints) │     │  (Handler)  │     │  (Logic)    │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
                                                                    │
                                                                    ▼
                                                            ┌─────────────┐
                                                            │   Utils     │
                                                            │  (Scraper)  │
                                                            └─────────────┘
```

**Flow:**
1. **Routes** - Mendefinisikan endpoint dan method HTTP
2. **Controllers** - Menerima request, memanggil service, mengirim response
3. **Services** - Business logic, data fetching, dan data processing
4. **Utils** - Helper functions (scraping, parsing, dll)

## Response Example

### Anime List Response

```json
{
  "data": [
    {
      "img": "https://...",
      "title": "Anime Title",
      "slug": "/anime-slug/",
      "type": "TV",
      "score": "8.5",
      "genres": ["Action", "Adventure"],
      "detail_url": "/detail-anime/anime-slug/"
    }
  ],
  "total_items": 24,
  "current_page": 1,
  "total_page": 100
}
```

### Release Schedule Response

```json
{
  "message": "Jadwal Rilis Anime",
  "day": "Senin",
  "day_value": "monday",
  "available_days": [...],
  "total_anime": 10,
  "data": [
    {
      "title": "Anime Title",
      "slug": "/anime-slug/",
      "img": "https://...",
      "type": "TV",
      "score": 7.8,
      "genres": ["Action", "Fantasy"],
      "time": "01:00",
      "detail_url": "/detail-anime/anime-slug/"
    }
  ]
}
```

## Contributing

Pull requests are welcome! Untuk perubahan besar, silakan buka issue terlebih dahulu untuk mendiskusikan perubahan yang ingin dilakukan.

## Support

Jika project ini bermanfaat, dukung saya di:

[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/iqballbaihaqi)

## License

[MIT](https://choosealicense.com/licenses/mit/)

---

Made with ❤️ by [@Iqballbayhaqi](https://github.com/iqballbayhaqi)
