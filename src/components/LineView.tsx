"use client";
import { useRef, useState } from "react";
import {
  LINES,
  STATION_NAME,
  STATION_GROUPS,
  lineColorForCode,
} from "@/lib/stations";

interface Props {
  prices: Record<string, { avgPrice: number; avgPsf: number | null }>;
  onStationClick?: (code: string) => void;
  priceMode: "total" | "psf";
  onPriceModeChange: (mode: "total" | "psf") => void;
}

// Station codes that serve more than one line (shared name) are interchanges.
const INTERCHANGE_CODES = new Set<string>(
  STATION_GROUPS.filter((g) => g.codes.length > 1).flatMap((g) => g.codes),
);

const COL_W = 96; // px width per station column
const BADGE_H = 40; // px height of the price badge
const NAME_ZONE = 120; // px zone above the line that holds the angled station name
const NAME_LIFT = 6; // px the name's bottom-left pivot sits above the badge — small, so
// the label looks rooted at the station and rises up-and-away from it
const LINE_TOP = NAME_ZONE + BADGE_H / 2; // vertical center of badges
const NAME_ROT = -35; // degrees — names ascend to the right, like the official map

function fmtValue(value: number, mode: "total" | "psf") {
  if (mode === "psf")
    return `$${Math.round(value).toLocaleString("en-SG")} psf`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(value / 1000)}k`;
}

export default function LineView({
  prices,
  onStationClick,
  priceMode,
  onPriceModeChange,
}: Props) {
  const [lineId, setLineId] = useState(LINES[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);

  const line = LINES.find((l) => l.id === lineId) ?? LINES[0];

  return (
    <div className="relative h-full w-full flex flex-col select-none">
      {/* Controls — extra top clearance on mobile so the line selector
          clears FilterBar's floating summary bubble instead of sitting
          underneath it. */}
      <div className="flex items-center gap-3 px-4 pt-20 pb-3 sm:py-3 border-b border-black/[0.07] shrink-0">
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
                    ? "text-black border-black/20"
                    : "text-black/45 border-black/[0.08] hover:text-black/75 hover:border-black/15"
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

        {/* Price mode toggle — hidden on mobile, where it lives instead in
            the floating bottom-left cluster beside the view switcher. */}
        <div className="hidden sm:flex shrink-0 glass backdrop-blur-md rounded-xl p-1 items-center gap-0.5">
          <button
            onClick={() => onPriceModeChange("total")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              priceMode === "total"
                ? "bg-red-500/20 text-red-700"
                : "text-black/50 hover:text-black/80"
            }`}
          >
            Total
          </button>
          <button
            onClick={() => onPriceModeChange("psf")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              priceMode === "psf"
                ? "bg-red-500/20 text-red-700"
                : "text-black/50 hover:text-black/80"
            }`}
          >
            PSF
          </button>
        </div>
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

            // Outline the badge with the color of every line that passes
            // through this station — its own line first, then any others
            // it interchanges with, each as a wider ring further out.
            let ringColors = [line.color];
            if (isInterchange) {
              const group = STATION_GROUPS.find((g) => g.codes.includes(code));
              const otherColors = (group?.codes ?? [])
                .filter((c) => c !== code)
                .map(lineColorForCode)
                .filter((c): c is string => !!c && c !== line.color);
              ringColors = [line.color, ...Array.from(new Set(otherColors))];
            }
            const ringShadow = ringColors
              .map((c, i) => `0 0 0 ${3 + i * 3}px ${c}`)
              .join(", ");

            const nameEl = (
              <span
                // Rooted at its bottom-left corner (transformOrigin below), just above
                // the badge, so the label looks planted at the station and rises up and
                // to the right — like the official map — instead of hanging down from a
                // pivot at its top.
                className={`absolute left-[2px] whitespace-nowrap text-sm font-medium leading-none transition-colors ${
                  hasValue
                    ? "text-black/75 group-hover:text-black"
                    : "text-black/30 group-hover:text-black/50"
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

                {/* Price badge on the line — replaces the station number entirely */}
                <span
                  className={`relative z-10 grid place-items-center rounded-xl px-3 font-bold text-sm leading-none transition-transform group-hover:scale-110 group-active:scale-95 ${
                    hasValue ? "text-black" : "text-[#bfae8c]"
                  }`}
                  style={{
                    height: BADGE_H,
                    minWidth: 56,
                    background: hasValue ? "#ffffff" : "#f5f0e6",
                    boxShadow: ringShadow,
                  }}
                >
                  {hasValue ? fmtValue(value, priceMode) : "NA"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
