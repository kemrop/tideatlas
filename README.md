# PeptideAtlas

API for listing peptide vendors and their certificates of analysis (COAs). Built with Express 5, TypeScript, and Zod. Data is served from in-memory files in `src/data`; vendors were imported from [TriedRx](https://triedrx.com/vendors/) (1,934 vendors).

## Prerequisites

- Node.js (a recent LTS release) and npm

## Setup

```sh
npm install
```

## Run

Development (auto-reloads on changes):

```sh
npm run dev
```

Production:

```sh
npm run build
npm start
```

The server listens on `http://localhost:3000` by default. Set the `PORT` environment variable to change it:

```sh
PORT=8080 npm run dev
```

## Other scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm test`          | Run the test suite (Vitest)          |
| `npm run typecheck` | Type-check without emitting          |
| `npm run build`     | Compile TypeScript to `dist/`        |
| `npm run lint`      | Check lint and formatting (Biome)    |
| `npm run fix`       | Auto-fix lint issues and format code |

## API

Interactive Swagger UI is available at `http://localhost:3000/docs`, and the raw OpenAPI document at `/openapi.json`.

| Endpoint                | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| `GET /docs`             | Swagger UI                                            |
| `GET /openapi.json`     | OpenAPI 3 document                                    |
| `GET /health`           | Health check                                          |
| `GET /peptides`         | List peptides                                         |
| `GET /vendors`          | List vendors (paginated)                              |
| `GET /vendors/:id`      | Get a single vendor                                   |
| `GET /vendors/:id/coas` | List a vendor's COAs; optional `peptide` query filter |

`GET /vendors` query parameters:

- `q` – vendor name search
- `peptide` – filter by peptide id
- `country` – two-letter country code
- `hasCoa` – `true` or `false`
- `page` – page number (default `1`)
- `limit` – page size (default `20`, max `100`)

Example:

```sh
curl "http://localhost:3000/vendors?hasCoa=true&limit=5"
```

Invalid requests return `400`, unknown resources return `404`.
