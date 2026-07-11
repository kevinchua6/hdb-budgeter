"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import {
  stopsFrom,
  STATION_GROUPS,
  lineColorForCode,
  type StationCode,
} from "@/lib/stations";

interface Props {
  prices: Record<string, { avgPrice: number; avgPsf: number | null }>;
  onStationClick?: (code: string) => void;
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

export default function MrtMap({ prices, onStationClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [htmlLoaded, setHtmlLoaded] = useState(false);
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

  // One-time: the station name is a bare trailing text node inside each
  // <a> (e.g. "<span class='station-nr'>18</span> braddell"), so it can't be
  // repositioned on its own. Wrap it in a span once so the price-label
  // effect below can nudge it clear of the (now wider) price bubble.
  useEffect(() => {
    if (!htmlLoaded) return;
    const container = mapRef.current;
    if (!container) return;
    container
      .querySelectorAll<HTMLElement>("[data-station-code] a")
      .forEach((a) => {
        if (a.querySelector(".mrt-station-name")) return;
        const textNode = Array.from(a.childNodes).find(
          (n) => n.nodeType === Node.TEXT_NODE && !!n.textContent?.trim(),
        );
        if (!textNode) return;
        const span = document.createElement("span");
        span.className = "mrt-station-name";
        span.textContent = textNode.textContent;
        textNode.replaceWith(span);
      });
  }, [htmlLoaded]);

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

    // Interchanges render a second, non-interactive ".station-nr" for their
    // other line (no [data-station-code] ancestor, no click/tooltip, just a
    // duplicate number drawn ~22px from the real dot for visual completeness).
    // Collect every number span, then cluster by proximity so each physical
    // station — however many line dots it has — gets exactly one price tag,
    // centered across its members, instead of one tag per dot.
    const anchors = Array.from(
      container.querySelectorAll<HTMLElement>(".station-nr"),
    ).filter((el) => el.textContent?.trim() !== "00"); // "00" = hidden placeholder slots

    const items = anchors.map((anchor) => {
      const codeHost = anchor.closest<HTMLElement>("[data-station-code]");
      const { x, y } = offsetFrom(anchor, mapEl);
      return {
        anchor,
        codeHost,
        code: codeHost?.dataset.stationCode,
        cx: x + anchor.offsetWidth / 2,
        cy: y + anchor.offsetHeight / 2,
      };
    });

    // Union-find: a station's decorative twin sits ~22px from its real dot,
    // while the next distinct station along a line is 44px+ away.
    const CLUSTER_DIST = 40;
    const parent = items.map((_, i) => i);
    const find = (i: number): number => {
      while (parent[i] !== i) {
        parent[i] = parent[parent[i]];
        i = parent[i];
      }
      return i;
    };
    const union = (a: number, b: number) => {
      const ra = find(a),
        rb = find(b);
      if (ra !== rb) parent[ra] = rb;
    };
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (Math.hypot(items[i].cx - items[j].cx, items[i].cy - items[j].cy) < CLUSTER_DIST) {
          union(i, j);
        }
      }
    }
    const clusters = new Map<number, typeof items>();
    items.forEach((item, idx) => {
      const root = find(idx);
      if (!clusters.has(root)) clusters.set(root, []);
      clusters.get(root)!.push(item);
    });

    clusters.forEach((members) => {
      members.forEach((m) => {
        m.anchor.style.visibility = "hidden";
      });

      const cx = members.reduce((s, m) => s + m.cx, 0) / members.length;
      const cy = members.reduce((s, m) => s + m.cy, 0) / members.length;

      // All member codes are the same physical station, so any non-null
      // price among them applies to the whole cluster.
      let value: number | null = null;
      let primaryCode: string | undefined;
      for (const m of members) {
        if (!m.code) continue;
        if (!primaryCode) primaryCode = m.code;
        const entry = prices[m.code];
        const v = entry
          ? priceMode === "psf"
            ? entry.avgPsf
            : entry.avgPrice
          : null;
        if (v != null) {
          value = v;
          break;
        }
      }

      const { dx = 0, dy = 0 } =
        (primaryCode ? LABEL_OFFSETS[primaryCode as StationCode] : undefined) ??
        {};

      // Outline the tag with the color of every line serving this station —
      // its own line first, then any others it interchanges with, each as a
      // wider ring further out (mirrors LineView's badge outlines).
      const group = primaryCode
        ? STATION_GROUPS.find((g) => g.codes.includes(primaryCode))
        : undefined;
      const primaryColor = primaryCode ? lineColorForCode(primaryCode) : undefined;
      const otherColors = (group?.codes ?? [])
        .filter((c) => c !== primaryCode)
        .map(lineColorForCode)
        .filter((c): c is string => !!c && c !== primaryColor);
      const ringColors = primaryColor
        ? [primaryColor, ...Array.from(new Set(otherColors))]
        : ["#4b5563"];
      const ringShadow = ringColors
        .map((c, i) => `0 0 0 ${3 + i * 3}px ${c}`)
        .join(", ");

      const label = document.createElement("span");
      label.className = "price-label";
      if (primaryCode) label.dataset.stationCode = primaryCode;
      label.textContent =
        value == null
          ? "NA"
          : priceMode === "psf"
            ? `$${value.toLocaleString("en-SG")} psf`
            : value >= 1_000_000
              ? `$${(value / 1_000_000).toFixed(1)}M`
              : `$${Math.round(value / 1000)}k`;
      label.style.left = `${cx + dx}px`;
      label.style.top = `${cy + dy}px`;
      label.style.background = value == null ? "#3f3f46" : "#ffffff";
      label.style.color = value == null ? "#ffffff" : "#0a0a0a";
      label.style.boxShadow = `${ringShadow}, 0 2px 8px -2px rgba(0, 0, 0, 0.7)`;
      overlay!.appendChild(label);

      // Nudge the station name clear of the bubble if they now overlap —
      // the bubble is wider than the number it replaced, so names that
      // used to sit safely beside/below the number may now be covered.
      const codeHost = members.find((m) => m.codeHost)?.codeHost;
      const nameEl =
        codeHost?.querySelector<HTMLElement>(".get-down") ??
        codeHost?.querySelector<HTMLElement>(".mrt-station-name");
      if (nameEl) {
        nameEl.style.transform = "";
        const nameOff = offsetFrom(nameEl, mapEl);
        const nameRect = {
          left: nameOff.x,
          right: nameOff.x + nameEl.offsetWidth,
          top: nameOff.y,
          bottom: nameOff.y + nameEl.offsetHeight,
        };
        const labelRect = {
          left: cx + dx - label.offsetWidth / 2,
          right: cx + dx + label.offsetWidth / 2,
          top: cy + dy - label.offsetHeight / 2,
          bottom: cy + dy + label.offsetHeight / 2,
        };
        const overlapX =
          Math.min(nameRect.right, labelRect.right) -
          Math.max(nameRect.left, labelRect.left);
        const overlapY =
          Math.min(nameRect.bottom, labelRect.bottom) -
          Math.max(nameRect.top, labelRect.top);
        // Names sit beside the tag on the same row in this map's layout,
        // so always resolve the overlap horizontally — a vertical nudge
        // just shoves the name into the row above/below instead.
        if (overlapX > 0 && overlapY > 0) {
          const nameCx = (nameRect.left + nameRect.right) / 2;
          const GAP = 4;
          const dir = nameCx >= cx + dx ? 1 : -1;
          nameEl.style.transform = `translateX(${dir * (overlapX + GAP)}px)`;
        }
      }
    });
  }, [prices, htmlLoaded, priceMode]);

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

      {/* Commute distance panel */}
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

      {/* Mobile: commute FAB + panel */}
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
