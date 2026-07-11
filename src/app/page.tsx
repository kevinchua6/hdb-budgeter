"use client";
import { useState, useCallback } from "react";
import FilterBar, { type Filters } from "@/components/FilterBar";
import MrtMap from "@/components/MrtMap";
import LineView from "@/components/LineView";
import StationModal from "@/components/StationModal";

const DEFAULT_FILTERS: Filters = {
  flatType: "4 ROOM",
  maxWalkMin: 10,
  minFloor: 1,
  maxFloor: 999,
  months: 24,
  minLeaseYears: 80,
};

const FLAT_TYPES = [
  "1 ROOM",
  "2 ROOM",
  "3 ROOM",
  "4 ROOM",
  "5 ROOM",
  "EXECUTIVE",
];
const WALK_OPTIONS = [5, 10, 15, 20];
const MONTH_OPTIONS = [6, 12, 24, 36, 60];
const LEASE_OPTIONS = [0, 50, 60, 70, 80];

function flatTypeLabel(t: string) {
  return t.charAt(0) + t.slice(1).toLowerCase();
}
function walkLabel(m: number) {
  return `${m} mins`;
}
function leaseLabel(y: number) {
  return y === 0 ? "Any" : `${y} years`;
}
function monthsLabel(m: number) {
  if (m < 12) return `${m} months`;
  const y = m / 12;
  return `${y} year${y > 1 ? "s" : ""}`;
}

type Phase = "landing" | "map";
type Tab = "map" | "lines" | "calc";

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
      className={`px-5 py-3 rounded-full text-sm font-medium transition-all active:scale-95 border-2 whitespace-nowrap ${
        active
          ? "bg-white text-black border-black"
          : "bg-white text-black/60 border-black/15 hover:border-black/30 hover:text-black/80"
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

const NAV_ITEMS = [
  { id: "map" as Tab, label: "Map", fullLabel: "MRT Prices", Icon: MapIcon },
  { id: "lines" as Tab, label: "Lines", fullLabel: "By Line", Icon: LinesIcon },
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
      <nav className="hidden sm:flex flex-col items-center py-5 w-[60px] border-r border-black/[0.07] shrink-0">
        <span className="w-2 h-2 rounded-full bg-red-400 mb-6 shrink-0 shadow-[0_0_8px_3px_rgba(192,69,58,0.45)]" />
        <div className="flex flex-col gap-1 w-full px-2">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl w-full transition-all ${
                tab === id
                  ? "bg-red-500/15 text-red-700"
                  : "text-black/30 hover:text-black/60 hover:bg-black/5"
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
            <header className="flex items-center gap-3 px-4 py-2.5 border-b border-black/10 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0 w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_2px_rgba(192,69,58,0.4)]" />
                <h1 className="text-black font-semibold text-sm tracking-wide truncate">
                  Prices by line
                </h1>
                <span className="text-black/20 hidden sm:inline">·</span>
                <span className="text-black/35 text-xs hidden sm:inline truncate">
                  {filters.flatType} · ≤{filters.maxWalkMin} min walk
                </span>
              </div>
              {loading && (
                <div className="ml-auto flex items-center gap-1.5 text-black/30 text-xs shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 animate-pulse" />
                  <span className="hidden sm:inline">Updating…</span>
                </div>
              )}
            </header>

            <FilterBar filters={filters} onChange={handleFiltersChange} />

            <div className="flex-1 min-h-0">
              <LineView prices={prices} onStationClick={setSelectedStation} />
            </div>
          </main>
        ) : tab === "calc" ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
            <span className="text-black/25 text-[10px] font-semibold uppercase tracking-[0.2em] border border-black/15 rounded-full px-3 py-1">
              Work in progress
            </span>
            <h2 className="text-black/60 text-lg font-semibold">
              Calculator isn&apos;t ready yet
            </h2>
            <p className="text-black/35 text-sm max-w-xs">
              We&apos;re still building this out. Check back soon.
            </p>
          </div>
        ) : phase === "landing" ? (
          <div
            className={`flex-1 flex flex-col justify-start overflow-y-auto overflow-x-hidden pt-12 pb-10 px-5 transition-all duration-[280ms] ease-in-out ${
              landingAnim === "exit"
                ? "opacity-0 -translate-y-5"
                : "opacity-100 translate-y-0"
            }`}
          >
            <div className="self-center w-[min(calc(100vw-2rem),26rem)] flex flex-col gap-7">
              <h1 className="text-black font-bold text-3xl leading-tight tracking-tight">
                Find HDB resale prices near any MRT
              </h1>

              <div className="flex flex-col gap-3">
                <span className="text-black font-bold text-base">Flat type</span>
                <div className="flex flex-wrap gap-2">
                  {FLAT_TYPES.map((t) => (
                    <PillButton
                      key={t}
                      active={filters.flatType === t}
                      onClick={() =>
                        setFilters((f) => ({ ...f, flatType: t }))
                      }
                    >
                      {flatTypeLabel(t)}
                    </PillButton>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-black font-bold text-base">Walk from MRT</span>
                <div className="flex flex-wrap gap-2">
                  {WALK_OPTIONS.map((m) => (
                    <PillButton
                      key={m}
                      active={filters.maxWalkMin === m}
                      onClick={() =>
                        setFilters((f) => ({ ...f, maxWalkMin: m }))
                      }
                    >
                      {walkLabel(m)}
                    </PillButton>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-black font-bold text-base">Lease left</span>
                <div className="flex flex-wrap gap-2">
                  {LEASE_OPTIONS.map((y) => (
                    <PillButton
                      key={y}
                      active={filters.minLeaseYears === y}
                      onClick={() =>
                        setFilters((f) => ({ ...f, minLeaseYears: y }))
                      }
                    >
                      {leaseLabel(y)}
                    </PillButton>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-black font-bold text-base">Based on sales from</span>
                <div className="flex flex-wrap gap-2">
                  {MONTH_OPTIONS.map((m) => (
                    <PillButton
                      key={m}
                      active={filters.months === m}
                      onClick={() => setFilters((f) => ({ ...f, months: m }))}
                    >
                      {monthsLabel(m)}
                    </PillButton>
                  ))}
                </div>
              </div>

              <button
                onClick={goToMap}
                className="btn-primary w-full py-4 rounded-full text-white font-semibold text-sm mt-1"
              >
                See prices on map
              </button>
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
            <header className="flex items-center gap-3 px-4 py-2.5 border-b border-black/10 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0 w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_2px_rgba(192,69,58,0.4)]" />
                <h1 className="text-black font-semibold text-sm tracking-wide truncate">
                  HDB Budgeter
                </h1>
                <span className="text-black/20 hidden sm:inline">·</span>
                <span className="text-black/35 text-xs hidden sm:inline truncate">
                  Singapore resale prices
                </span>
              </div>
              {loading && (
                <div className="ml-auto flex items-center gap-1.5 text-black/30 text-xs shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 animate-pulse" />
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
      <nav className="sm:hidden fixed bottom-0 inset-x-0 flex h-14 bg-white/95 backdrop-blur-sm border-t border-black/[0.07] z-50">
        {NAV_ITEMS.map(({ id, fullLabel, Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${
              tab === id ? "text-red-700" : "text-black/30"
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
