"use client";
import { useState } from "react";
import { STATION_GROUPS } from "@/lib/stations";

export interface Filters {
  flatType: string;
  maxWalkMin: number;
  minFloor: number;
  maxFloor: number;
  months: number;
  minLeaseYears: number;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  commuteOrigin: string | null;
  onCommuteOriginChange: (origin: string | null) => void;
  commuteMaxStops: number;
  onCommuteMaxStopsChange: (updater: (s: number) => number) => void;
}

const FLAT_TYPES = ["1 ROOM", "2 ROOM", "3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE"];
const WALK_OPTIONS = [5, 10, 15, 20];
const MONTH_OPTIONS = [6, 12, 24, 36, 60];
const LEASE_OPTIONS = [0, 50, 60, 70, 80];

function Divider() {
  return <div className="hidden sm:block h-7 w-px bg-black/10 shrink-0" />;
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${
        active
          ? "bg-white text-black border-black"
          : "bg-white text-black/50 border-black/12 hover:border-black/25 hover:text-black/75"
      }`}
    >
      {label}
    </button>
  );
}

function MobileChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 border-2 ${
        active
          ? "bg-white text-black border-black"
          : "bg-white text-black/50 border-black/12 hover:border-black/25 hover:text-black/75"
      }`}
    >
      {label}
    </button>
  );
}

function flatTypeSummary(t: string) {
  return t === "EXECUTIVE" ? "Executive flat" : `${t.charAt(0)}-room flat`;
}
function walkSummary(m: number) {
  return `${m} min from MRT`;
}
function leaseSummary(y: number) {
  return y === 0 ? "Any lease" : `${y} years left`;
}

export default function FilterBar({
  filters,
  onChange,
  commuteOrigin,
  onCommuteOriginChange,
  commuteMaxStops,
  onCommuteMaxStopsChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    onChange({ ...filters, [k]: v });

  return (
    <>
      {/* Desktop: horizontal bar */}
      <div className="hidden sm:flex flex-wrap items-center gap-x-5 gap-y-3 bg-black/[0.025] backdrop-blur-md border-b border-black/10 px-5 py-3 shrink-0">
        <div className="flex flex-col gap-1.5">
          <span className="text-black/40 text-[10px] font-medium uppercase tracking-widest">Flat type</span>
          <select
            value={filters.flatType}
            onChange={(e) => set("flatType", e.target.value)}
            className="bg-black/5 border border-black/10 rounded-lg px-3 py-1.5 text-black text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500/40 focus:border-red-500/40 transition-all cursor-pointer hover:bg-black/8 hover:border-black/20"
          >
            {FLAT_TYPES.map((t) => (
              <option key={t} value={t} className="bg-white">{t}</option>
            ))}
          </select>
        </div>

        <Divider />

        <div className="flex flex-col gap-1.5">
          <span className="text-black/40 text-[10px] font-medium uppercase tracking-widest">Walk from MRT</span>
          <div className="flex gap-1">
            {WALK_OPTIONS.map((m) => (
              <Chip key={m} label={`≤${m} min`} active={filters.maxWalkMin === m} onClick={() => set("maxWalkMin", m)} />
            ))}
          </div>
        </div>

        <Divider />

        <div className="flex flex-col gap-1.5">
          <span className="text-black/40 text-[10px] font-medium uppercase tracking-widest">Floor</span>
          <div className="flex items-center gap-2">
            <input
              type="number" min={1} max={filters.maxFloor} value={filters.minFloor}
              onChange={(e) => set("minFloor", Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 bg-black/5 border border-black/10 rounded-lg px-2 py-1.5 text-black text-xs text-center focus:outline-none focus:ring-1 focus:ring-red-500/40 focus:border-red-500/40 transition-all hover:border-black/20"
            />
            <span className="text-black/25 text-xs select-none">—</span>
            <input
              type="number" min={filters.minFloor}
              value={filters.maxFloor >= 999 ? "" : filters.maxFloor}
              placeholder="any"
              onChange={(e) => {
                const v = parseInt(e.target.value);
                set("maxFloor", isNaN(v) ? 999 : Math.max(filters.minFloor, v));
              }}
              className="w-14 bg-black/5 border border-black/10 rounded-lg px-2 py-1.5 text-black text-xs text-center placeholder:text-black/20 focus:outline-none focus:ring-1 focus:ring-red-500/40 focus:border-red-500/40 transition-all hover:border-black/20"
            />
          </div>
        </div>

        <Divider />

        <div className="flex flex-col gap-1.5">
          <span className="text-black/40 text-[10px] font-medium uppercase tracking-widest">Period</span>
          <div className="flex gap-1">
            {MONTH_OPTIONS.map((m) => (
              <Chip key={m} label={m < 12 ? `${m}mo` : `${m / 12}yr`} active={filters.months === m} onClick={() => set("months", m)} />
            ))}
          </div>
        </div>

        <Divider />

        <div className="flex flex-col gap-1.5">
          <span className="text-black/40 text-[10px] font-medium uppercase tracking-widest">Lease left</span>
          <div className="flex gap-1">
            {LEASE_OPTIONS.map((y) => (
              <Chip key={y} label={y === 0 ? "Any" : `≥${y}yr`} active={filters.minLeaseYears === y} onClick={() => set("minLeaseYears", y)} />
            ))}
          </div>
        </div>

        <Divider />

        <div className="flex flex-col gap-1.5">
          <span className="text-black/40 text-[10px] font-medium uppercase tracking-widest">Commute from</span>
          <div className="flex items-center gap-2">
            <select
              value={commuteOrigin ?? ""}
              onChange={(e) => onCommuteOriginChange(e.target.value || null)}
              className="bg-black/5 border border-black/10 rounded-lg px-3 py-1.5 text-black text-xs font-medium focus:outline-none focus:ring-1 focus:ring-red-500/40 focus:border-red-500/40 transition-all cursor-pointer hover:bg-black/8 hover:border-black/20"
            >
              <option value="" className="bg-white">Any station</option>
              {STATION_GROUPS.map((g) => (
                <option key={g.name} value={g.name} className="bg-white">{g.name}</option>
              ))}
            </select>
            {commuteOrigin && (
              <div className="flex items-center gap-1">
                <span className="text-black/40 text-[10px] shrink-0">Within</span>
                <button
                  onClick={() => onCommuteMaxStopsChange((s) => Math.max(1, s - 1))}
                  className="w-6 h-6 rounded bg-black/10 hover:bg-black/20 border border-black/10 text-black/60 hover:text-black text-xs transition-all flex items-center justify-center shrink-0 active:scale-90"
                >
                  −
                </button>
                <span className="text-black text-xs font-semibold w-5 text-center tabular-nums">
                  {commuteMaxStops}
                </span>
                <button
                  onClick={() => onCommuteMaxStopsChange((s) => Math.min(30, s + 1))}
                  className="w-6 h-6 rounded bg-black/10 hover:bg-black/20 border border-black/10 text-black/60 hover:text-black text-xs transition-all flex items-center justify-center shrink-0 active:scale-90"
                >
                  +
                </button>
                <span className="text-black/40 text-[10px] shrink-0">stops</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: floating summary bubble, overlaying the content below it */}
      <div className="sm:hidden fixed left-1/2 -translate-x-1/2 top-16 z-40">
        <button
          onClick={() => setOpen((o) => !o)}
          className="bg-white rounded-full shadow-lg border border-black/[0.06] px-6 py-2.5 flex flex-col items-center active:scale-95 transition-transform"
        >
          <span className="text-black font-bold text-sm whitespace-nowrap">
            {flatTypeSummary(filters.flatType)}
          </span>
          <span className="text-black/55 text-xs whitespace-nowrap">
            {walkSummary(filters.maxWalkMin)} | {leaseSummary(filters.minLeaseYears)}
          </span>
        </button>
      </div>

      {/* Mobile: bottom sheet */}
      {open && (
        <>
          <div
            className="sm:hidden fixed inset-0 z-[55] bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="sm:hidden fixed inset-x-0 bottom-14 z-[60] bg-white border-t border-black/10 rounded-t-2xl px-4 pt-5 pb-6 flex flex-col gap-5 max-h-[72vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <span className="text-black/70 text-sm font-semibold">Filters</span>
              <button
                onClick={() => setOpen(false)}
                className="text-black/35 hover:text-black/65 text-xs px-2 py-1 rounded-lg hover:bg-black/5 transition-colors"
              >
                Done
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-black/40 text-[10px] font-medium uppercase tracking-widest">Flat type</span>
              <select
                value={filters.flatType}
                onChange={(e) => set("flatType", e.target.value)}
                className="bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-black text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500/40 focus:border-red-500/40"
              >
                {FLAT_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-white">{t}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-black/40 text-[10px] font-medium uppercase tracking-widest">Walk from MRT</span>
              <div className="flex gap-2">
                {WALK_OPTIONS.map((m) => (
                  <MobileChip key={m} label={`≤${m} min`} active={filters.maxWalkMin === m} onClick={() => set("maxWalkMin", m)} />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-black/40 text-[10px] font-medium uppercase tracking-widest">Floor</span>
              <div className="flex items-center gap-3">
                <input
                  type="number" min={1} max={filters.maxFloor} value={filters.minFloor}
                  onChange={(e) => set("minFloor", Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 bg-black/5 border border-black/10 rounded-xl px-3 py-2.5 text-black text-sm text-center focus:outline-none focus:ring-1 focus:ring-red-500/40"
                />
                <span className="text-black/25 text-sm">—</span>
                <input
                  type="number" min={filters.minFloor}
                  value={filters.maxFloor >= 999 ? "" : filters.maxFloor}
                  placeholder="any"
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    set("maxFloor", isNaN(v) ? 999 : Math.max(filters.minFloor, v));
                  }}
                  className="w-20 bg-black/5 border border-black/10 rounded-xl px-3 py-2.5 text-black text-sm text-center placeholder:text-black/20 focus:outline-none focus:ring-1 focus:ring-red-500/40"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-black/40 text-[10px] font-medium uppercase tracking-widest">Period</span>
              <div className="flex gap-2 flex-wrap">
                {MONTH_OPTIONS.map((m) => (
                  <MobileChip key={m} label={m < 12 ? `${m}mo` : `${m / 12}yr`} active={filters.months === m} onClick={() => set("months", m)} />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-black/40 text-[10px] font-medium uppercase tracking-widest">Lease left</span>
              <div className="flex gap-2 flex-wrap">
                {LEASE_OPTIONS.map((y) => (
                  <MobileChip key={y} label={y === 0 ? "Any" : `≥${y}yr`} active={filters.minLeaseYears === y} onClick={() => set("minLeaseYears", y)} />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-black/40 text-[10px] font-medium uppercase tracking-widest">Commute from</span>
              <select
                value={commuteOrigin ?? ""}
                onChange={(e) => onCommuteOriginChange(e.target.value || null)}
                className="bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-black text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-500/40 focus:border-red-500/40"
              >
                <option value="" className="bg-white">Any station</option>
                {STATION_GROUPS.map((g) => (
                  <option key={g.name} value={g.name} className="bg-white">{g.name}</option>
                ))}
              </select>
              {commuteOrigin && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-black/40 text-xs shrink-0">Within</span>
                  <button
                    onClick={() => onCommuteMaxStopsChange((s) => Math.max(1, s - 1))}
                    className="w-8 h-8 rounded-lg bg-black/10 hover:bg-black/20 border border-black/10 text-black/60 hover:text-black text-sm transition-all flex items-center justify-center shrink-0 active:scale-90"
                  >
                    −
                  </button>
                  <span className="text-black text-base font-semibold w-6 text-center tabular-nums">
                    {commuteMaxStops}
                  </span>
                  <button
                    onClick={() => onCommuteMaxStopsChange((s) => Math.min(30, s + 1))}
                    className="w-8 h-8 rounded-lg bg-black/10 hover:bg-black/20 border border-black/10 text-black/60 hover:text-black text-sm transition-all flex items-center justify-center shrink-0 active:scale-90"
                  >
                    +
                  </button>
                  <span className="text-black/40 text-xs shrink-0">stops</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
