"use client";
import { useRef, useState } from "react";
import { LINES, STATION_NAME } from "@/lib/stations";

interface Props {
  prices: Record<string, { avgPrice: number; avgPsf: number | null }>;
  onStationClick?: (code: string) => void;
}

const COL_W = 116; // px width per station column
const CIRCLE = 44; // px circle diameter
const STACK_PAD = 76; // px height of name area above / price area below the circle
const LINE_TOP = STACK_PAD + CIRCLE / 2; // vertical center of the circles

function fmtValue(value: number, mode: "total" | "psf") {
  if (mode === "psf") return `$${Math.round(value).toLocaleString("en-SG")} psf`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(value / 1000)}k`;
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
                style={active ? { background: `${l.color}26`, borderColor: `${l.color}80` } : undefined}
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

      {/* Line title */}
      <div className="flex items-center gap-2 px-4 py-2 shrink-0">
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: line.color, boxShadow: `0 0 8px 2px ${line.color}66` }}
        />
        <h2 className="text-white/80 text-sm font-semibold truncate">{line.name}</h2>
        <span className="text-white/25 text-xs shrink-0 hidden sm:inline">
          · {line.codes.length} stations · scroll →
        </span>
      </div>

      {/* Scrollable straight line */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden flex items-center"
      >
        <div className="relative flex items-stretch min-w-max px-14">
          {/* Connecting line */}
          <div
            className="absolute rounded-full"
            style={{
              top: LINE_TOP,
              left: COL_W / 2 + 56,
              right: COL_W / 2 + 56,
              height: 5,
              transform: "translateY(-50%)",
              background: line.color,
            }}
          />

          {line.codes.map((code) => {
            const entry = prices[code];
            const value = priceMode === "psf" ? entry?.avgPsf : entry?.avgPrice;
            const hasValue = value != null;

            return (
              <button
                key={code}
                onClick={() => onStationClick?.(code)}
                style={{ width: COL_W }}
                className="relative shrink-0 flex flex-col items-center group focus:outline-none"
              >
                {/* Name */}
                <div
                  className="flex items-end justify-center px-1 pb-3"
                  style={{ height: STACK_PAD }}
                >
                  <span
                    className={`text-[11px] font-medium leading-tight text-center transition-colors ${
                      hasValue
                        ? "text-white/70 group-hover:text-white"
                        : "text-white/30 group-hover:text-white/50"
                    }`}
                  >
                    {STATION_NAME[code] ?? code}
                  </span>
                </div>

                {/* Circle */}
                <span
                  className={`relative z-10 grid place-items-center rounded-full text-[10px] font-semibold transition-transform group-hover:scale-110 group-active:scale-95 ${
                    hasValue ? "text-white" : "text-white/40"
                  }`}
                  style={{
                    width: CIRCLE,
                    height: CIRCLE,
                    background: "#171827",
                    border: `3px solid ${hasValue ? line.color : "#4b5563"}`,
                    boxShadow: `0 0 0 3px #171827`,
                  }}
                >
                  {code}
                </span>

                {/* Price */}
                <div
                  className="flex flex-col items-center gap-0.5 pt-3"
                  style={{ height: STACK_PAD }}
                >
                  {hasValue ? (
                    <span className="text-xs font-semibold tabular-nums text-white/85">
                      {fmtValue(value, priceMode)}
                    </span>
                  ) : (
                    <span className="text-white/20 text-xs">—</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
