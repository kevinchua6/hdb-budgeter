import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { and, eq, gte, lte, isNotNull, sql, isNull, or } from "drizzle-orm";
import { STATIONS } from "@/lib/stations";
import { SQM_TO_SQFT } from "@/lib/psf";

// Map each station code → all codes at the same physical location
const siblings = new Map<string, string[]>();
for (const s of STATIONS) {
  const group = STATIONS.filter((o) => o.lat === s.lat && o.lng === s.lng).map((o) => o.code);
  siblings.set(s.code, group);
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const flatType      = p.get("flatType")      ?? "4 ROOM";
  const maxWalkMin    = Number(p.get("maxWalkMin")   ?? 10);
  const minFloor      = Number(p.get("minFloor")     ?? 1);
  const maxFloor      = Number(p.get("maxFloor")     ?? 999);
  const months        = Number(p.get("months")       ?? 24);
  const minLeaseYears = Number(p.get("minLeaseYears") ?? 0);

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}`;
  const currentYear = new Date().getFullYear();
  const minLcd = minLeaseYears > 0 ? currentYear - 99 + minLeaseYears : null;

  try {
    const rows = await db
      .select({
        stationCode: transactions.stationCode,
        avgPrice: sql<number>`AVG(${transactions.resalePrice})`,
        avgPsf: sql<number | null>`AVG(${transactions.resalePrice} / (${transactions.floorAreaSqm} * ${SQM_TO_SQFT}))`,
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.flatType, flatType),
          lte(transactions.walkingMinutes, maxWalkMin),
          gte(transactions.storeyMin, minFloor),
          lte(transactions.storeyMax, maxFloor),
          gte(transactions.month, cutoffStr),
          isNotNull(transactions.stationCode),
          minLcd != null
            ? gte(transactions.leaseCommenceDate, minLcd)
            : undefined
        )
      )
      .groupBy(transactions.stationCode)
      .having(sql`COUNT(*) >= 3`);

    const result: Record<string, { avgPrice: number; avgPsf: number | null }> = {};
    for (const r of rows) {
      if (!r.stationCode) continue;
      const entry = {
        avgPrice: Math.round(r.avgPrice),
        avgPsf: r.avgPsf != null ? Math.round(r.avgPsf) : null,
      };
      result[r.stationCode] = entry;
      for (const sib of siblings.get(r.stationCode) ?? []) {
        result[sib] = entry;
      }
    }

    return NextResponse.json(result);
  } catch {
    // DB not seeded yet — return empty
    return NextResponse.json({});
  }
}
