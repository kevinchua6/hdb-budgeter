"use client";
import { useEffect, useState } from "react";
import type { Filters } from "./FilterBar";
import { STATIONS } from "@/lib/stations";

const EW_STATIONS = STATIONS.filter((s) => s.code.startsWith("EW"));

interface Props {
  filters: Filters;
}

export default function StationCarousel({ filters }: Props) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({
      flatType: "2 ROOM",
      maxWalkMin: String(filters.maxWalkMin),
      minFloor: String(filters.minFloor),
      maxFloor: String(filters.maxFloor),
      months: String(filters.months),
    });
    setLoading(true);
    fetch(`/api/prices?${params}`)
      .then((r) => r.json())
      .then((data) => setPrices(data))
      .finally(() => setLoading(false));
  }, [filters.maxWalkMin, filters.minFloor, filters.maxFloor, filters.months]);

  return (
    <div className="px-4 py-3 border-b border-white/10">
      <div className="text-white/60 text-xs uppercase tracking-wide mb-2">
        2 Room · EW Line
        {loading && <span className="ml-2 animate-pulse">updating…</span>}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.2) transparent" }}>
        {EW_STATIONS.map((s) => {
          const price = prices[s.code];
          return (
            <div
              key={s.code}
              className="flex-shrink-0 flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 min-w-[76px]"
            >
              <span className="text-white/40 text-[10px]">{s.code}</span>
              <span className="text-white text-[11px] font-medium text-center leading-tight">{s.name}</span>
              <span className="text-green-400 text-xs font-semibold">
                {price != null ? `$${Math.round(price / 1000)}k` : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
