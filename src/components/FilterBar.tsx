"use client";
import { useState } from "react";
import { STATION_GROUPS } from "@/lib/stations";
import {
  flatTypeLabel,
  walkLabel,
  leaseLabel,
  monthsLabel,
} from "@/lib/filterLabels";

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-black font-bold text-sm">{children}</span>;
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
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2 whitespace-nowrap ${
        active
          ? "bg-white text-black border-black"
          : "bg-white text-black/50 border-black/15 hover:border-black/30 hover:text-black/75"
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
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 border-2 whitespace-nowrap ${
        active
          ? "bg-white text-black border-black"
          : "bg-white text-black/50 border-black/15 hover:border-black/30 hover:text-black/75"
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
      {/* Desktop: vertical column on the left */}
      <div className="hidden sm:flex flex-col gap-5 w-72 shrink-0 border-r border-black/10 px-5 py-5 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <SectionLabel>Flat type</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {FLAT_TYPES.map((t) => (
              <Chip
                key={t}
                label={flatTypeLabel(t)}
                active={filters.flatType === t}
                onClick={() => set("flatType", t)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>Walk from MRT</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {WALK_OPTIONS.map((m) => (
              <Chip key={m} label={walkLabel(m)} active={filters.maxWalkMin === m} onClick={() => set("maxWalkMin", m)} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>Lease left</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {LEASE_OPTIONS.map((y) => (
              <Chip key={y} label={leaseLabel(y)} active={filters.minLeaseYears === y} onClick={() => set("minLeaseYears", y)} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>Floor</SectionLabel>
          <div className="flex items-center gap-2">
            <input
              type="number" min={1} max={filters.maxFloor} value={filters.minFloor}
              onChange={(e) => set("minFloor", Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 bg-white border-2 border-black/15 rounded-full px-2 py-1.5 text-black text-xs text-center focus:outline-none focus:border-black transition-all"
            />
            <span className="text-black/40 text-xs select-none">—</span>
            <input
              type="number" min={filters.minFloor}
              value={filters.maxFloor >= 999 ? "" : filters.maxFloor}
              placeholder="any"
              onChange={(e) => {
                const v = parseInt(e.target.value);
                set("maxFloor", isNaN(v) ? 999 : Math.max(filters.minFloor, v));
              }}
              className="w-16 bg-white border-2 border-black/15 rounded-full px-2 py-1.5 text-black text-xs text-center placeholder:text-black/30 focus:outline-none focus:border-black transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>Based on sales from</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {MONTH_OPTIONS.map((m) => (
              <Chip key={m} label={monthsLabel(m)} active={filters.months === m} onClick={() => set("months", m)} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SectionLabel>Commute from</SectionLabel>
          <select
            value={commuteOrigin ?? ""}
            onChange={(e) => onCommuteOriginChange(e.target.value || null)}
            className="bg-white border-2 border-black/15 rounded-full px-3 py-1.5 text-black text-xs font-medium focus:outline-none focus:border-black transition-all cursor-pointer"
          >
            <option value="" className="bg-white">Any station</option>
            {STATION_GROUPS.map((g) => (
              <option key={g.name} value={g.name} className="bg-white">{g.name}</option>
            ))}
          </select>
          {commuteOrigin && (
            <div className="flex items-center gap-1 pt-0.5">
              <span className="text-black/40 text-[10px] shrink-0">Within</span>
              <button
                onClick={() => onCommuteMaxStopsChange((s) => Math.max(1, s - 1))}
                className="w-6 h-6 rounded-full bg-white hover:bg-black/5 border-2 border-black/15 text-black/60 hover:text-black text-xs transition-all flex items-center justify-center shrink-0 active:scale-90"
              >
                −
              </button>
              <span className="text-black text-xs font-semibold w-5 text-center tabular-nums">
                {commuteMaxStops}
              </span>
              <button
                onClick={() => onCommuteMaxStopsChange((s) => Math.min(30, s + 1))}
                className="w-6 h-6 rounded-full bg-white hover:bg-black/5 border-2 border-black/15 text-black/60 hover:text-black text-xs transition-all flex items-center justify-center shrink-0 active:scale-90"
              >
                +
              </button>
              <span className="text-black/40 text-[10px] shrink-0">stops</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: floating summary bubble, overlaying the content below it */}
      <div className="sm:hidden fixed left-1/2 -translate-x-1/2 top-3 z-40">
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
              <SectionLabel>Flat type</SectionLabel>
              <div className="flex flex-wrap gap-2">
                {FLAT_TYPES.map((t) => (
                  <MobileChip
                    key={t}
                    label={flatTypeLabel(t)}
                    active={filters.flatType === t}
                    onClick={() => set("flatType", t)}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <SectionLabel>Walk from MRT</SectionLabel>
              <div className="flex gap-2 flex-wrap">
                {WALK_OPTIONS.map((m) => (
                  <MobileChip key={m} label={walkLabel(m)} active={filters.maxWalkMin === m} onClick={() => set("maxWalkMin", m)} />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <SectionLabel>Lease left</SectionLabel>
              <div className="flex gap-2 flex-wrap">
                {LEASE_OPTIONS.map((y) => (
                  <MobileChip key={y} label={leaseLabel(y)} active={filters.minLeaseYears === y} onClick={() => set("minLeaseYears", y)} />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <SectionLabel>Floor</SectionLabel>
              <div className="flex items-center gap-3">
                <input
                  type="number" min={1} max={filters.maxFloor} value={filters.minFloor}
                  onChange={(e) => set("minFloor", Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 bg-white border-2 border-black/15 rounded-full px-4 py-3 text-black text-sm text-center focus:outline-none focus:border-black transition-all"
                />
                <span className="text-black/40 text-sm select-none">—</span>
                <input
                  type="number" min={filters.minFloor}
                  value={filters.maxFloor >= 999 ? "" : filters.maxFloor}
                  placeholder="any"
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    set("maxFloor", isNaN(v) ? 999 : Math.max(filters.minFloor, v));
                  }}
                  className="w-24 bg-white border-2 border-black/15 rounded-full px-4 py-3 text-black text-sm text-center placeholder:text-black/30 focus:outline-none focus:border-black transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <SectionLabel>Based on sales from</SectionLabel>
              <div className="flex gap-2 flex-wrap">
                {MONTH_OPTIONS.map((m) => (
                  <MobileChip key={m} label={monthsLabel(m)} active={filters.months === m} onClick={() => set("months", m)} />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <SectionLabel>Commute from</SectionLabel>
              <select
                value={commuteOrigin ?? ""}
                onChange={(e) => onCommuteOriginChange(e.target.value || null)}
                className="w-full bg-white border-2 border-black/15 rounded-full px-5 py-3 text-black text-sm font-medium focus:outline-none focus:border-black transition-all cursor-pointer"
              >
                <option value="" className="bg-white">Any station</option>
                {STATION_GROUPS.map((g) => (
                  <option key={g.name} value={g.name} className="bg-white">{g.name}</option>
                ))}
              </select>
              {commuteOrigin && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-black/50 text-sm shrink-0">Within</span>
                  <button
                    onClick={() => onCommuteMaxStopsChange((s) => Math.max(1, s - 1))}
                    className="w-9 h-9 rounded-full bg-white hover:bg-black/5 border-2 border-black/15 text-black text-base transition-all flex items-center justify-center shrink-0 active:scale-90"
                  >
                    −
                  </button>
                  <span className="text-black font-bold text-base w-6 text-center tabular-nums">
                    {commuteMaxStops}
                  </span>
                  <button
                    onClick={() => onCommuteMaxStopsChange((s) => Math.min(30, s + 1))}
                    className="w-9 h-9 rounded-full bg-white hover:bg-black/5 border-2 border-black/15 text-black text-base transition-all flex items-center justify-center shrink-0 active:scale-90"
                  >
                    +
                  </button>
                  <span className="text-black/50 text-sm shrink-0">stops</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
