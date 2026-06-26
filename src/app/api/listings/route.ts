import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { and, eq, gte, lte, inArray, desc } from "drizzle-orm";
import { STATIONS } from "@/lib/stations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const stationCode = p.get("stationCode") ?? "";
  const flatType    = p.get("flatType")    ?? "4 ROOM";
  const maxWalkMin  = Number(p.get("maxWalkMin") ?? 10);
  const minFloor    = Number(p.get("minFloor")   ?? 1);
  const maxFloor    = Number(p.get("maxFloor")   ?? 999);
  const months      = Number(p.get("months")     ?? 24);

  const station = STATIONS.find((s) => s.code === stationCode);
  const siblings = station
    ? STATIONS.filter((s) => s.lat === station.lat && s.lng === station.lng).map((s) => s.code)
    : stationCode ? [stationCode] : [];

  if (siblings.length === 0) {
    return NextResponse.json({ station: null, listings: [] });
  }

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}`;

  try {
    const rows = await db
      .select({
        block:          transactions.block,
        streetName:     transactions.streetName,
        storeyMin:      transactions.storeyMin,
        storeyMax:      transactions.storeyMax,
        resalePrice:    transactions.resalePrice,
        walkingMinutes: transactions.walkingMinutes,
        month:          transactions.month,
      })
      .from(transactions)
      .where(
        and(
          inArray(transactions.stationCode, siblings),
          eq(transactions.flatType, flatType),
          lte(transactions.walkingMinutes, maxWalkMin),
          gte(transactions.storeyMin, minFloor),
          lte(transactions.storeyMax, maxFloor),
          gte(transactions.month, cutoffStr)
        )
      )
      .orderBy(desc(transactions.month))
      .limit(5);

    return NextResponse.json({
      station: station
        ? { code: stationCode, name: station.name, lat: station.lat, lng: station.lng }
        : null,
      listings: rows,
    });
  } catch {
    return NextResponse.json({ station: null, listings: [] });
  }
}
