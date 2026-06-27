"use client";
import { useEffect, useRef, useState } from "react";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";

interface Props {
  prices: Record<string, number>;
  onStationClick?: (code: string) => void;
}

function ZoomControls({ scale }: { scale: number }) {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="absolute bottom-4 right-4 z-50 flex flex-col items-center gap-1">
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

export default function MrtMap({ prices, onStationClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [htmlLoaded, setHtmlLoaded] = useState(false);
  const [scale, setScale] = useState(1.0);
  const didMove = useRef(false);

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
    container
      .querySelectorAll<HTMLElement>("[data-station-code]")
      .forEach((li) => {
        const code = li.dataset.stationCode;
        if (!code || prices[code] == null) return;

        const anchor = li.querySelector<HTMLElement>(".station-nr") ?? li;
        const { x, y } = offsetFrom(anchor, mapEl);
        const cx = x + anchor.offsetWidth / 2;
        const cy = y + anchor.offsetHeight / 2;

        const label = document.createElement("span");
        label.className = "price-label";
        label.dataset.stationCode = code;
        label.textContent = `$${Math.round(prices[code] / 1000)}k`;
        label.style.left = `${cx}px`;
        label.style.top = `${cy + 13}px`;
        overlay!.appendChild(label);
      });
  }, [prices, htmlLoaded]);

  const handleClick = (e: React.MouseEvent) => {
    if (didMove.current) return;
    const actual = document.elementFromPoint(
      e.clientX,
      e.clientY
    ) as HTMLElement | null;
    const el = (actual ?? (e.target as HTMLElement)).closest(
      "[data-station-code]"
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
      <TransformWrapper
        minScale={0.75}
        maxScale={2.5}
        limitToBounds={false}
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
