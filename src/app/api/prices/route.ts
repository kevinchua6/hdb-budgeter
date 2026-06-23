import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { transactions } from "@/lib/schema";
import { and, eq, gte, lte, isNotNull, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const flatType     = p.get("flatType")   ?? "4 ROOM";
  const maxWalkMin   = Number(p.get("maxWalkMin")  ?? 10);
  const minFloor     = Number(p.get("minFloor")    ?? 1);
  const maxFloor     = Number(p.get("maxFloor")    ?? 999);
  const months       = Number(p.get("months")      ?? 24);

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}`;

  try {
    const rows = await db
      .select({
        stationCode: transactions.stationCode,
        avgPrice: sql<number>`AVG(${transactions.resalePrice})`,
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
          isNotNull(transactions.stationCode)
        )
      )
      .groupBy(transactions.stationCode)
      .having(sql`COUNT(*) >= 3`);

    const result: Record<string, number> = {};
    for (const r of rows) {
      if (r.stationCode) result[r.stationCode] = Math.round(r.avgPrice);
    }

    return NextResponse.json(result);
  } catch {
    // DB not seeded yet — return empty
    return NextResponse.json({});
  }
}
