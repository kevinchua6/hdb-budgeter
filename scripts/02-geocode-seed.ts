// Parses HDB resale CSV files, geocodes each unique block via OneMap API,
// finds nearest MRT station by straight-line distance, then seeds the SQLite DB.
// Geocoding results are cached in data/geocache.json (resumable if interrupted).
// Usage: bun scripts/02-geocode-seed.ts
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { Database } from "bun:sqlite";
import { nearestStation } from "../src/lib/stations";

mkdirSync("data", { recursive: true });

// ── CSV sources ───────────────────────────────────────────────────────────────

const CSV_FILES = [
  "reference/ResaleflatpricesbasedonregistrationdatefromJan2017onwards.csv",
  "reference/ResaleFlatPricesBasedonRegistrationDateFromJan2015toDec2016.csv",
  "reference/ResaleFlatPricesBasedonRegistrationDateFromMar2012toDec2014.csv",
].filter((f) => existsSync(f));

interface Row {
  month: string;
  flatType: string;
  block: string;
  streetName: string;
  storeyRange: string;
  resalePrice: number;
}

function parseCSV(path: string): Row[] {
  const text = readFileSync(path, "utf-8");
  const lines = text.split("\n");
  const header = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const col = (name: string) => header.indexOf(name);
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    if (parts.length < 9) continue;
    const price = parseInt(parts[col("resale_price")], 10);
    if (isNaN(price)) continue;
    rows.push({
      month: parts[col("month")].trim(),
      flatType: parts[col("flat_type")].trim(),
      block: parts[col("block")].trim(),
      streetName: parts[col("street_name")].trim(),
      storeyRange: parts[col("storey_range")].trim(),
      resalePrice: price,
    });
  }
  return rows;
}

let allRows: Row[] = [];
for (const f of CSV_FILES) {
  const rows = parseCSV(f);
  console.log(`  ${f}: ${rows.length.toLocaleString()} rows`);
  allRows = allRows.concat(rows);
}
console.log(`Total: ${allRows.length.toLocaleString()} transactions`);

// ── Collect unique blocks ─────────────────────────────────────────────────────

type BlockKey = string;
const uniqueBlocks = new Map<BlockKey, { block: string; street: string }>();
for (const r of allRows) {
  const key = `${r.block}||${r.streetName}`;
  if (!uniqueBlocks.has(key)) uniqueBlocks.set(key, { block: r.block, street: r.streetName });
}
console.log(`\nUnique blocks: ${uniqueBlocks.size.toLocaleString()}`);

// ── Geocoding with persistent cache ──────────────────────────────────────────

// Cache values:
//   GeoResult object = successfully geocoded
//   "no_results"     = OneMap found nothing (permanently skip on retry)
//   absent key       = not yet tried (or failed with 429/error — will retry)
type GeoResult = { lat: number; lng: number; stationCode: string; walkingMinutes: number };
type CacheValue = GeoResult | "no_results";

const CACHE_FILE = "data/geocache.json";
let rawCache: Record<BlockKey, unknown> = existsSync(CACHE_FILE)
  ? JSON.parse(readFileSync(CACHE_FILE, "utf-8"))
  : {};

// Upgrade: drop old null entries (rate-limit failures from previous runs)
const cache: Record<BlockKey, CacheValue> = {};
let droppedNulls = 0;
for (const [k, v] of Object.entries(rawCache)) {
  if (v === null) { droppedNulls++; continue; }     // null = old failed entry, retry it
  if (v === "no_results") { cache[k] = "no_results"; continue; }
  if (typeof v === "object" && v !== null && "lat" in v) {
    cache[k] = v as GeoResult;
  }
}
if (droppedNulls > 0) console.log(`Dropped ${droppedNulls} null entries from old cache (will retry)`);

const successCached = Object.values(cache).filter((v) => v !== "no_results").length;
const noResultsCached = Object.values(cache).filter((v) => v === "no_results").length;
console.log(`Cache: ${successCached} geocoded, ${noResultsCached} confirmed no-results`);

async function geocodeBlock(block: string, street: string): Promise<CacheValue | "error"> {
  const q = encodeURIComponent(`${block} ${street}`);
  const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${q}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
  try {
    const res = await fetch(url);
    if (res.status === 429) return "error";  // Rate limited
    if (!res.ok) return "error";
    const text = await res.text();
    let data: { results?: Array<{ LATITUDE: string; LONGITUDE: string }> };
    try { data = JSON.parse(text); } catch { return "error"; }  // Non-JSON = rate limited
    if (!data.results?.length) return "no_results";
    const lat = parseFloat(data.results[0].LATITUDE);
    const lng = parseFloat(data.results[0].LONGITUDE);
    const { code, walkingMinutes } = nearestStation(lat, lng);
    return { lat, lng, stationCode: code, walkingMinutes };
  } catch {
    return "error";
  }
}

const seedOnly = process.argv.includes("--seed-only");
const toGeocode = seedOnly ? [] : [...uniqueBlocks.entries()].filter(([key]) => !(key in cache));

if (seedOnly) {
  console.log("--seed-only: skipping geocoding, seeding from current cache.");
} else {
  console.log(`Geocoding ${toGeocode.length.toLocaleString()} blocks (${uniqueBlocks.size - toGeocode.length} already cached)...`);
  console.log("Rate: 800ms/req to stay under OneMap's ~1.3 req/s limit\n");
}

let geocoded = 0;
let noResults = 0;
let errors = 0;
let backoffs = 0;

for (let i = 0; i < toGeocode.length; i++) {
  const [key, { block, street }] = toGeocode[i];
  const result = await geocodeBlock(block, street);

  if (result === "error") {
    errors++;
    backoffs++;
    await Bun.sleep(5000);  // back off 5s on rate-limit signal
  } else {
    cache[key] = result;
    if (result === "no_results") noResults++; else geocoded++;
    await Bun.sleep(800);  // 800ms = ~1.25 req/s, just under the limit
  }

  // Progress every 25 blocks
  if ((i + 1) % 25 === 0 || i + 1 === toGeocode.length) {
    const pct = Math.round(((i + 1) / toGeocode.length) * 100);
    const eta = Math.round(((toGeocode.length - i - 1) * 800) / 60000);
    process.stdout.write(`\r  ${i + 1}/${toGeocode.length} (${pct}%) ok:${geocoded} none:${noResults} err:${errors} ~${eta}min left  `);
  }

  // Save cache every 100 blocks
  if ((i + 1) % 100 === 0) writeFileSync(CACHE_FILE, JSON.stringify(cache));
}

if (!seedOnly) {
  writeFileSync(CACHE_FILE, JSON.stringify(cache));
  const totalOk = Object.values(cache).filter((v) => v !== "no_results").length;
  const totalNone = Object.values(cache).filter((v) => v === "no_results").length;
  console.log(`\n\nGeocoding complete. ok:${totalOk} no-results:${totalNone} errors-uncached:${errors}`);
}

// ── Seed database ─────────────────────────────────────────────────────────────

const sqlite = new Database("hdb.db");
sqlite.run(`CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  month TEXT NOT NULL,
  flat_type TEXT NOT NULL,
  block TEXT NOT NULL,
  street_name TEXT NOT NULL,
  storey_min INTEGER NOT NULL,
  storey_max INTEGER NOT NULL,
  resale_price INTEGER NOT NULL,
  station_code TEXT,
  walking_minutes REAL
)`);
sqlite.run(`CREATE INDEX IF NOT EXISTS idx_filter ON transactions (station_code, flat_type, storey_min, month)`);
sqlite.run("DELETE FROM transactions");
console.log("\nSeeding database...");

function parseStorey(range: string): [number, number] {
  const m = range.match(/(\d+)\s+TO\s+(\d+)/i);
  if (!m) return [1, 3];
  return [parseInt(m[1], 10), parseInt(m[2], 10)];
}

const stmt = sqlite.prepare(
  `INSERT INTO transactions (month, flat_type, block, street_name, storey_min, storey_max, resale_price, station_code, walking_minutes)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

const insertChunk = sqlite.transaction((chunk: typeof allRows) => {
  for (const r of chunk) {
    const geo = cache[`${r.block}||${r.streetName}`];
    const geoResult = (typeof geo === "object" && geo !== null) ? geo as GeoResult : null;
    const [sMin, sMax] = parseStorey(r.storeyRange);
    stmt.run(r.month, r.flatType, r.block, r.streetName, sMin, sMax, r.resalePrice,
      geoResult?.stationCode ?? null, geoResult?.walkingMinutes ?? null);
  }
});

const CHUNK = 5000;
for (let i = 0; i < allRows.length; i += CHUNK) {
  insertChunk(allRows.slice(i, i + CHUNK));
  const pct = Math.round((Math.min(i + CHUNK, allRows.length) / allRows.length) * 100);
  process.stdout.write(`\r  Inserted ${Math.min(i + CHUNK, allRows.length).toLocaleString()}/${allRows.length.toLocaleString()} (${pct}%)  `);
}

const withStation = (sqlite.prepare("SELECT COUNT(*) as c FROM transactions WHERE station_code IS NOT NULL").get() as { c: number }).c;
console.log(`\n\nDone! hdb.db ready — ${allRows.length.toLocaleString()} rows, ${withStation.toLocaleString()} with station data.`);
sqlite.close();
