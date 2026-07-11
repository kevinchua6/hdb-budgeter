"use client";
import { useEffect, useRef, useState } from "react";
import { heatColor, type HeatPoint } from "@/lib/trainVolume";

interface Props {
  prices: Record<string, number>;
  heat?: Record<string, HeatPoint> | null;
}

export default function MrtMap({ prices, heat = null }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [htmlLoaded, setHtmlLoaded] = useState(false);
  const heatRef = useRef(heat);
  heatRef.current = heat;

  // Fetch map HTML once on mount
  useEffect(() => {
    fetch("/mrt-map.html")
      .then((r) => r.text())
      .then((html) => {
        if (ref.current) {
          ref.current.innerHTML = html;
          setHtmlLoaded(true);
        }
      });
  }, []);

  // Inject/update price labels whenever prices change (after HTML is loaded)
  useEffect(() => {
    if (!htmlLoaded) return;
    const container = ref.current;
    if (!container) return;

    container.querySelectorAll<HTMLElement>(".price-label").forEach((el) => el.remove());
    if (heat) return; // crowd mode: heat dots replace price labels

    container.querySelectorAll<HTMLElement>("[data-station-code]").forEach((li) => {
      const code = li.dataset.stationCode;
      if (!code || prices[code] == null) return;

      const label = document.createElement("span");
      label.className = "price-label";
      label.textContent = `$${Math.round(prices[code] / 1000)}k`;
      li.appendChild(label);
    });
  }, [prices, htmlLoaded, heat]);

  // Inject/update heat dots; updated in place so the hour-to-hour transition animates
  useEffect(() => {
    if (!htmlLoaded) return;
    const container = ref.current;
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
      const size = 6 + 20 * point.t;
      const color = heatColor(point.t);
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.backgroundColor = color;
      dot.style.boxShadow = `0 0 ${6 + 16 * point.t}px ${1 + 5 * point.t}px ${color}`;
    });
  }, [heat, htmlLoaded]);

  // Crowd tooltip: one fixed-position readout following the pointer over stations
  useEffect(() => {
    if (!htmlLoaded) return;
    const container = ref.current;
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

  return (
    <div id="map-container" className="overflow-x-auto">
      {!htmlLoaded && (
        <div className="flex items-center justify-center h-64 text-white/40 text-sm">
          Loading map…
        </div>
      )}
      <div ref={ref} />
    </div>
  );
}
