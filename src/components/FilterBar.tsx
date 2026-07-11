"use client";
import { useState } from "react";

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
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/35 shadow-sm"
          : "text-black/45 border border-black/10 hover:border-black/20 hover:text-black/70 hover:bg-black/5"
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
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
        active
          ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/35"
          : "text-black/50 border border-black/10 hover:border-black/20 hover:text-black/70"
      }`}
    >
      {label}
    </button>
  );
}

export default function FilterBar({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    onChange({ ...filters, [k]: v });

  const summary = [
    filters.flatType,
    `≤${filters.maxWalkMin} min`,
    filters.months < 12 ? `${filters.months}mo` : `${filters.months / 12}yr`,
    filters.minLeaseYears === 0 ? "any lease" : `≥${filters.minLeaseYears}yr`,
  ].join(" · ");

  return (
    <>
      {/* Desktop: horizontal bar */}
      <div className="hidden sm:flex flex-wrap items-center gap-x-5 gap-y-3 bg-black/[0.025] backdrop-blur-md border-b border-black/10 px-5 py-3 shrink-0">
        <div className="flex flex-col gap-1.5">
          <span className="text-black/40 text-[10px] font-medium uppercase tracking-widest">Flat type</span>
          <select
            value={filters.flatType}
            onChange={(e) => set("flatType", e.target.value)}
            className="bg-black/5 border border-black/10 rounded-lg px-3 py-1.5 text-black text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all cursor-pointer hover:bg-black/8 hover:border-black/20"
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
              className="w-14 bg-black/5 border border-black/10 rounded-lg px-2 py-1.5 text-black text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all hover:border-black/20"
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
              className="w-14 bg-black/5 border border-black/10 rounded-lg px-2 py-1.5 text-black text-xs text-center placeholder:text-black/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all hover:border-black/20"
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
      </div>

      {/* Mobile: compact toggle bar */}
      <div className="sm:hidden bg-black/[0.025] border-b border-black/10 px-4 py-2.5 shrink-0">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2"
        >
          <span className="text-black/55 text-xs truncate">{summary}</span>
          <span className="text-black/40 text-xs shrink-0 font-medium flex items-center gap-1">
            Filters
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
                className="bg-black/5 border border-black/10 rounded-xl px-4 py-3 text-black text-sm font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40"
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
                  className="w-20 bg-black/5 border border-black/10 rounded-xl px-3 py-2.5 text-black text-sm text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
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
                  className="w-20 bg-black/5 border border-black/10 rounded-xl px-3 py-2.5 text-black text-sm text-center placeholder:text-black/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
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
          </div>
        </>
      )}
    </>
  );
}
