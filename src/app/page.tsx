"use client";
import { useState, useEffect, useCallback } from "react";
import FilterBar, { type Filters } from "@/components/FilterBar";
import MrtMap from "@/components/MrtMap";

const DEFAULT_FILTERS: Filters = {
  flatType: "4 ROOM",
  maxWalkMin: 10,
  minFloor: 1,
  maxFloor: 999,
  months: 24,
};

export default function Home() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const fetchPrices = useCallback(async (f: Filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        flatType: f.flatType,
        maxWalkMin: String(f.maxWalkMin),
        minFloor: String(f.minFloor),
        maxFloor: String(f.maxFloor),
        months: String(f.months),
      });
      const res = await fetch(`/api/prices?${params}`);
      if (res.ok) setPrices(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices(filters);
  }, [filters, fetchPrices]);

  return (
    <main className="flex flex-col h-screen bg-[#171827]">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-white/10">
        <h1 className="text-white font-semibold text-base tracking-wide">HDB Budgeter</h1>
        {loading && (
          <span className="text-white/40 text-xs animate-pulse">Updating prices…</span>
        )}
      </header>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="flex-1 overflow-auto">
        <MrtMap prices={prices} />
      </div>
    </main>
  );
}
