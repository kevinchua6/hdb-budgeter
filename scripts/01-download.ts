// Downloads the latest HDB resale flat transaction CSV from data.gov.sg
// Usage: bun scripts/01-download.ts
import { writeFileSync, mkdirSync } from "fs";

const DATASET_ID = "d_8b84c4ee58e3cfc0ece0d773c8ca6abc";
const BASE = "https://api-production.data.gov.sg/v2/public/api/datasets";

mkdirSync("data", { recursive: true });

// Try to initiate a download and get the URL
async function getDownloadUrl(): Promise<string> {
  // Try GET first (some data.gov.sg endpoints use GET)
  for (const method of ["GET", "POST"] as const) {
    const res = await fetch(`${BASE}/${DATASET_ID}/poll-download`, {
      method,
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      console.log(`  ${method} poll-download → ${res.status}`);
      continue;
    }
    const body = await res.json() as {
      data?: { url?: string; downloadUrl?: string };
      code?: string;
    };
    const url = body.data?.url ?? body.data?.downloadUrl;
    if (url) return url;
    console.log("  Response body:", JSON.stringify(body).slice(0, 200));
  }

  // Fallback: try the dataset metadata endpoint to find a resource URL
  console.log("Trying dataset metadata endpoint...");
  const meta = await fetch(`${BASE}/${DATASET_ID}`);
  if (meta.ok) {
    const body = await meta.json() as { data?: Record<string, unknown> };
    console.log("Metadata:", JSON.stringify(body).slice(0, 500));
  }

  throw new Error("Could not obtain download URL from data.gov.sg. Check the dataset ID or API docs.");
}

console.log("Fetching download URL from data.gov.sg...");
const downloadUrl = await getDownloadUrl();
console.log("Downloading from:", downloadUrl);

const csvRes = await fetch(downloadUrl);
if (!csvRes.ok) throw new Error(`Download failed: ${csvRes.status}`);
const csv = await csvRes.text();
writeFileSync("data/hdb-resale.csv", csv);
console.log(`Saved ${csv.length.toLocaleString()} bytes to data/hdb-resale.csv`);
