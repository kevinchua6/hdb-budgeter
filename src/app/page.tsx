"use client";
import { useState, useCallback } from "react";
import FilterBar, { type Filters } from "@/components/FilterBar";
import MrtMap from "@/components/MrtMap";
import LineView from "@/components/LineView";
import StationModal from "@/components/StationModal";
import { STATION_GROUPS } from "@/lib/stations";
import {
  flatTypeLabel,
  walkLabel,
  leaseLabel,
  monthsLabel,
} from "@/lib/filterLabels";

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

const NAV_ITEMS = [
  { id: "map" as Tab, label: "Map", Icon: MapIcon },
  { id: "lines" as Tab, label: "Lines", Icon: LinesIcon },
];

// Desktop-only inline view switcher, styled to match the mobile floating
// pill — sits in its own row below the filters on the map view, and to the
// left of the line selector on the lines view.
function ViewSwitcher({
  tab,
  onTabChange,
}: {
  tab: Tab;
  onTabChange: (id: Tab) => void;
}) {
  return (
    <div className="hidden sm:flex items-center gap-1 shrink-0 bg-white rounded-full shadow-sm border border-black/[0.06] p-1">
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            tab === id ? "bg-red-500/15 text-red-700" : "text-black/40 hover:text-black/60"
          }`}
        >
          <Icon />
          {label}
        </button>
      ))}
    </div>
  );
}

// Desktop-only price mode toggle, styled to match the mobile floating pill —
// shares a row with ViewSwitcher on both the map and lines views.
function PriceToggle({
  priceMode,
  onPriceModeChange,
}: {
  priceMode: "total" | "psf";
  onPriceModeChange: (mode: "total" | "psf") => void;
}) {
  return (
    <div className="hidden sm:flex items-center gap-0.5 shrink-0 bg-white rounded-full shadow-sm border border-black/[0.06] p-1">
      <button
        onClick={() => onPriceModeChange("total")}
        className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
          priceMode === "total" ? "bg-red-500/15 text-red-700" : "text-black/40 hover:text-black/60"
        }`}
      >
        Total
      </button>
      <button
        onClick={() => onPriceModeChange("psf")}
        className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
          priceMode === "psf" ? "bg-red-500/15 text-red-700" : "text-black/40 hover:text-black/60"
        }`}
      >
        PSF
      </button>
    </div>
  );
}

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
  const [commuteOrigin, setCommuteOrigin] = useState<string | null>(null);
  const [commuteMaxStops, setCommuteMaxStops] = useState(5);
  const [priceMode, setPriceMode] = useState<"total" | "psf">("total");

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
      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Shared switcher + price toggle row (desktop) — sits above the
            filters column on every view except the initial landing screen,
            which has its own pinned CTA in that spot. */}
        {!(tab === "map" && phase === "landing") && (
          <div className="hidden sm:flex items-center justify-between px-4 py-2 border-b border-black/[0.07] shrink-0">
            <ViewSwitcher tab={tab} onTabChange={handleTabChange} />
            <PriceToggle priceMode={priceMode} onPriceModeChange={setPriceMode} />
          </div>
        )}

        {tab === "lines" ? (
          <main className="flex-1 flex min-h-0">
            <FilterBar
              filters={filters}
              onChange={handleFiltersChange}
              commuteOrigin={commuteOrigin}
              onCommuteOriginChange={setCommuteOrigin}
              commuteMaxStops={commuteMaxStops}
              onCommuteMaxStopsChange={setCommuteMaxStops}
            />

            <div className="flex-1 min-h-0 min-w-0">
              <LineView
                prices={prices}
                onStationClick={setSelectedStation}
                priceMode={priceMode}
              />
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
            className={`flex-1 flex flex-col min-h-0 transition-all duration-[280ms] ease-in-out ${
              landingAnim === "exit"
                ? "opacity-0 -translate-y-5"
                : "opacity-100 translate-y-0"
            }`}
          >
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pt-12 px-5">
            <div className="self-center w-[min(calc(100vw-2rem),26rem)] flex flex-col gap-7 pb-6 mx-auto">
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
                <span className="text-black font-bold text-base">Floor</span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={filters.maxFloor}
                    value={filters.minFloor}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        minFloor: Math.max(1, parseInt(e.target.value) || 1),
                      }))
                    }
                    className="w-24 bg-white border-2 border-black/15 rounded-full px-4 py-3 text-black text-sm text-center focus:outline-none focus:border-black transition-all"
                  />
                  <span className="text-black/40 text-sm select-none">—</span>
                  <input
                    type="number"
                    min={filters.minFloor}
                    value={filters.maxFloor >= 999 ? "" : filters.maxFloor}
                    placeholder="any"
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setFilters((f) => ({
                        ...f,
                        maxFloor: isNaN(v) ? 999 : Math.max(f.minFloor, v),
                      }));
                    }}
                    className="w-24 bg-white border-2 border-black/15 rounded-full px-4 py-3 text-black text-sm text-center placeholder:text-black/30 focus:outline-none focus:border-black transition-all"
                  />
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

              <div className="flex flex-col gap-3">
                <span className="text-black font-bold text-base">Commute from</span>
                <select
                  value={commuteOrigin ?? ""}
                  onChange={(e) => setCommuteOrigin(e.target.value || null)}
                  className="w-full bg-white border-2 border-black/15 rounded-full px-5 py-3 text-black text-sm font-medium focus:outline-none focus:border-black transition-all cursor-pointer"
                >
                  <option value="">Any station</option>
                  {STATION_GROUPS.map((g) => (
                    <option key={g.name} value={g.name}>
                      {g.name}
                    </option>
                  ))}
                </select>
                {commuteOrigin && (
                  <div className="flex items-center gap-2">
                    <span className="text-black/50 text-sm">Within</span>
                    <button
                      onClick={() =>
                        setCommuteMaxStops((s) => Math.max(1, s - 1))
                      }
                      className="w-9 h-9 rounded-full border-2 border-black/15 bg-white text-black text-base flex items-center justify-center active:scale-90 transition-all"
                    >
                      −
                    </button>
                    <span className="text-black font-bold text-base w-6 text-center tabular-nums">
                      {commuteMaxStops}
                    </span>
                    <button
                      onClick={() =>
                        setCommuteMaxStops((s) => Math.min(30, s + 1))
                      }
                      className="w-9 h-9 rounded-full border-2 border-black/15 bg-white text-black text-base flex items-center justify-center active:scale-90 transition-all"
                    >
                      +
                    </button>
                    <span className="text-black/50 text-sm">stops</span>
                  </div>
                )}
              </div>
            </div>
            </div>

            <div className="shrink-0 px-5 pb-6 pt-3">
              <button
                onClick={goToMap}
                className="w-[min(calc(100vw-2rem),26rem)] mx-auto block btn-primary py-4 rounded-full text-white font-semibold text-sm"
              >
                See prices on map
              </button>
            </div>
          </div>
        ) : (
          <main
            className={`flex-1 flex min-h-0 transition-all duration-[280ms] ease-in-out ${
              mapAnim === "in"
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3"
            }`}
          >
            <FilterBar
              filters={filters}
              onChange={handleFiltersChange}
              commuteOrigin={commuteOrigin}
              onCommuteOriginChange={setCommuteOrigin}
              commuteMaxStops={commuteMaxStops}
              onCommuteMaxStopsChange={setCommuteMaxStops}
            />

            <div className="flex-1 min-h-0 min-w-0">
              <MrtMap
                prices={prices}
                onStationClick={setSelectedStation}
                commuteOrigin={commuteOrigin}
                commuteMaxStops={commuteMaxStops}
                priceMode={priceMode}
              />
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

      {/* Mobile: view switcher + price mode toggle, floating bottom-left —
          desktop has its own inline instances below the filters (map) and
          beside the line selector (lines). Hidden on the initial
          landing/filter screen, which has its own pinned CTA in that spot */}
      {!(tab === "map" && phase === "landing") && (
        <div className="sm:hidden fixed bottom-4 left-4 z-50 flex items-center gap-2">
          <nav className="bg-white rounded-full shadow-lg border border-black/[0.06] p-1 flex items-center gap-1">
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all active:scale-95 ${
                  tab === id ? "bg-red-500/15 text-red-700" : "text-black/40 hover:text-black/60"
                }`}
              >
                <Icon />
                {label}
              </button>
            ))}
          </nav>

          <div className="bg-white rounded-full shadow-lg border border-black/[0.06] p-1 flex items-center gap-0.5">
            <button
              onClick={() => setPriceMode("total")}
              className={`px-2.5 py-2 rounded-full text-xs font-medium transition-all active:scale-95 ${
                priceMode === "total" ? "bg-red-500/15 text-red-700" : "text-black/40 hover:text-black/60"
              }`}
            >
              Total
            </button>
            <button
              onClick={() => setPriceMode("psf")}
              className={`px-2.5 py-2 rounded-full text-xs font-medium transition-all active:scale-95 ${
                priceMode === "psf" ? "bg-red-500/15 text-red-700" : "text-black/40 hover:text-black/60"
              }`}
            >
              PSF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
