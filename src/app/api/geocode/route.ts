import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q) return NextResponse.json({ error: "no query" }, { status: 400 });

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(q + ", Singapore")}` +
    `&format=json&limit=1&countrycodes=sg`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "hdb-budgeter/1.0" },
      signal: AbortSignal.timeout(6000),
    });
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (data.length > 0) {
      return NextResponse.json({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
    }
    return NextResponse.json({ error: "not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "geocoding failed" }, { status: 500 });
  }
}
