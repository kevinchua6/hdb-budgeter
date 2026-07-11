import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const lat  = parseFloat(p.get("lat")  ?? "0");
  const lng  = parseFloat(p.get("lng")  ?? "0");
  const slat = parseFloat(p.get("slat") ?? "0");
  const slng = parseFloat(p.get("slng") ?? "0");
  const label = (p.get("label") ?? "Listing").replace(/'/g, "\\'");
  const sname = (p.get("sname") ?? "MRT").replace(/'/g, "\\'");

  if (!lat || !lng || !slat || !slng) {
    return new Response("<html><body style='background:#171827;color:#fff;padding:1rem'>Invalid coordinates</body></html>", {
      headers: { "Content-Type": "text/html" },
    });
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body,html,#map{width:100%;height:100%;background:#171827}
    .leaflet-container{background:#1e2030}
  </style>
</head>
<body>
<div id="map"></div>
<script>
  const map = L.map('map',{zoomControl:true,attributionControl:false});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);

  const dot = (color, glow) => L.divIcon({
    html: '<div style="width:14px;height:14px;background:'+color+';border-radius:50%;border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 8px '+glow+'"></div>',
    iconSize:[14,14], iconAnchor:[7,7], className:''
  });

  L.marker([${lat},${lng}], {icon: dot('#34d399','rgba(52,211,153,0.7)')})
    .addTo(map).bindPopup('<b>${label}</b>').openPopup();
  L.marker([${slat},${slng}], {icon: dot('#60a5fa','rgba(96,165,250,0.7)')})
    .addTo(map).bindPopup('<b>${sname} MRT</b>');
  L.polyline([[${lat},${lng}],[${slat},${slng}]],{
    color:'#34d399',weight:2,dashArray:'6 5',opacity:0.65
  }).addTo(map);

  map.fitBounds(L.latLngBounds([[${lat},${lng}],[${slat},${slng}]]),{padding:[55,55]});
</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
