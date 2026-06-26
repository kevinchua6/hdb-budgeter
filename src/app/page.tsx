"use client";
import { useState, useCallback } from "react";
import FilterBar, { type Filters } from "@/components/FilterBar";
import MrtMap from "@/components/MrtMap";
import Calculator from "@/components/Calculator";
import StationModal from "@/components/StationModal";

const DEFAULT_FILTERS: Filters = {
  flatType: "4 ROOM",
  maxWalkMin: 10,
  minFloor: 1,
  maxFloor: 999,
  months: 24,
};

const FLAT_TYPES = ["3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE", "2 ROOM", "1 ROOM"];
const WALK_OPTIONS = [5, 10, 15, 20];
const MONTH_OPTIONS = [6, 12, 24, 36, 60];

type Phase = "landing" | "map";
type Tab = "map" | "calc";

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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CalcIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  { id: "calc" as Tab, label: "Calc", fullLabel: "Calculator", Icon: CalcIcon },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("map");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [prices, setPrices] = useState<Record<string, number>>({});
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
      requestAnimationFrame(() => requestAnimationFrame(() => setMapAnim("in")));
    }, 280);
  };

  const goToLanding = () => {
    setMapAnim("enter");
    setTimeout(() => {
      setPhase("landing");
      setLandingAnim("in");
    }, 200);
  };

  const handleFiltersChange = (f: Filters) => {
    setFilters(f);
    if (phase === "map") fetchPrices(f);
  };

  return (
    <div className="flex h-[100dvh] bg-[#171827] overflow-hidden">

      {/* Desktop sidebar */}
      <nav className="hidden sm:flex flex-col items-center py-5 w-[60px] border-r border-white/[0.07] shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 mb-6 shrink-0 shadow-[0_0_8px_3px_rgba(52,211,153,0.45)]" />
        <div className="flex flex-col gap-1 w-full px-2">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl w-full transition-all ${
                tab === id
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-white/30 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              <Icon />
              <span className="text-[9px] font-medium leading-none">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 pb-14 sm:pb-0">

        {tab === "calc" ? (
          <Calculator />
        ) : phase === "landing" ? (
          <div
            className={`flex-1 flex flex-col justify-center py-10 px-4 overflow-x-hidden transition-all duration-[280ms] ease-in-out ${
              landingAnim === "exit" ? "opacity-0 -translate-y-5" : "opacity-100 translate-y-0"
            }`}
          >
            <div className="self-center w-[min(calc(100vw-2rem),24rem)]">

              {/* Brand */}
              <div className="text-center mb-8 px-1">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_3px_rgba(52,211,153,0.45)]" />
                  <h1 className="text-white font-semibold text-xl tracking-wide">HDB Budgeter</h1>
                </div>
                <p className="text-white/40 text-sm leading-snug">
                  Singapore resale prices
                  <br className="sm:hidden" /> by MRT station
                </p>
              </div>

              {/* Filter card */}
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex flex-col gap-5">

                <div className="flex flex-col gap-2.5">
                  <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Flat type</span>
                  <div className="grid grid-cols-3 gap-2">
                    {FLAT_TYPES.map((t) => (
                      <PillButton key={t} active={filters.flatType === t} onClick={() => setFilters(f => ({ ...f, flatType: t }))}>
                        {t}
                      </PillButton>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Walk from MRT</span>
                  <div className="grid grid-cols-4 gap-2">
                    {WALK_OPTIONS.map((m) => (
                      <PillButton key={m} active={filters.maxWalkMin === m} onClick={() => setFilters(f => ({ ...f, maxWalkMin: m }))}>
                        ≤{m}m
                      </PillButton>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Data period</span>
                  <div className="grid grid-cols-5 gap-2">
                    {MONTH_OPTIONS.map((m) => (
                      <PillButton key={m} active={filters.months === m} onClick={() => setFilters(f => ({ ...f, months: m }))}>
                        {m < 12 ? `${m}mo` : `${m / 12}yr`}
                      </PillButton>
                    ))}
                  </div>
                </div>

                <button
                  onClick={goToMap}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.97] text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 mt-1"
                >
                  View prices on map →
                </button>

              </div>
            </div>
          </div>
        ) : (
          <main
            className={`flex-1 flex flex-col transition-all duration-[280ms] ease-in-out ${
              mapAnim === "in" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            <header className="flex items-center gap-3 px-4 py-2.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.4)]" />
                <h1 className="text-white font-semibold text-sm tracking-wide truncate">HDB Budgeter</h1>
                <span className="text-white/20 hidden sm:inline">·</span>
                <span className="text-white/35 text-xs hidden sm:inline truncate">Singapore resale prices</span>
              </div>
              <div className="ml-auto flex items-center gap-3 shrink-0">
                {loading && (
                  <div className="flex items-center gap-1.5 text-white/30 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
                    <span className="hidden sm:inline">Updating…</span>
                  </div>
                )}
                <button
                  onClick={goToLanding}
                  className="text-white/35 hover:text-white/65 text-xs transition-colors py-1 px-2 -mr-1 rounded-lg hover:bg-white/5"
                >
                  ← Edit
                </button>
              </div>
            </header>

            <FilterBar filters={filters} onChange={handleFiltersChange} />

            <div className="flex-1 overflow-auto overscroll-contain map-touch-scroll">
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
            onClick={() => setTab(id)}
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
