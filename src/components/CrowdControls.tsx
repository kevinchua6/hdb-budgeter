"use client";
import {
  SERVICE_HOURS,
  hourLabel,
  formatCount,
  HEAT_GRADIENT_CSS,
  type DayType,
} from "@/lib/trainVolume";

export interface TopStation {
  code: string;
  name: string;
  total: number;
}

interface Props {
  monthLabel: string;
  loading: boolean;
  dayType: DayType;
  onDayTypeChange: (d: DayType) => void;
  hourIdx: number;
  onHourIdxChange: (i: number) => void;
  playing: boolean;
  onPlayingChange: (p: boolean) => void;
  top: TopStation[];
}

const TICK_HOURS = [6, 9, 12, 15, 18, 21, 0];

export default function CrowdControls({
  monthLabel,
  loading,
  dayType,
  onDayTypeChange,
  hourIdx,
  onHourIdxChange,
  playing,
  onPlayingChange,
  top,
}: Props) {
  const hour = SERVICE_HOURS[hourIdx];

  return (
    <div className="border-t border-white/10 bg-[#12131f] px-4 py-3 flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onPlayingChange(!playing)}
          disabled={loading}
          className="w-9 h-9 shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm disabled:opacity-40"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "❚❚" : "▶"}
        </button>

        <div className="text-white font-semibold text-sm tabular-nums w-[104px] shrink-0">
          {hourLabel(hour)}–{hourLabel((hour + 1) % 24)}
        </div>

        <div className="flex-1 relative pb-4">
          <input
            type="range"
            min={0}
            max={SERVICE_HOURS.length - 1}
            value={hourIdx}
            disabled={loading}
            onChange={(e) => {
              onPlayingChange(false);
              onHourIdxChange(Number(e.target.value));
            }}
            className="w-full accent-[#3987e5] cursor-pointer disabled:opacity-40"
            aria-label="Hour of day"
          />
          {TICK_HOURS.map((h) => (
            <span
              key={h}
              className="absolute bottom-0 -translate-x-1/2 text-[9px] text-white/40 tabular-nums"
              style={{ left: `${(SERVICE_HOURS.indexOf(h) / (SERVICE_HOURS.length - 1)) * 100}%` }}
            >
              {hourLabel(h)}
            </span>
          ))}
        </div>

        <div className="flex rounded-md overflow-hidden border border-white/15 shrink-0 text-xs">
          {(["weekday", "weekend"] as const).map((d) => (
            <button
              key={d}
              onClick={() => onDayTypeChange(d)}
              className={
                d === dayType
                  ? "px-3 py-1.5 bg-white/15 text-white font-medium"
                  : "px-3 py-1.5 text-white/50 hover:text-white/80"
              }
            >
              {d === "weekday" ? "Weekday" : "Weekend"}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <span className="text-white/40 text-[10px]">quiet</span>
          <div
            className="w-24 h-2 rounded-full"
            style={{ background: HEAT_GRADIENT_CSS }}
          />
          <span className="text-white/40 text-[10px]">busy</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-white/50 min-h-[16px]">
        {loading ? (
          <span className="animate-pulse">Loading ridership data…</span>
        ) : (
          <>
            <span className="uppercase tracking-wide text-white/35">
              Busiest now
            </span>
            {top.map((s, i) => (
              <span key={s.code} className="whitespace-nowrap">
                {i + 1}. <span className="text-white/80">{s.name}</span>{" "}
                <span className="text-[#86b6ef] font-semibold">
                  {formatCount(s.total)}
                </span>
                {i < top.length - 1 && <span className="text-white/20 ml-2">·</span>}
              </span>
            ))}
            <span className="ml-auto text-white/30">
              taps/hr · avg {dayType} · {monthLabel} · LTA
            </span>
          </>
        )}
      </div>
    </div>
  );
}
