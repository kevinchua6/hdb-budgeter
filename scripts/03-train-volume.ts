// Aggregates LTA train tap-in/tap-out volumes (data/pv_train/*.csv) into
// public/train-volume.json, keyed by the station codes present on the map.
//
// The CSV keys interchanges as combined codes ("EW16/NE3/TE17") while
// public/mrt-map.html carries exactly one code per physical station, so each
// row's volume is assigned to the first constituent code found on the map.
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

interface HourlyVolume {
  in: number[]; // 24 slots, index = hour of day, monthly totals
  out: number[];
}

interface StationVolume {
  name: string;
  weekday: HourlyVolume;
  weekend: HourlyVolume;
}

const DATA_DIR = "data/pv_train";

// --- Load CSV rows (latest YEAR_MONTH wins if multiple files/months) ---
const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".csv"));
if (files.length === 0) throw new Error(`No CSV files in ${DATA_DIR}`);

interface Row {
  yearMonth: string;
  dayType: string;
  hour: number;
  code: string;
  tapIn: number;
  tapOut: number;
}

const rows: Row[] = [];
for (const file of files) {
  const lines = readFileSync(join(DATA_DIR, file), "utf-8").trim().split(/\r?\n/);
  const header = lines[0].split(",");
  const col = (name: string) => {
    const i = header.indexOf(name);
    if (i === -1) throw new Error(`Missing column ${name} in ${file}`);
    return i;
  };
  const [iYm, iDay, iHour, iType, iCode, iIn, iOut] = [
    col("YEAR_MONTH"), col("DAY_TYPE"), col("TIME_PER_HOUR"),
    col("PT_TYPE"), col("PT_CODE"), col("TOTAL_TAP_IN_VOLUME"), col("TOTAL_TAP_OUT_VOLUME"),
  ];
  for (let l = 1; l < lines.length; l++) {
    const c = lines[l].split(",");
    if (c[iType] !== "TRAIN") continue;
    rows.push({
      yearMonth: c[iYm],
      dayType: c[iDay],
      hour: Number(c[iHour]),
      code: c[iCode],
      tapIn: Number(c[iIn]),
      tapOut: Number(c[iOut]),
    });
  }
}

const yearMonth = rows.map((r) => r.yearMonth).sort().at(-1)!;
const monthRows = rows.filter((r) => r.yearMonth === yearMonth);

// --- Station codes + names as they appear on the map ---
const mapHtml = readFileSync("public/mrt-map.html", "utf-8");
const mapCodes = new Set<string>();
const mapNames = new Map<string, string>();
for (const m of mapHtml.matchAll(
  /data-station-code="([^"]+)"[^>]*>.*?h2 class='h6'&gt;([^&]+)&lt;\/h2&gt;/g
)) {
  mapCodes.add(m[1]);
  if (!mapNames.has(m[1])) mapNames.set(m[1], m[2].trim());
}

// --- Day counts for the month; public holidays are counted as weekdays here
// even though LTA buckets them under WEEKENDS/HOLIDAY, so weekday averages
// skew slightly low in holiday months ---
const [year, month] = yearMonth.split("-").map(Number);
const daysInMonth = new Date(year, month, 0).getDate();
let weekdayCount = 0;
let weekendCount = 0;
for (let d = 1; d <= daysInMonth; d++) {
  const dow = new Date(year, month - 1, d).getDay();
  if (dow === 0 || dow === 6) weekendCount++;
  else weekdayCount++;
}

// --- Aggregate ---
const stations: Record<string, StationVolume> = {};
const unmatched = new Set<string>();

// LTA reports Stevens' TEL platforms as a bare "TE11" instead of the usual
// combined interchange code; the map keys Stevens as DT10.
const CODE_ALIASES: Record<string, string> = { TE11: "DT10" };

for (const row of monthRows) {
  const mapCode = row.code
    .split("/")
    .map((c) => CODE_ALIASES[c] ?? c)
    .find((c) => mapCodes.has(c));
  if (!mapCode) {
    unmatched.add(row.code);
    continue;
  }
  let st = stations[mapCode];
  if (!st) {
    st = stations[mapCode] = {
      name: mapNames.get(mapCode) ?? mapCode,
      weekday: { in: new Array(24).fill(0), out: new Array(24).fill(0) },
      weekend: { in: new Array(24).fill(0), out: new Array(24).fill(0) },
    };
  }
  const bucket = row.dayType === "WEEKDAY" ? st.weekday : st.weekend;
  bucket.in[row.hour] += row.tapIn;
  bucket.out[row.hour] += row.tapOut;
}

const output = {
  yearMonth,
  dayCounts: { weekday: weekdayCount, weekend: weekendCount },
  stations,
};

writeFileSync("public/train-volume.json", JSON.stringify(output));

console.log(`Generated public/train-volume.json for ${yearMonth}`);
console.log(`  ${Object.keys(stations).length} stations matched to map codes`);
console.log(`  day counts: ${weekdayCount} weekdays, ${weekendCount} weekend days`);
if (unmatched.size > 0) {
  console.log(`  unmatched PT_CODEs (${unmatched.size}): ${[...unmatched].join(", ")}`);
}
