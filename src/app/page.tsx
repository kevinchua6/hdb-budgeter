"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import FilterBar, { type Filters } from "@/components/FilterBar";
import MrtMap from "@/components/MrtMap";
import StationCarousel from "@/components/StationCarousel";
import CrowdControls, { type TopStation } from "@/components/CrowdControls";
import {
  SERVICE_HOURS,
  maxHourlyLoad,
  type DayType,
  type HeatPoint,
  type TrainVolume,
} from "@/lib/trainVolume";

const DEFAULT_FILTERS: Filters = {
  flatType: "4 ROOM",
  maxWalkMin: 10,
  minFloor: 1,
  maxFloor: 999,
  months: 24,
};

type Mode = "prices" | "crowd";

export default function Home() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<Mode>("prices");
  const [volume, setVolume] = useState<TrainVolume | null>(null);
  const [dayType, setDayType] = useState<DayType>("weekday");
  const [hourIdx, setHourIdx] = useState(SERVICE_HOURS.indexOf(8));
  const [playing, setPlaying] = useState(false);

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

  // Load ridership data the first time crowd mode is opened
  useEffect(() => {
    if (mode !== "crowd" || volume) return;
    let cancelled = false;
    fetch("/train-volume.json")
      .then((r) => r.json())
      .then((data: TrainVolume) => {
        if (!cancelled) setVolume(data);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, volume]);

  useEffect(() => {
    if (!playing || mode !== "crowd") return;
    const id = setInterval(
      () => setHourIdx((i) => (i + 1) % SERVICE_HOURS.length),
      800
    );
    return () => clearInterval(id);
  }, [playing, mode]);

  const maxLoad = useMemo(() => (volume ? maxHourlyLoad(volume) : 0), [volume]);

  const heat = useMemo(() => {
    if (mode !== "crowd" || !volume || maxLoad === 0) return null;
    const hour = SERVICE_HOURS[hourIdx];
    const days = volume.dayCounts[dayType];
    const result: Record<string, HeatPoint> = {};
    for (const [code, st] of Object.entries(volume.stations)) {
      const inAvg = st[dayType].in[hour] / days;
      const outAvg = st[dayType].out[hour] / days;
      result[code] = {
        t: Math.sqrt((inAvg + outAvg) / maxLoad),
        in: Math.round(inAvg),
        out: Math.round(outAvg),
        name: st.name,
      };
    }
    return result;
  }, [mode, volume, hourIdx, dayType, maxLoad]);

  const topStations = useMemo<TopStation[]>(() => {
    if (!heat) return [];
    return Object.entries(heat)
      .map(([code, p]) => ({ code, name: p.name, total: p.in + p.out }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [heat]);

  const monthLabel = useMemo(() => {
    if (!volume) return "";
    const [year, month] = volume.yearMonth.split("-").map(Number);
    return new Date(year, month - 1).toLocaleString("en-SG", {
      month: "long",
      year: "numeric",
    });
  }, [volume]);

  return (
    <main className="flex flex-col h-screen bg-[#171827]">
      <header className="flex items-center gap-3 px-4 py-2 border-b border-white/10">
        <h1 className="text-white font-semibold text-base tracking-wide">HDB Budgeter</h1>
        {loading && mode === "prices" && (
          <span className="text-white/40 text-xs animate-pulse">Updating prices…</span>
        )}
        <div className="ml-auto flex rounded-md overflow-hidden border border-white/15 text-xs">
          {(
            [
              ["prices", "💰 Prices"],
              ["crowd", "🚇 Crowd flow"],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={
                m === mode
                  ? "px-3 py-1.5 bg-white/15 text-white font-medium"
                  : "px-3 py-1.5 text-white/50 hover:text-white/80"
              }
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {mode === "prices" && (
        <>
          <FilterBar filters={filters} onChange={setFilters} />
          <StationCarousel filters={filters} />
        </>
      )}

      <div className="flex-1 overflow-auto">
        <MrtMap prices={prices} heat={heat} />
      </div>

      {mode === "crowd" && (
        <CrowdControls
          monthLabel={monthLabel}
          loading={!volume}
          dayType={dayType}
          onDayTypeChange={setDayType}
          hourIdx={hourIdx}
          onHourIdxChange={setHourIdx}
          playing={playing}
          onPlayingChange={setPlaying}
          top={topStations}
        />
      )}
    </main>
  );
}
