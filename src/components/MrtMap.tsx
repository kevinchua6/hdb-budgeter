"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  prices: Record<string, number>;
}

export default function MrtMap({ prices }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [htmlLoaded, setHtmlLoaded] = useState(false);

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

    container.querySelectorAll<HTMLElement>("[data-station-code]").forEach((li) => {
      const code = li.dataset.stationCode;
      if (!code || prices[code] == null) return;

      const label = document.createElement("span");
      label.className = "price-label";
      label.textContent = `$${Math.round(prices[code] / 1000)}k`;
      li.appendChild(label);
    });
  }, [prices, htmlLoaded]);

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
