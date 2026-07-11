"use client";
import { useState, useCallback, useEffect, useMemo } from "react";
import FilterBar, { type Filters } from "@/components/FilterBar";
import MrtMap from "@/components/MrtMap";
import LineView from "@/components/LineView";
import StationModal from "@/components/StationModal";
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
  minLeaseYears: 80,
};

const FLAT_TYPES = [
  "3 ROOM",
  "4 ROOM",
  "5 ROOM",
  "EXECUTIVE",
  "2 ROOM",
  "1 ROOM",
];
const WALK_OPTIONS = [5, 10, 15, 20];
const MONTH_OPTIONS = [6, 12, 24, 36, 60];
const LEASE_OPTIONS = [0, 50, 60, 70, 80];

type Phase = "landing" | "map";
type Tab = "map" | "lines" | "crowd" | "calc";

function PillButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-1 rounded-xl text-xs font-medium transition-all active:scale-95 truncate ${
        active
          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
          : "text-white/50 border border-white/10 hover:border-white/25 hover:text-white/75 hover:bg-white/5 active:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function MapIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function LinesIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="18" cy="12" r="2" />
    </svg>
  );
}

function CalcIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="10" y2="10" />
      <line x1="14" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="10" y2="14" />
      <line x1="14" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="10" y2="18" />
      <line x1="14" y1="18" x2="16" y2="18" />
    </svg>
  );
}

function CrowdIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

const NAV_ITEMS = [
  { id: "map" as Tab, label: "Map", fullLabel: "MRT Prices", Icon: MapIcon },
  { id: "lines" as Tab, label: "Lines", fullLabel: "By Line", Icon: LinesIcon },
  { id: "crowd" as Tab, label: "Crowd", fullLabel: "Crowd Flow", Icon: CrowdIcon },
  { id: "calc" as Tab, label: "Calc", fullLabel: "Calculator", Icon: CalcIcon },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("map");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [prices, setPrices] = useState<
    Record<string, { avgPrice: number; avgPsf: number | null }>
  >({});
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("landing");
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [landingAnim, setLandingAnim] = useState<"in" | "exit">("in");
  const [mapAnim, setMapAnim] = useState<"hidden" | "enter" | "in">("hidden");

  // Crowd flow tab state
  const [volume, setVolume] = useState<TrainVolume | null>(null);
  const [dayType, setDayType] = useState<DayType>("weekday");
  const [hourIdx, setHourIdx] = useState(SERVICE_HOURS.indexOf(8));
  const [playing, setPlaying] = useState(false);

  // Load ridership data the first time the crowd tab is opened
  useEffect(() => {
    if (tab !== "crowd" || volume) return;
    let cancelled = false;
    fetch("/train-volume.json")
      .then((r) => r.json())
      .then((data: TrainVolume) => {
        if (!cancelled) setVolume(data);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, volume]);

  useEffect(() => {
    if (!playing || tab !== "crowd") return;
    const id = setInterval(
      () => setHourIdx((i) => (i + 1) % SERVICE_HOURS.length),
      800,
    );
    return () => clearInterval(id);
  }, [playing, tab]);

  const maxLoad = useMemo(() => (volume ? maxHourlyLoad(volume) : 0), [volume]);

  const heat = useMemo(() => {
    if (tab !== "crowd" || !volume || maxLoad === 0) return null;
    const hour = SERVICE_HOURS[hourIdx];
    const days = volume.dayCounts[dayType];
    const result: Record<string, HeatPoint> = {};
    for (const [code, st] of Object.entries(volume.stations)) {
      const inAvg = st[dayType].in[hour] / days;
      const outAvg = st[dayType].out[hour] / days;
      result[code] = {
        // 0.75 exponent (vs sqrt) keeps quiet stations visible while leaving
        // enough dynamic range that peak hours visibly swell
        t: Math.pow((inAvg + outAvg) / maxLoad, 0.75),
        in: Math.round(inAvg),
        out: Math.round(outAvg),
        name: st.name,
      };
    }
    return result;
  }, [tab, volume, hourIdx, dayType, maxLoad]);

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

  const fetchPrices = useCallback(async (f: Filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        flatType: f.flatType,
        maxWalkMin: String(f.maxWalkMin),
        minFloor: String(f.minFloor),
        maxFloor: String(f.maxFloor),
        months: String(f.months),
        minLeaseYears: String(f.minLeaseYears),
      });
      const res = await fetch(`/api/prices?${params}`);
      if (res.ok) setPrices(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const goToMap = () => {
    fetchPrices(filters);
    setLandingAnim("exit");
    setTimeout(() => {
      setPhase("map");
      setMapAnim("enter");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setMapAnim("in")),
      );
    }, 280);
  };

  const handleFiltersChange = (f: Filters) => {
    setFilters(f);
    if (phase === "map" || tab === "lines") fetchPrices(f);
  };

  // The Lines view needs prices too; fetch them on first visit (the map's
  // landing flow may not have run yet).
  const handleTabChange = (id: Tab) => {
    setTab(id);
    if (id === "lines" && Object.keys(prices).length === 0 && !loading) {
      fetchPrices(filters);
    }
  };

  return (
    <div className="app-bg flex h-[100dvh] overflow-hidden">
      {/* Desktop sidebar */}
      <nav className="hidden sm:flex flex-col items-center py-5 w-[60px] border-r border-white/[0.07] shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 mb-6 shrink-0 shadow-[0_0_8px_3px_rgba(52,211,153,0.45)]" />
        <div className="flex flex-col gap-1 w-full px-2">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl w-full transition-all ${
                tab === id
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-white/30 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              <Icon />
              <span className="text-[9px] font-medium leading-none">
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 pb-14 sm:pb-0">
        {tab === "lines" ? (
          <main className="flex-1 flex flex-col min-h-0">
            <header className="flex items-center gap-3 px-4 py-2.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.4)]" />
                <h1 className="text-white font-semibold text-sm tracking-wide truncate">
                  Prices by line
                </h1>
                <span className="text-white/20 hidden sm:inline">·</span>
                <span className="text-white/35 text-xs hidden sm:inline truncate">
                  {filters.flatType} · ≤{filters.maxWalkMin} min walk
                </span>
              </div>
              {loading && (
                <div className="ml-auto flex items-center gap-1.5 text-white/30 text-xs shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
                  <span className="hidden sm:inline">Updating…</span>
                </div>
              )}
            </header>

            <FilterBar filters={filters} onChange={handleFiltersChange} />

            <div className="flex-1 min-h-0">
              <LineView prices={prices} onStationClick={setSelectedStation} />
            </div>
          </main>
        ) : tab === "crowd" ? (
          <main className="flex-1 flex flex-col min-h-0">
            <header className="flex items-center gap-3 px-4 py-2.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0 w-2 h-2 rounded-full bg-[#de4968] shadow-[0_0_6px_2px_rgba(222,73,104,0.4)]" />
                <h1 className="text-white font-semibold text-sm tracking-wide truncate">
                  Crowd flow
                </h1>
                <span className="text-white/20 hidden sm:inline">·</span>
                <span className="text-white/35 text-xs hidden sm:inline truncate">
                  Estimated station traffic by hour
                </span>
              </div>
            </header>

            <div className="flex-1 min-h-0">
              <MrtMap prices={prices} heat={heat} />
            </div>

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
          </main>
        ) : tab === "calc" ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
            <span className="text-white/25 text-[10px] font-semibold uppercase tracking-[0.2em] border border-white/15 rounded-full px-3 py-1">
              Work in progress
            </span>
            <h2 className="text-white/60 text-lg font-semibold">
              Calculator isn&apos;t ready yet
            </h2>
            <p className="text-white/35 text-sm max-w-xs">
              We&apos;re still building this out. Check back soon.
            </p>
          </div>
        ) : phase === "landing" ? (
          <div
            className={`flex-1 flex flex-col justify-center py-10 px-4 overflow-x-hidden transition-all duration-[280ms] ease-in-out ${
              landingAnim === "exit"
                ? "opacity-0 -translate-y-5"
                : "opacity-100 translate-y-0"
            }`}
          >
            <div className="self-center w-[min(calc(100vw-2rem),24rem)]">
              {/* Brand */}
              <div className="text-center mb-8 px-1">
                <div className="mx-auto mb-4 grid place-items-center w-12 h-12 rounded-2xl bg-gradient-to-b from-emerald-400/25 to-emerald-500/10 border border-emerald-400/30 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.6)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_3px_rgba(52,211,153,0.55)]" />
                </div>
                <h1 className="text-gradient font-semibold text-2xl tracking-tight">
                  HDB Budgeter
                </h1>
                <p className="text-white/45 text-sm leading-snug mt-1.5">
                  Singapore Resale Prices
                  <br className="sm:hidden" /> by MRT station
                </p>
              </div>

              {/* Filter card */}
              <div className="glass rounded-2xl p-5 flex flex-col gap-5">
                <div className="flex flex-col gap-2.5">
                  <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">
                    Flat type
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {FLAT_TYPES.map((t) => (
                      <PillButton
                        key={t}
                        active={filters.flatType === t}
                        onClick={() =>
                          setFilters((f) => ({ ...f, flatType: t }))
                        }
                      >
                        {t}
                      </PillButton>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">
                    Walk from MRT
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {WALK_OPTIONS.map((m) => (
                      <PillButton
                        key={m}
                        active={filters.maxWalkMin === m}
                        onClick={() =>
                          setFilters((f) => ({ ...f, maxWalkMin: m }))
                        }
                      >
                        ≤{m} min
                      </PillButton>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">
                    Data period
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {MONTH_OPTIONS.map((m) => (
                      <PillButton
                        key={m}
                        active={filters.months === m}
                        onClick={() => setFilters((f) => ({ ...f, months: m }))}
                      >
                        {m < 12 ? `${m}mo` : `${m / 12}yr`}
                      </PillButton>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">
                    Lease remaining
                  </span>
                  <div className="grid grid-cols-5 gap-2">
                    {LEASE_OPTIONS.map((y) => (
                      <PillButton
                        key={y}
                        active={filters.minLeaseYears === y}
                        onClick={() =>
                          setFilters((f) => ({ ...f, minLeaseYears: y }))
                        }
                      >
                        {y === 0 ? "Any" : `≥${y}yr`}
                      </PillButton>
                    ))}
                  </div>
                </div>

                <button
                  onClick={goToMap}
                  className="btn-primary w-full py-3.5 rounded-xl text-white font-semibold text-sm mt-1"
                >
                  View prices on map →
                </button>
              </div>
            </div>
          </div>
        ) : (
          <main
            className={`flex-1 flex flex-col min-h-0 transition-all duration-[280ms] ease-in-out ${
              mapAnim === "in"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3"
            }`}
          >
            <header className="flex items-center gap-3 px-4 py-2.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.4)]" />
                <h1 className="text-white font-semibold text-sm tracking-wide truncate">
                  HDB Budgeter
                </h1>
                <span className="text-white/20 hidden sm:inline">·</span>
                <span className="text-white/35 text-xs hidden sm:inline truncate">
                  Singapore resale prices
                </span>
              </div>
              {loading && (
                <div className="ml-auto flex items-center gap-1.5 text-white/30 text-xs shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
                  <span className="hidden sm:inline">Updating…</span>
                </div>
              )}
            </header>

            <FilterBar filters={filters} onChange={handleFiltersChange} />

            <div className="flex-1 min-h-0">
              <MrtMap prices={prices} onStationClick={setSelectedStation} />
            </div>
          </main>
        )}
      </div>

      {/* Station modal */}
      {selectedStation && (
        <StationModal
          stationCode={selectedStation}
          filters={filters}
          onClose={() => setSelectedStation(null)}
        />
      )}

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 flex h-14 bg-[#0f1020]/95 backdrop-blur-sm border-t border-white/[0.07] z-50">
        {NAV_ITEMS.map(({ id, fullLabel, Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${
              tab === id ? "text-emerald-300" : "text-white/30"
            }`}
          >
            <Icon />
            <span className="text-[10px] font-medium">{fullLabel}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
