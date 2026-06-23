"use client";

export interface Filters {
  flatType: string;
  maxWalkMin: number;
  minFloor: number;
  maxFloor: number;
  months: number;
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
}

const FLAT_TYPES = ["1 ROOM", "2 ROOM", "3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE"];
const WALK_OPTIONS = [5, 10, 15, 20];
const MONTH_OPTIONS = [6, 12, 24, 36, 60];

export default function FilterBar({ filters, onChange }: Props) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    onChange({ ...filters, [k]: v });

  return (
    <div className="flex flex-wrap items-end gap-4 bg-[#171827] border-b border-white/10 px-4 py-3 text-white text-sm">
      {/* Flat Type */}
      <label className="flex flex-col gap-1">
        <span className="text-white/60 text-xs uppercase tracking-wide">Flat type</span>
        <select
          value={filters.flatType}
          onChange={(e) => set("flatType", e.target.value)}
          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-white/40"
        >
          {FLAT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      {/* Walk distance */}
      <label className="flex flex-col gap-1">
        <span className="text-white/60 text-xs uppercase tracking-wide">Walk from station</span>
        <div className="flex gap-1">
          {WALK_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => set("maxWalkMin", m)}
              className={`px-2 py-1 rounded border text-xs transition-colors ${
                filters.maxWalkMin === m
                  ? "bg-white text-[#171827] border-white font-semibold"
                  : "border-white/20 hover:border-white/50"
              }`}
            >
              ≤{m} min
            </button>
          ))}
        </div>
      </label>

      {/* Floor range */}
      <label className="flex flex-col gap-1">
        <span className="text-white/60 text-xs uppercase tracking-wide">Floor range</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            max={filters.maxFloor}
            value={filters.minFloor}
            onChange={(e) => set("minFloor", Math.max(1, parseInt(e.target.value) || 1))}
            className="w-14 bg-white/10 border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-white/40"
          />
          <span className="text-white/40">to</span>
          <input
            type="number"
            min={filters.minFloor}
            value={filters.maxFloor >= 999 ? "" : filters.maxFloor}
            placeholder="any"
            onChange={(e) => {
              const v = parseInt(e.target.value);
              set("maxFloor", isNaN(v) ? 999 : Math.max(filters.minFloor, v));
            }}
            className="w-14 bg-white/10 border border-white/20 rounded px-2 py-1 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/40"
          />
        </div>
      </label>

      {/* Date range */}
      <label className="flex flex-col gap-1">
        <span className="text-white/60 text-xs uppercase tracking-wide">Data period</span>
        <div className="flex gap-1">
          {MONTH_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => set("months", m)}
              className={`px-2 py-1 rounded border text-xs transition-colors ${
                filters.months === m
                  ? "bg-white text-[#171827] border-white font-semibold"
                  : "border-white/20 hover:border-white/50"
              }`}
            >
              {m < 12 ? `${m}mo` : `${m / 12}yr`}
            </button>
          ))}
        </div>
      </label>
    </div>
  );
}
