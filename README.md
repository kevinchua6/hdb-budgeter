# HDB Budgeter

**Live at [hdb-budgeter.vercel.app](https://hdb-budgeter.vercel.app/)**

Find out which parts of Singapore you can actually afford a resale HDB flat in.

Instead of manually checking every MRT station on PropertyGuru, this app shows average
resale prices near each MRT station on a map, filterable by flat type, floor level,
lease remaining, walking distance from the station, and how recent the transactions are.
Click a station to see the actual matching transactions. There's also a calculator (WIP) for
the cash/CPF breakdown (BSD, downpayment, grants) once you've found a price point you like.

## Data sources

- Resale transactions: [data.gov.sg](https://data.gov.sg) (HDB resale flat prices dataset)
- Walking distance to MRT stations: [OneMap API](https://www.onemap.gov.sg/apidocs/) (Singapore's official geospatial API)

## Getting started

Install dependencies, then run the one-time data setup (downloads the resale CSVs,
geocodes each block, finds the nearest MRT station, and seeds the local SQLite DB):

```bash
npm install
npm run setup
```

Then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

### Setup scripts

- `npm run setup:map` — processes the MRT map HTML into `public/mrt-map.html`
- `npm run setup:download` — downloads the latest HDB resale CSVs from data.gov.sg
- `npm run setup:seed` — geocodes each block via OneMap and seeds the SQLite DB (resumable — caches geocoding results in `data/geocache.json`)

## Tech stack

Next.js, React, Tailwind CSS, SQLite (via Drizzle ORM).
