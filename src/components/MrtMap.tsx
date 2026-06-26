"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  prices: Record<string, number>;
  onStationClick?: (code: string) => void;
}

export default function MrtMap({ prices, onStationClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [htmlLoaded, setHtmlLoaded] = useState(false);

  // Drag-to-pan state (mouse only; touch uses native scrolling)
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
    moved: boolean;
  } | null>(null);

  // Fetch map HTML once on mount
  useEffect(() => {
    fetch("/mrt-map.html")
      .then((r) => r.text())
      .then((html) => {
        if (mapRef.current) {
          mapRef.current.innerHTML = html;
          setHtmlLoaded(true);
        }
      });
  }, []);

  // Inject/update price labels whenever prices change (after HTML is loaded)
  useEffect(() => {
    if (!htmlLoaded) return;
    const container = mapRef.current;
    if (!container) return;

    container.querySelectorAll<HTMLElement>(".price-label").forEach((el) => el.remove());

    container.querySelectorAll<HTMLElement>("[data-station-code]").forEach((li) => {
      const code = li.dataset.stationCode;
      if (!code || prices[code] == null) return;

      const label = document.createElement("span");
      label.className = "price-label";
      label.textContent = `$${Math.round(prices[code] / 1000)}k`;
      li.appendChild(label);
    });
  }, [prices, htmlLoaded]);

  const onPointerDown = (e: React.PointerEvent) => {
    // Only mouse drag-to-pan; let touch/pen use native scrolling.
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = scrollRef.current;
    if (!el) return;
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
      moved: false,
    };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = scrollRef.current;
    if (!d || !el || e.pointerId !== d.pointerId) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    el.scrollLeft = d.scrollLeft - dx;
    el.scrollTop = d.scrollTop - dy;
  };

  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = scrollRef.current;
    if (!d || e.pointerId !== d.pointerId) return;
    el?.releasePointerCapture(e.pointerId);
    // Keep `moved` readable by the click handler that fires right after,
    // then clear on the next tick.
    const moved = d.moved;
    drag.current = { ...d, moved };
    setTimeout(() => {
      drag.current = null;
    }, 0);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Suppress clicks that were really drags.
    if (drag.current?.moved) return;
    const el = (e.target as HTMLElement).closest("[data-station-code]") as HTMLElement | null;
    if (el?.dataset.stationCode) {
      onStationClick?.(el.dataset.stationCode);
    }
  };

  return (
    <div
      ref={scrollRef}
      className="mrt-scroll h-full w-full overflow-auto overscroll-contain select-none cursor-grab active:cursor-grabbing"
      onClick={handleClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {!htmlLoaded && (
        <div className="flex items-center justify-center h-64 text-white/40 text-sm">
          Loading map…
        </div>
      )}
      <div className="inline-block p-6">
        <div ref={mapRef} id="map-container" />
      </div>
    </div>
  );
}
