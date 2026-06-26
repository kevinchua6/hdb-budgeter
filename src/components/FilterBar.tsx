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

function Divider() {
  return <div className="hidden sm:block h-7 w-px bg-white/10 shrink-0" />;
}

export default function FilterBar({ filters, onChange }: Props) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    onChange({ ...filters, [k]: v });

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 bg-white/[0.025] backdrop-blur-md border-b border-white/10 px-5 py-3 shrink-0">

      {/* Flat Type */}
      <div className="flex flex-col gap-1.5">
        <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Flat type</span>
        <select
          value={filters.flatType}
          onChange={(e) => set("flatType", e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all cursor-pointer hover:bg-white/8 hover:border-white/20"
        >
          {FLAT_TYPES.map((t) => (
            <option key={t} value={t} className="bg-[#1a1b2e]">{t}</option>
          ))}
        </select>
      </div>

      <Divider />

      {/* Walk distance */}
      <div className="flex flex-col gap-1.5">
        <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Walk from MRT</span>
        <div className="flex gap-1">
          {WALK_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => set("maxWalkMin", m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.maxWalkMin === m
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 shadow-sm"
                  : "text-white/45 border border-white/10 hover:border-white/20 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              ≤{m}m
            </button>
          ))}
        </div>
      </div>

      <Divider />

      {/* Floor range */}
      <div className="flex flex-col gap-1.5">
        <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Floor</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={filters.maxFloor}
            value={filters.minFloor}
            onChange={(e) => set("minFloor", Math.max(1, parseInt(e.target.value) || 1))}
            className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all hover:border-white/20"
          />
          <span className="text-white/25 text-xs select-none">—</span>
          <input
            type="number"
            min={filters.minFloor}
            value={filters.maxFloor >= 999 ? "" : filters.maxFloor}
            placeholder="any"
            onChange={(e) => {
              const v = parseInt(e.target.value);
              set("maxFloor", isNaN(v) ? 999 : Math.max(filters.minFloor, v));
            }}
            className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs text-center placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all hover:border-white/20"
          />
        </div>
      </div>

      <Divider />

      {/* Date range */}
      <div className="flex flex-col gap-1.5">
        <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Period</span>
        <div className="flex gap-1">
          {MONTH_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => set("months", m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.months === m
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 shadow-sm"
                  : "text-white/45 border border-white/10 hover:border-white/20 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              {m < 12 ? `${m}mo` : `${m / 12}yr`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
