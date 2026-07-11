"use client";
import { useRef, useState } from "react";
import { LINES, STATION_NAME, STATION_GROUPS } from "@/lib/stations";

interface Props {
  prices: Record<string, { avgPrice: number; avgPsf: number | null }>;
  onStationClick?: (code: string) => void;
}

// Station codes that serve more than one line (shared name) are interchanges.
const INTERCHANGE_CODES = new Set<string>(
  STATION_GROUPS.filter((g) => g.codes.length > 1).flatMap((g) => g.codes),
);

const COL_W = 96; // px width per station column
const BADGE_H = 34; // px height of the code badge
const NAME_ZONE = 120; // px zone above the line that holds the angled station name
const NAME_LIFT = 6; // px the name's bottom-left pivot sits above the badge — small, so
// the label looks rooted at the station and rises up-and-away from it
const PRICE_ZONE = 32; // px zone below the line that holds the price
const LINE_TOP = NAME_ZONE + BADGE_H / 2; // vertical center of badges
const NAME_ROT = -35; // degrees — names ascend to the right, like the official map

function fmtValue(value: number, mode: "total" | "psf") {
  if (mode === "psf")
    return `$${Math.round(value).toLocaleString("en-SG")} psf`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(value / 1000)}k`;
}

function TrainIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="3" width="16" height="14" rx="3" />
      <path d="M4 11h16" />
      <path d="M8 17l-2 4M16 17l2 4" />
      <circle cx="8.5" cy="14" r="0.5" fill="currentColor" />
      <circle cx="15.5" cy="14" r="0.5" fill="currentColor" />
    </svg>
  );
}

export default function LineView({ prices, onStationClick }: Props) {
  const [lineId, setLineId] = useState(LINES[0].id);
  const [priceMode, setPriceMode] = useState<"total" | "psf">("total");
  const scrollRef = useRef<HTMLDivElement>(null);

  const line = LINES.find((l) => l.id === lineId) ?? LINES[0];

  return (
    <div className="relative h-full w-full flex flex-col select-none">
      {/* Controls */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07] shrink-0">
        {/* Line selector */}
        <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {LINES.map((l) => {
            const active = l.id === line.id;
            return (
              <button
                key={l.id}
                onClick={() => {
                  setLineId(l.id);
                  scrollRef.current?.scrollTo({ left: 0 });
                }}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 border ${
                  active
                    ? "text-white border-white/20"
                    : "text-white/45 border-white/[0.08] hover:text-white/75 hover:border-white/15"
                }`}
                style={
                  active
                    ? {
                        background: `${l.color}26`,
                        borderColor: `${l.color}80`,
                      }
                    : undefined
                }
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: l.color }}
                />
                {l.shortName}
              </button>
            );
          })}
        </div>

        {/* Price mode toggle */}
        <div className="shrink-0 glass backdrop-blur-md rounded-xl p-1 flex items-center gap-0.5">
          <button
            onClick={() => setPriceMode("total")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              priceMode === "total"
                ? "bg-emerald-500/20 text-emerald-300"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            Total
          </button>
          <button
            onClick={() => setPriceMode("psf")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              priceMode === "psf"
                ? "bg-emerald-500/20 text-emerald-300"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            PSF
          </button>
        </div>
      </div>

      {/* Line title — official-style pill + code box */}
      <div className="flex items-center gap-2.5 px-4 py-3 shrink-0">
        <div
          className="flex items-center gap-2 rounded-full pl-3 pr-4 py-1.5 shadow-sm"
          style={{ background: line.color }}
        >
          <span className="text-white/95">
            <TrainIcon />
          </span>
          <span className="text-white text-base font-semibold tracking-wide">
            {line.name}
          </span>
        </div>
        <span
          className="rounded-md px-2.5 py-1.5 text-base font-bold text-white leading-none"
          style={{ background: line.color }}
        >
          {line.shortName}
        </span>
        <span className="text-white/25 text-xs shrink-0 hidden sm:inline ml-auto">
          {line.codes.length} stations · scroll →
        </span>
      </div>

      {/* Scrollable straight line */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden flex items-center"
      >
        <div className="relative flex items-stretch min-w-max px-16">
          {/* Connecting line */}
          <div
            className="absolute rounded-full"
            style={{
              top: LINE_TOP,
              left: COL_W / 2 + 64,
              right: COL_W / 2 + 64,
              height: 8,
              transform: "translateY(-50%)",
              background: line.color,
            }}
          />

          {line.codes.map((code) => {
            const entry = prices[code];
            const value = priceMode === "psf" ? entry?.avgPsf : entry?.avgPrice;
            const hasValue = value != null;
            const isInterchange = INTERCHANGE_CODES.has(code);

            const nameEl = (
              <span
                // Rooted at its bottom-left corner (transformOrigin below), just above
                // the badge, so the label looks planted at the station and rises up and
                // to the right — like the official map — instead of hanging down from a
                // pivot at its top.
                className={`absolute left-[2px] whitespace-nowrap text-sm font-medium leading-none transition-colors ${
                  hasValue
                    ? "text-white/75 group-hover:text-white"
                    : "text-white/30 group-hover:text-white/50"
                }`}
                style={{
                  bottom: NAME_LIFT,
                  transform: `rotate(${NAME_ROT}deg)`,
                  transformOrigin: "0% 100%",
                }}
              >
                {STATION_NAME[code] ?? code}
              </span>
            );

            const priceEl = hasValue ? (
              <span className="text-sm font-semibold tabular-nums text-emerald-300">
                {fmtValue(value, priceMode)}
              </span>
            ) : (
              <span className="text-white/20 text-sm">—</span>
            );

            return (
              <button
                key={code}
                onClick={() => onStationClick?.(code)}
                style={{ width: COL_W }}
                className="relative shrink-0 flex flex-col items-center group focus:outline-none"
              >
                {/* Name, always above the line — the wrapper is a zero-width
                    anchor centered on the column, so the name's pivot point
                    (bottom-right corner) sits directly above the badge. */}
                <div
                  className="flex justify-center w-full"
                  style={{ height: NAME_ZONE }}
                >
                  <div className="relative h-full w-0">{nameEl}</div>
                </div>

                {/* Code badge on the line */}
                <span
                  className={`relative z-10 grid place-items-center rounded-[6px] px-2 font-bold text-sm leading-none transition-transform group-hover:scale-110 group-active:scale-95 ${
                    hasValue ? "text-white" : "text-white/50"
                  }`}
                  style={{
                    height: BADGE_H,
                    minWidth: 46,
                    background: hasValue ? line.color : "#4b5563",
                    boxShadow: isInterchange
                      ? "0 0 0 3px #171827, 0 0 0 6px rgba(255,255,255,0.92)"
                      : "0 0 0 4px #171827",
                  }}
                >
                  {code}
                </span>

                {/* Price, always below the line */}
                <div
                  className="flex items-start justify-center w-full pt-1"
                  style={{ height: PRICE_ZONE }}
                >
                  {priceEl}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
