"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import { stopsFrom, STATION_GROUPS, type StationCode } from "@/lib/stations";
import { heatColor, type HeatPoint } from "@/lib/trainVolume";

interface Props {
  prices: Record<string, { avgPrice: number; avgPsf: number | null }>;
  onStationClick?: (code: string) => void;
  /** Crowd mode: per-station heat readings; replaces price labels when set */
  heat?: Record<string, HeatPoint> | null;
}

function ZoomControls({ scale }: { scale: number }) {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="hidden sm:flex absolute bottom-4 right-4 z-50 flex-col items-center gap-1">
      <button
        onClick={() => zoomIn(0.3, 200)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white/70 hover:text-white text-base font-light transition-all active:scale-95"
        title="Zoom in"
      >
        +
      </button>
      <span className="text-white/40 text-[10px] font-medium w-8 text-center select-none">
        {Math.round(scale * 100)}%
      </span>
      <button
        onClick={() => zoomOut(0.3, 200)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white/70 hover:text-white text-base font-light transition-all active:scale-95"
        title="Zoom out"
      >
        −
      </button>
      <button
        onClick={() => resetTransform()}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white/40 hover:text-white/70 text-xs transition-all active:scale-95 mt-1"
        title="Reset view"
      >
        ⊡
      </button>
    </div>
  );
}

// Per-station pixel nudges applied on top of auto-placement. Positive dy moves label down.
const LABEL_OFFSETS: Partial<
  Record<StationCode, { dx?: number; dy?: number }>
> = {
  EW9: { dy: -5 },
  EW11: { dy: -6 }, // Bugis (EWL)
  NE12: { dy: 17 }, // Serangoon (NEL)
  CC13: { dy: 17 }, // Serangoon (CCL)
  NE13: { dy: -5 }, // Kovan
  NE14: { dy: -5 }, // Hougang
  NE15: { dy: -5 }, // Buangkok
};

export default function MrtMap({ prices, onStationClick, heat = null }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [htmlLoaded, setHtmlLoaded] = useState(false);
  const heatRef = useRef(heat);
  heatRef.current = heat;
  const [scale, setScale] = useState(1.0);
  const didMove = useRef(false);
  const [commuteOrigin, setCommuteOrigin] = useState<string | null>(null);
  const [commuteMaxStops, setCommuteMaxStops] = useState(5);
  const [mobileCommuteOpen, setMobileCommuteOpen] = useState(false);
  const [priceMode, setPriceMode] = useState<"total" | "psf">("total");

  const { reachable, originCodesSet } = useMemo(() => {
    if (!commuteOrigin)
      return {
        reachable: new Map<string, number>(),
        originCodesSet: new Set<string>(),
      };
    const group = STATION_GROUPS.find((g) => g.name === commuteOrigin);
    if (!group)
      return {
        reachable: new Map<string, number>(),
        originCodesSet: new Set<string>(),
      };
    return {
      reachable: stopsFrom(group.codes, commuteMaxStops),
      originCodesSet: new Set(group.codes),
    };
  }, [commuteOrigin, commuteMaxStops]);

  useEffect(() => {
    let cancelled = false;
    fetch("/mrt-map.html")
      .then((r) => r.text())
      .then((html) => {
        if (cancelled || !mapRef.current) return;
        mapRef.current.innerHTML = html;
        setHtmlLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!htmlLoaded) return;
    const container = mapRef.current;
    if (!container) return;
    const mapEl = container.querySelector<HTMLElement>("#mrt-map-singapore");
    if (!mapEl) return;

    let overlay = mapEl.querySelector<HTMLElement>(".price-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "price-overlay";
      mapEl.appendChild(overlay);
    }

    const offsetFrom = (el: HTMLElement, root: HTMLElement) => {
      let x = 0,
        y = 0,
        cur: HTMLElement | null = el;
      while (cur && cur !== root) {
        x += cur.offsetLeft;
        y += cur.offsetTop;
        cur = cur.offsetParent as HTMLElement | null;
      }
      return { x, y };
    };

    overlay.replaceChildren();
    if (heat) return; // crowd mode: heat dots replace price labels
    container
      .querySelectorAll<HTMLElement>("[data-station-code]")
      .forEach((li) => {
        const code = li.dataset.stationCode;
        if (!code) return;
        const entry = prices[code];
        if (!entry) return;
        const value = priceMode === "psf" ? entry.avgPsf : entry.avgPrice;
        if (value == null) return;

        const anchor = li.querySelector<HTMLElement>(".station-nr") ?? li;
        const { x, y } = offsetFrom(anchor, mapEl);
        const cx = x + anchor.offsetWidth / 2;

        // Clear the whole station label (number + name) before placing the
        // price bubble below it. Many station names are plain text trailing
        // the number span rather than their own element, so measure the
        // enclosing <a> (or li) instead of hunting for a name span — and add
        // a generous buffer since exact text metrics shift slightly across
        // browsers/fonts, and we'd rather the bubble sit a bit low than land
        // on top of and hide the name.
        const textEl = li.querySelector<HTMLElement>("a") ?? li;
        const textOff = offsetFrom(textEl, mapEl);
        let textBottom = textOff.y + textEl.offsetHeight;

        // Some names (e.g. the EWL west branch and NSL top) sit below the
        // circle as an absolutely-positioned ".get-down" span, so they don't
        // count toward the anchor's offsetHeight above. Measure such a name
        // directly so the price bubble clears it instead of landing on top.
        const nameEl = li.querySelector<HTMLElement>(".get-down");
        if (nameEl) {
          const nameOff = offsetFrom(nameEl, mapEl);
          textBottom = Math.max(textBottom, nameOff.y + nameEl.offsetHeight);
        }

        const circleBottom = y + anchor.offsetHeight;
        const labelTop = Math.max(circleBottom, textBottom) + 8;

        const { dx = 0, dy = 0 } = LABEL_OFFSETS[code as StationCode] ?? {};
        const label = document.createElement("span");
        label.className = "price-label";
        label.dataset.stationCode = code;
        label.textContent = priceMode === "psf"
          ? `$${value.toLocaleString("en-SG")} psf`
          : value >= 1_000_000
            ? `$${(value / 1_000_000).toFixed(1)}M`
            : `$${Math.round(value / 1000)}k`;
        label.style.left = `${cx + dx}px`;
        label.style.top = `${labelTop + dy}px`;
        overlay!.appendChild(label);
      });
  }, [prices, htmlLoaded, priceMode, heat]);

  // Inject/update heat dots; updated in place so the hour-to-hour transition animates
  useEffect(() => {
    if (!htmlLoaded) return;
    const container = mapRef.current;
    if (!container) return;

    if (!heat) {
      container.querySelectorAll<HTMLElement>(".heat-dot").forEach((el) => el.remove());
      return;
    }

    container.querySelectorAll<HTMLElement>("[data-station-code]").forEach((li) => {
      const code = li.dataset.stationCode;
      const point = code ? heat[code] : undefined;
      let dot = li.querySelector<HTMLElement>(".heat-dot");

      if (!point || point.t <= 0) {
        dot?.remove();
        return;
      }
      if (!dot) {
        dot = document.createElement("span");
        dot.className = "heat-dot";
        // Center the dot on the station's number marker when there is one
        const anchor = li.querySelector<HTMLElement>(".station-nr") ?? li;
        anchor.classList.add("heat-anchor");
        anchor.appendChild(dot);
      }
      const size = 5 + 32 * point.t;
      const color = heatColor(point.t);
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.backgroundColor = color;
      dot.style.boxShadow = `0 0 ${10 + 26 * point.t}px ${2 + 8 * point.t}px ${color}`;
    });
  }, [heat, htmlLoaded]);

  // Crowd tooltip: one fixed-position readout following the pointer over stations
  useEffect(() => {
    if (!htmlLoaded) return;
    const container = mapRef.current;
    if (!container) return;

    const tip = document.createElement("div");
    tip.className = "heat-tooltip";
    tip.style.display = "none";
    const ttName = document.createElement("div");
    ttName.className = "tt-name";
    const ttVals = document.createElement("div");
    ttVals.className = "tt-vals";
    const ttNet = document.createElement("div");
    ttNet.className = "tt-net";
    tip.append(ttName, ttVals, ttNet);
    document.body.appendChild(tip);

    const onMove = (e: PointerEvent) => {
      const currentHeat = heatRef.current;
      const li = (e.target as HTMLElement).closest?.<HTMLElement>("[data-station-code]");
      const code = li?.dataset.stationCode;
      const point = code && currentHeat ? currentHeat[code] : undefined;
      if (!point) {
        tip.style.display = "none";
        return;
      }
      ttName.textContent = `${point.name} · ${code}`;
      ttVals.textContent = `${point.in.toLocaleString()} tap in · ${point.out.toLocaleString()} tap out`;
      const net = point.out - point.in;
      ttNet.textContent =
        net >= 0
          ? `net +${net.toLocaleString()} arriving`
          : `net ${Math.abs(net).toLocaleString()} leaving`;
      tip.style.display = "block";
      tip.style.left = `${Math.min(e.clientX + 14, window.innerWidth - 230)}px`;
      tip.style.top = `${e.clientY + 14}px`;
    };
    const onLeave = () => {
      tip.style.display = "none";
    };
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    return () => {
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      tip.remove();
    };
  }, [htmlLoaded]);

  // Runs after prices effect (defined after, prices in deps) so new price labels get classes too
  useEffect(() => {
    if (!htmlLoaded) return;
    const container = mapRef.current;
    if (!container) return;
    container
      .querySelectorAll<HTMLElement>("[data-station-code]")
      .forEach((el) => {
        const code = el.dataset.stationCode!;
        el.classList.remove("commute-dimmed", "commute-origin");
        if (commuteOrigin) {
          if (originCodesSet.has(code)) el.classList.add("commute-origin");
          else if (!reachable.has(code)) el.classList.add("commute-dimmed");
        }
      });
  }, [htmlLoaded, commuteOrigin, reachable, originCodesSet, prices]);

  const handleClick = (e: React.MouseEvent) => {
    if (didMove.current) return;
    const actual = document.elementFromPoint(
      e.clientX,
      e.clientY,
    ) as HTMLElement | null;
    const el = (actual ?? (e.target as HTMLElement)).closest(
      "[data-station-code]",
    ) as HTMLElement | null;
    if (el?.dataset.stationCode) {
      onStationClick?.(el.dataset.stationCode);
    }
  };

  return (
    <div className="relative h-full w-full select-none" onClick={handleClick}>
      {!htmlLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm pointer-events-none">
          Loading map…
        </div>
      )}

      {/* Price mode toggle */}
      {!heat && (
      <div
        className="absolute top-4 right-4 z-50 glass backdrop-blur-md rounded-xl p-1 flex items-center gap-0.5"
        onClick={(e) => e.stopPropagation()}
      >
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
      )}

      {/* Commute distance panel */}
      {!heat && (
      <div
        className="hidden sm:block absolute top-4 left-4 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="glass backdrop-blur-md rounded-xl p-3 flex flex-col gap-2 w-44">
          <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">
            Commute from
          </span>
          <select
            value={commuteOrigin ?? ""}
            onChange={(e) => setCommuteOrigin(e.target.value || null)}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 cursor-pointer hover:border-white/20 transition-colors"
          >
            <option value="" className="bg-[#1a1b2e]">
              Any station
            </option>
            {STATION_GROUPS.map((g) => (
              <option key={g.name} value={g.name} className="bg-[#1a1b2e]">
                {g.name}
              </option>
            ))}
          </select>
          {commuteOrigin && (
            <div className="flex items-center gap-1">
              <span className="text-white/40 text-[10px] shrink-0">Within</span>
              <button
                onClick={() => setCommuteMaxStops((s) => Math.max(1, s - 1))}
                className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white/60 hover:text-white text-xs transition-all flex items-center justify-center shrink-0 active:scale-90"
              >
                −
              </button>
              <span className="text-white text-sm font-semibold w-6 text-center tabular-nums">
                {commuteMaxStops}
              </span>
              <button
                onClick={() => setCommuteMaxStops((s) => Math.min(30, s + 1))}
                className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white/60 hover:text-white text-xs transition-all flex items-center justify-center shrink-0 active:scale-90"
              >
                +
              </button>
              <span className="text-white/40 text-[10px] shrink-0">stops</span>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Mobile: commute FAB + panel */}
      {!heat && (
      <div className="sm:hidden absolute bottom-4 right-4 z-50 flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
        {mobileCommuteOpen && (
          <div className="glass backdrop-blur-md rounded-xl p-3 flex flex-col gap-2 w-48">
            <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Commute from</span>
            <select
              value={commuteOrigin ?? ""}
              onChange={(e) => setCommuteOrigin(e.target.value || null)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 cursor-pointer"
            >
              <option value="" className="bg-[#1a1b2e]">Any station</option>
              {STATION_GROUPS.map((g) => (
                <option key={g.name} value={g.name} className="bg-[#1a1b2e]">{g.name}</option>
              ))}
            </select>
            {commuteOrigin && (
              <div className="flex items-center gap-1">
                <span className="text-white/40 text-[10px] shrink-0">Within</span>
                <button
                  onClick={() => setCommuteMaxStops((s) => Math.max(1, s - 1))}
                  className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white/60 text-xs transition-all flex items-center justify-center shrink-0 active:scale-90"
                >−</button>
                <span className="text-white text-sm font-semibold w-6 text-center tabular-nums">{commuteMaxStops}</span>
                <button
                  onClick={() => setCommuteMaxStops((s) => Math.min(30, s + 1))}
                  className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white/60 text-xs transition-all flex items-center justify-center shrink-0 active:scale-90"
                >+</button>
                <span className="text-white/40 text-[10px] shrink-0">stops</span>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => setMobileCommuteOpen((o) => !o)}
          className={`h-10 px-3 rounded-xl border text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5 ${
            commuteOrigin
              ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-300"
              : "bg-white/10 border-white/15 text-white/70"
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          {commuteOrigin ? commuteOrigin : "Commute"}
        </button>
      </div>
      )}

      <TransformWrapper
        minScale={0.75}
        maxScale={2.5}
        limitToBounds={true}
        centerOnInit
        doubleClick={{ mode: "zoomIn", step: 0.5, animationTime: 200 }}
        wheel={{ step: 0.003 }}
        panning={{ velocityDisabled: false }}
        onTransform={(_, state) => setScale(state.scale)}
        onPanningStart={() => {
          didMove.current = false;
        }}
        onPanning={() => {
          didMove.current = true;
        }}
      >
        <TransformComponent
          wrapperClass="h-full w-full cursor-grab active:cursor-grabbing"
          wrapperStyle={{ overflow: "hidden" }}
        >
          <div className="p-6">
            <div ref={mapRef} id="map-container" />
          </div>
        </TransformComponent>
        <ZoomControls scale={scale} />
      </TransformWrapper>
    </div>
  );
}
