"use client";
import { useEffect, useState } from "react";
import type { Filters } from "./FilterBar";

interface Listing {
  block: string;
  streetName: string;
  storeyMin: number;
  storeyMax: number;
  resalePrice: number;
  walkingMinutes: number | null;
  month: string;
}

interface StationInfo {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

const LINE_COLORS: Record<string, string> = {
  EW: "#009645", CG: "#009645",
  NS: "#d42e12",
  NE: "#9900aa",
  CC: "#FA9E0D", CE: "#FA9E0D",
  DT: "#005ec4",
  TE: "#9D5B25",
};

function lineColor(code: string): string {
  for (const [prefix, color] of Object.entries(LINE_COLORS)) {
    if (code.startsWith(prefix)) return color;
  }
  return "#6b7280";
}

function fmtPrice(n: number) {
  return "$" + n.toLocaleString("en-SG");
}

function fmtPriceCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${Math.round(n / 1000)}k`;
}

function fmtMonth(m: string) {
  const [y, mo] = m.split("-");
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[parseInt(mo) - 1]} ${y}`;
}

function fmtWalk(min: number | null) {
  if (min == null) return "—";
  return `${Math.round(min)} min`;
}

export default function StationModal({
  stationCode,
  filters,
  onClose,
}: {
  stationCode: string;
  filters: Filters;
  onClose: () => void;
}) {
  const [station, setStation] = useState<StationInfo | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [mapSrc, setMapSrc] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeErr, setGeocodeErr] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({
      stationCode,
      flatType: filters.flatType,
      maxWalkMin: String(filters.maxWalkMin),
      minFloor: String(filters.minFloor),
      maxFloor: String(filters.maxFloor),
      months: String(filters.months),
      minLeaseYears: String(filters.minLeaseYears),
    });
    fetch(`/api/listings?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setStation(d.station ?? null);
        setListings(d.listings ?? []);
      })
      .finally(() => setLoading(false));
  }, [stationCode, filters]);

  const openDetail = async (listing: Listing) => {
    setSelected(listing);
    setMapSrc(null);
    setGeocodeErr(false);
    setGeocoding(true);
    try {
      const q = `${listing.block} ${listing.streetName}`;
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("not found");
      const { lat, lng } = await res.json();
      const mp = new URLSearchParams({
        lat: String(lat), lng: String(lng),
        slat: String(station?.lat ?? 0), slng: String(station?.lng ?? 0),
        label: q,
        sname: station?.name ?? "MRT",
      });
      setMapSrc(`/api/map?${mp}`);
    } catch {
      setGeocodeErr(true);
    } finally {
      setGeocoding(false);
    }
  };

  const color = lineColor(stationCode);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-[#1a1b2e] border border-white/[0.09] rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[88dvh] sm:max-h-[82dvh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/[0.07] shrink-0">
          {selected ? (
            <button
              onClick={() => { setSelected(null); setMapSrc(null); }}
              className="text-white/40 hover:text-white/70 transition-colors mr-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
          ) : null}
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: color, boxShadow: `0 0 8px 2px ${color}66` }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">
              {station?.name ?? stationCode} MRT
            </h2>
            {selected ? (
              <p className="text-white/35 text-xs mt-0.5 truncate">
                Blk {selected.block} {selected.streetName}
              </p>
            ) : (
              <p className="text-white/35 text-xs mt-0.5">
                {filters.flatType} · ≤{filters.maxWalkMin} min walk
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/65 transition-colors p-1 -mr-1 rounded-lg hover:bg-white/5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {selected ? (
            <DetailView
              listing={selected}
              mapSrc={mapSrc}
              geocoding={geocoding}
              geocodeErr={geocodeErr}
            />
          ) : (
            <ListingsView
              listings={listings}
              loading={loading}
              onSelect={openDetail}
              stationName={station?.name ?? stationCode}
              filters={filters}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ListingsView({
  listings,
  loading,
  onSelect,
  stationName,
  filters,
}: {
  listings: Listing[];
  loading: boolean;
  onSelect: (l: Listing) => void;
  stationName: string;
  filters: Filters;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-white/30 text-sm gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
        Loading listings…
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-white/30 text-sm gap-2 px-6 text-center">
        <span>No transactions found near {stationName} matching your filters.</span>
        <span className="text-xs text-white/20">Try relaxing the walk distance or time period.</span>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 space-y-2">
      <p className="text-white/30 text-xs mb-3">
        {listings.length} recent {filters.flatType} transaction{listings.length !== 1 ? "s" : ""} — tap to see on map
      </p>
      {listings.map((l, i) => (
        <button
          key={i}
          onClick={() => onSelect(l)}
          className="w-full text-left bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/[0.13] rounded-xl px-4 py-3.5 transition-all group"
        >
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="text-white/85 text-sm font-medium truncate">
                Blk {l.block} {l.streetName}
              </div>
              <div className="text-white/35 text-xs mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                <span>Floor {l.storeyMin}–{l.storeyMax}</span>
                <span className="text-white/15">·</span>
                <span>{fmtWalk(l.walkingMinutes)} walk</span>
                <span className="text-white/15">·</span>
                <span>{fmtMonth(l.month)}</span>
              </div>
            </div>
            <div className="text-right shrink-0 pl-1">
              <div className="text-emerald-300 font-semibold text-sm tabular-nums">{fmtPriceCompact(l.resalePrice)}</div>
              <div className="text-white/20 text-[10px] mt-0.5 group-hover:text-white/40 transition-colors whitespace-nowrap">
                View map →
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function DetailView({
  listing,
  mapSrc,
  geocoding,
  geocodeErr,
}: {
  listing: Listing;
  mapSrc: string | null;
  geocoding: boolean;
  geocodeErr: boolean;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Map area */}
      <div className="relative bg-[#171827]" style={{ height: 280 }}>
        {geocoding && (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
            Locating on map…
          </div>
        )}
        {geocodeErr && !geocoding && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/25 text-sm gap-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1 opacity-50">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Map unavailable for this address</span>
          </div>
        )}
        {mapSrc && (
          <iframe
            src={mapSrc}
            className="w-full h-full border-0"
            title="Listing location"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>

      {/* Stats */}
      <div className="px-5 py-4 space-y-3 border-t border-white/[0.07]">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Price" value={fmtPrice(listing.resalePrice)} highlight />
          <Stat label="Walk to MRT" value={fmtWalk(listing.walkingMinutes)} />
          <Stat label="Floor" value={`${listing.storeyMin}–${listing.storeyMax}`} />
          <Stat label="Sale month" value={fmtMonth(listing.month)} />
        </div>
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-3.5 py-2.5">
          <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">Address</p>
          <p className="text-white/70 text-sm">
            Blk {listing.block} {listing.streetName}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-3.5 py-2.5">
      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? "text-emerald-300" : "text-white/75"}`}>{value}</p>
    </div>
  );
}
