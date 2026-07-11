export interface Station {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export const STATIONS = [
  // East-West Line
  { code: "EW1",  name: "Pasir Ris",       lat: 1.3730, lng: 103.9493 },
  { code: "EW2",  name: "Tampines",         lat: 1.3552, lng: 103.9430 },
  { code: "EW3",  name: "Simei",            lat: 1.3432, lng: 103.9534 },
  { code: "EW4",  name: "Tanah Merah",      lat: 1.3272, lng: 103.9463 },
  { code: "EW5",  name: "Bedok",            lat: 1.3240, lng: 103.9300 },
  { code: "EW6",  name: "Kembangan",        lat: 1.3210, lng: 103.9129 },
  { code: "EW7",  name: "Eunos",            lat: 1.3198, lng: 103.9032 },
  { code: "EW8",  name: "Paya Lebar",       lat: 1.3172, lng: 103.8923 },
  { code: "EW9",  name: "Aljunied",         lat: 1.3164, lng: 103.8829 },
  { code: "EW10", name: "Kallang",          lat: 1.3115, lng: 103.8714 },
  { code: "EW11", name: "Lavender",         lat: 1.3074, lng: 103.8628 },
  { code: "EW12", name: "Bugis",            lat: 1.3003, lng: 103.8556 },
  { code: "EW13", name: "City Hall",        lat: 1.2930, lng: 103.8525 },
  { code: "EW14", name: "Raffles Place",    lat: 1.2839, lng: 103.8515 },
  { code: "EW15", name: "Tanjong Pagar",    lat: 1.2766, lng: 103.8457 },
  { code: "EW16", name: "Outram Park",      lat: 1.2802, lng: 103.8401 },
  { code: "EW17", name: "Tiong Bahru",      lat: 1.2862, lng: 103.8270 },
  { code: "EW18", name: "Redhill",          lat: 1.2896, lng: 103.8167 },
  { code: "EW19", name: "Queenstown",       lat: 1.2946, lng: 103.8061 },
  { code: "EW20", name: "Commonwealth",     lat: 1.3025, lng: 103.7982 },
  { code: "EW21", name: "Buona Vista",      lat: 1.3063, lng: 103.7904 },
  { code: "EW22", name: "Dover",            lat: 1.3114, lng: 103.7786 },
  { code: "EW23", name: "Clementi",         lat: 1.3151, lng: 103.7652 },
  { code: "EW24", name: "Jurong East",      lat: 1.3330, lng: 103.7424 },
  { code: "EW25", name: "Chinese Garden",   lat: 1.3424, lng: 103.7326 },
  { code: "EW26", name: "Lakeside",         lat: 1.3443, lng: 103.7209 },
  { code: "EW27", name: "Boon Lay",         lat: 1.3386, lng: 103.7061 },
  { code: "EW28", name: "Pioneer",          lat: 1.3376, lng: 103.6973 },
  { code: "EW29", name: "Joo Koon",         lat: 1.3277, lng: 103.6784 },
  { code: "EW30", name: "Gul Circle",       lat: 1.3195, lng: 103.6605 },
  { code: "EW31", name: "Tuas Crescent",    lat: 1.3210, lng: 103.6491 },
  { code: "EW32", name: "Tuas West Road",   lat: 1.3300, lng: 103.6396 },
  { code: "EW33", name: "Tuas Link",        lat: 1.3409, lng: 103.6370 },
  // CG branch
  { code: "CG1",  name: "Expo",             lat: 1.3345, lng: 103.9615 },
  { code: "CG2",  name: "Changi Airport",   lat: 1.3575, lng: 103.9879 },
  // North-South Line
  { code: "NS1",  name: "Jurong East",      lat: 1.3330, lng: 103.7424 },
  { code: "NS2",  name: "Bukit Batok",      lat: 1.3490, lng: 103.7496 },
  { code: "NS3",  name: "Bukit Gombak",     lat: 1.3586, lng: 103.7518 },
  { code: "NS4",  name: "Choa Chu Kang",    lat: 1.3854, lng: 103.7444 },
  { code: "NS5",  name: "Yew Tee",          lat: 1.3975, lng: 103.7474 },
  { code: "NS7",  name: "Kranji",           lat: 1.4251, lng: 103.7621 },
  { code: "NS8",  name: "Marsiling",        lat: 1.4325, lng: 103.7741 },
  { code: "NS9",  name: "Woodlands",        lat: 1.4368, lng: 103.7861 },
  { code: "NS10", name: "Admiralty",        lat: 1.4406, lng: 103.8010 },
  { code: "NS11", name: "Sembawang",        lat: 1.4491, lng: 103.8200 },
  { code: "NS12", name: "Canberra",         lat: 1.4431, lng: 103.8297 },
  { code: "NS13", name: "Yishun",           lat: 1.4294, lng: 103.8350 },
  { code: "NS14", name: "Khatib",           lat: 1.4174, lng: 103.8330 },
  { code: "NS15", name: "Yio Chu Kang",     lat: 1.3818, lng: 103.8449 },
  { code: "NS16", name: "Ang Mo Kio",       lat: 1.3699, lng: 103.8496 },
  { code: "NS17", name: "Bishan",           lat: 1.3510, lng: 103.8501 },
  { code: "NS18", name: "Braddell",         lat: 1.3401, lng: 103.8468 },
  { code: "NS19", name: "Toa Payoh",        lat: 1.3326, lng: 103.8475 },
  { code: "NS20", name: "Novena",           lat: 1.3204, lng: 103.8438 },
  { code: "NS21", name: "Newton",           lat: 1.3126, lng: 103.8380 },
  { code: "NS22", name: "Orchard",          lat: 1.3040, lng: 103.8322 },
  { code: "NS23", name: "Somerset",         lat: 1.3003, lng: 103.8392 },
  { code: "NS24", name: "Dhoby Ghaut",      lat: 1.2989, lng: 103.8463 },
  { code: "NS25", name: "City Hall",        lat: 1.2930, lng: 103.8525 },
  { code: "NS26", name: "Raffles Place",    lat: 1.2839, lng: 103.8515 },
  { code: "NS27", name: "Marina Bay",       lat: 1.2763, lng: 103.8546 },
  { code: "NS28", name: "Marina South Pier",lat: 1.2710, lng: 103.8624 },
  // North-East Line
  { code: "NE1",  name: "HarbourFront",     lat: 1.2653, lng: 103.8206 },
  { code: "NE3",  name: "Outram Park",      lat: 1.2802, lng: 103.8401 },
  { code: "NE4",  name: "Chinatown",        lat: 1.2840, lng: 103.8431 },
  { code: "NE5",  name: "Clarke Quay",      lat: 1.2875, lng: 103.8461 },
  { code: "NE6",  name: "Dhoby Ghaut",      lat: 1.2989, lng: 103.8463 },
  { code: "NE7",  name: "Little India",     lat: 1.3072, lng: 103.8498 },
  { code: "NE8",  name: "Farrer Park",      lat: 1.3131, lng: 103.8548 },
  { code: "NE9",  name: "Boon Keng",        lat: 1.3199, lng: 103.8621 },
  { code: "NE10", name: "Potong Pasir",     lat: 1.3314, lng: 103.8694 },
  { code: "NE11", name: "Woodleigh",        lat: 1.3398, lng: 103.8710 },
  { code: "NE12", name: "Serangoon",        lat: 1.3510, lng: 103.8711 },
  { code: "NE13", name: "Kovan",            lat: 1.3599, lng: 103.8845 },
  { code: "NE14", name: "Hougang",          lat: 1.3703, lng: 103.8923 },
  { code: "NE15", name: "Buangkok",         lat: 1.3837, lng: 103.8930 },
  { code: "NE16", name: "Sengkang",         lat: 1.3917, lng: 103.8955 },
  { code: "NE17", name: "Punggol",          lat: 1.4045, lng: 103.9021 },
  // Circle Line
  { code: "CC1",  name: "Dhoby Ghaut",      lat: 1.2989, lng: 103.8463 },
  { code: "CC2",  name: "Bras Basah",       lat: 1.2969, lng: 103.8507 },
  { code: "CC3",  name: "Esplanade",        lat: 1.2937, lng: 103.8551 },
  { code: "CC4",  name: "Promenade",        lat: 1.2940, lng: 103.8604 },
  { code: "CC5",  name: "Nicoll Highway",   lat: 1.2998, lng: 103.8636 },
  { code: "CC6",  name: "Stadium",          lat: 1.3028, lng: 103.8753 },
  { code: "CC7",  name: "Mountbatten",      lat: 1.3062, lng: 103.8830 },
  { code: "CC8",  name: "Dakota",           lat: 1.3084, lng: 103.8893 },
  { code: "CC9",  name: "Paya Lebar",       lat: 1.3172, lng: 103.8923 },
  { code: "CC10", name: "MacPherson",       lat: 1.3268, lng: 103.8900 },
  { code: "CC11", name: "Tai Seng",         lat: 1.3351, lng: 103.8884 },
  { code: "CC12", name: "Bartley",          lat: 1.3424, lng: 103.8802 },
  { code: "CC13", name: "Serangoon",        lat: 1.3510, lng: 103.8711 },
  { code: "CC14", name: "Lorong Chuan",     lat: 1.3515, lng: 103.8648 },
  { code: "CC15", name: "Bishan",           lat: 1.3510, lng: 103.8501 },
  { code: "CC16", name: "Marymount",        lat: 1.3487, lng: 103.8394 },
  { code: "CC17", name: "Caldecott",        lat: 1.3373, lng: 103.8395 },
  { code: "CC19", name: "Botanic Gardens",  lat: 1.3224, lng: 103.8154 },
  { code: "CC20", name: "Farrer Road",      lat: 1.3174, lng: 103.8074 },
  { code: "CC21", name: "Holland Village",  lat: 1.3122, lng: 103.7964 },
  { code: "CC22", name: "Buona Vista",      lat: 1.3063, lng: 103.7904 },
  { code: "CC23", name: "one-north",        lat: 1.2998, lng: 103.7875 },
  { code: "CC24", name: "Kent Ridge",       lat: 1.2935, lng: 103.7846 },
  { code: "CC25", name: "Haw Par Villa",    lat: 1.2820, lng: 103.7820 },
  { code: "CC26", name: "Pasir Panjang",    lat: 1.2762, lng: 103.7914 },
  { code: "CC27", name: "Labrador Park",    lat: 1.2724, lng: 103.8034 },
  { code: "CC28", name: "Telok Blangah",    lat: 1.2707, lng: 103.8098 },
  { code: "CC29", name: "HarbourFront",     lat: 1.2653, lng: 103.8206 },
  // Downtown Line
  { code: "DT1",  name: "Bukit Panjang",    lat: 1.3796, lng: 103.7612 },
  { code: "DT2",  name: "Cashew",           lat: 1.3698, lng: 103.7643 },
  { code: "DT3",  name: "Hillview",         lat: 1.3629, lng: 103.7678 },
  { code: "DT5",  name: "Beauty World",     lat: 1.3409, lng: 103.7757 },
  { code: "DT6",  name: "King Albert Park", lat: 1.3359, lng: 103.7832 },
  { code: "DT7",  name: "Sixth Avenue",     lat: 1.3309, lng: 103.7969 },
  { code: "DT8",  name: "Tan Kah Kee",      lat: 1.3264, lng: 103.8065 },
  { code: "DT9",  name: "Botanic Gardens",  lat: 1.3224, lng: 103.8154 },
  { code: "DT10", name: "Stevens",          lat: 1.3201, lng: 103.8260 },
  { code: "DT11", name: "Newton",           lat: 1.3126, lng: 103.8380 },
  { code: "DT12", name: "Little India",     lat: 1.3072, lng: 103.8498 },
  { code: "DT13", name: "Rochor",           lat: 1.3039, lng: 103.8528 },
  { code: "DT14", name: "Bugis",            lat: 1.3003, lng: 103.8556 },
  { code: "DT15", name: "Promenade",        lat: 1.2940, lng: 103.8604 },
  { code: "DT16", name: "Bayfront",         lat: 1.2819, lng: 103.8591 },
  { code: "DT17", name: "Downtown",         lat: 1.2794, lng: 103.8528 },
  { code: "DT18", name: "Telok Ayer",       lat: 1.2821, lng: 103.8486 },
  { code: "DT19", name: "Chinatown",        lat: 1.2840, lng: 103.8431 },
  { code: "DT20", name: "Fort Canning",     lat: 1.2925, lng: 103.8443 },
  { code: "DT21", name: "Bencoolen",        lat: 1.2989, lng: 103.8504 },
  { code: "DT22", name: "Jalan Besar",      lat: 1.3052, lng: 103.8553 },
  { code: "DT23", name: "Bendemeer",        lat: 1.3137, lng: 103.8630 },
  { code: "DT24", name: "Geylang Bahru",    lat: 1.3213, lng: 103.8716 },
  { code: "DT25", name: "Mattar",           lat: 1.3269, lng: 103.8832 },
  { code: "DT26", name: "MacPherson",       lat: 1.3268, lng: 103.8900 },
  { code: "DT27", name: "Ubi",              lat: 1.3300, lng: 103.8992 },
  { code: "DT28", name: "Kaki Bukit",       lat: 1.3350, lng: 103.9085 },
  { code: "DT29", name: "Bedok North",      lat: 1.3347, lng: 103.9180 },
  { code: "DT30", name: "Bedok Reservoir",  lat: 1.3366, lng: 103.9322 },
  { code: "DT31", name: "Tampines West",    lat: 1.3455, lng: 103.9384 },
  { code: "DT32", name: "Tampines",         lat: 1.3552, lng: 103.9430 },
  { code: "DT33", name: "Tampines East",    lat: 1.3562, lng: 103.9546 },
  { code: "DT34", name: "Upper Changi",     lat: 1.3417, lng: 103.9615 },
  { code: "DT35", name: "Expo",             lat: 1.3345, lng: 103.9615 },
  // Thomson-East Coast Line
  { code: "TE1",  name: "Woodlands North",       lat: 1.4483, lng: 103.7857 },
  { code: "TE2",  name: "Woodlands",             lat: 1.4368, lng: 103.7861 },
  { code: "TE3",  name: "Woodlands South",       lat: 1.4274, lng: 103.7933 },
  { code: "TE4",  name: "Springleaf",            lat: 1.3976, lng: 103.8179 },
  { code: "TE5",  name: "Lentor",                lat: 1.3855, lng: 103.8357 },
  { code: "TE6",  name: "Mayflower",             lat: 1.3715, lng: 103.8366 },
  { code: "TE7",  name: "Bright Hill",           lat: 1.3633, lng: 103.8329 },
  { code: "TE8",  name: "Upper Thomson",         lat: 1.3544, lng: 103.8329 },
  { code: "TE9",  name: "Caldecott",             lat: 1.3373, lng: 103.8395 },
  { code: "TE11", name: "Stevens",               lat: 1.3201, lng: 103.8260 },
  { code: "TE12", name: "Napier",                lat: 1.3068, lng: 103.8190 },
  { code: "TE13", name: "Orchard Boulevard",     lat: 1.3024, lng: 103.8239 },
  { code: "TE14", name: "Orchard",               lat: 1.3040, lng: 103.8322 },
  { code: "TE15", name: "Great World",           lat: 1.2939, lng: 103.8337 },
  { code: "TE16", name: "Havelock",              lat: 1.2885, lng: 103.8336 },
  { code: "TE17", name: "Outram Park",           lat: 1.2802, lng: 103.8401 },
  { code: "TE18", name: "Maxwell",               lat: 1.2805, lng: 103.8439 },
  { code: "TE19", name: "Shenton Way",           lat: 1.2777, lng: 103.8504 },
  { code: "TE20", name: "Marina Bay",            lat: 1.2763, lng: 103.8546 },
  { code: "TE22", name: "Gardens by the Bay",    lat: 1.2785, lng: 103.8675 },
  { code: "TE23", name: "Tanjong Rhu",           lat: 1.2973, lng: 103.8735 },
  { code: "TE24", name: "Katong Park",           lat: 1.2978, lng: 103.8862 },
  { code: "TE25", name: "Tanjong Katong",        lat: 1.2993, lng: 103.8974 },
  { code: "TE26", name: "Marine Parade",         lat: 1.3026, lng: 103.9050 },
  { code: "TE27", name: "Marine Terrace",        lat: 1.3067, lng: 103.9151 },
  { code: "TE28", name: "Siglap",                lat: 1.3100, lng: 103.9300 },
  { code: "TE29", name: "Bayshore",              lat: 1.3131, lng: 103.9423 },
] as const satisfies readonly Station[];

export type StationCode = (typeof STATIONS)[number]["code"];

export const STATION_NAME: Record<string, string> = Object.fromEntries(
  STATIONS.map((s) => [s.code, s.name]),
);

// --- MRT lines (ordered), with display metadata ---

export interface MrtLine {
  id: string;
  name: string;
  shortName: string;
  color: string;
  codes: readonly string[];
}

export const LINES: readonly MrtLine[] = [
  { id: "EW", name: "East-West Line", shortName: "EW", color: "#009645",
    codes: ["EW1","EW2","EW3","EW4","EW5","EW6","EW7","EW8","EW9","EW10","EW11","EW12","EW13","EW14","EW15","EW16","EW17","EW18","EW19","EW20","EW21","EW22","EW23","EW24","EW25","EW26","EW27","EW28","EW29","EW30","EW31","EW32","EW33"] },
  { id: "CG", name: "Changi Airport Branch", shortName: "CG", color: "#009645",
    codes: ["EW4","CG1","CG2"] },
  { id: "NS", name: "North-South Line", shortName: "NS", color: "#d42e12",
    codes: ["NS1","NS2","NS3","NS4","NS5","NS7","NS8","NS9","NS10","NS11","NS12","NS13","NS14","NS15","NS16","NS17","NS18","NS19","NS20","NS21","NS22","NS23","NS24","NS25","NS26","NS27","NS28"] },
  { id: "NE", name: "North-East Line", shortName: "NE", color: "#9900aa",
    codes: ["NE1","NE3","NE4","NE5","NE6","NE7","NE8","NE9","NE10","NE11","NE12","NE13","NE14","NE15","NE16","NE17"] },
  { id: "CC", name: "Circle Line", shortName: "CC", color: "#FA9E0D",
    codes: ["CC1","CC2","CC3","CC4","CC5","CC6","CC7","CC8","CC9","CC10","CC11","CC12","CC13","CC14","CC15","CC16","CC17","CC19","CC20","CC21","CC22","CC23","CC24","CC25","CC26","CC27","CC28","CC29"] },
  { id: "DT", name: "Downtown Line", shortName: "DT", color: "#005ec4",
    codes: ["DT1","DT2","DT3","DT5","DT6","DT7","DT8","DT9","DT10","DT11","DT12","DT13","DT14","DT15","DT16","DT17","DT18","DT19","DT20","DT21","DT22","DT23","DT24","DT25","DT26","DT27","DT28","DT29","DT30","DT31","DT32","DT33","DT34","DT35"] },
  { id: "TE", name: "Thomson-East Coast Line", shortName: "TE", color: "#9D5B25",
    codes: ["TE1","TE2","TE3","TE4","TE5","TE6","TE7","TE8","TE9","TE11","TE12","TE13","TE14","TE15","TE16","TE17","TE18","TE19","TE20","TE22","TE23","TE24","TE25","TE26","TE27","TE28","TE29"] },
];

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- Commute graph ---

const MRT_LINES: readonly (readonly string[])[] = LINES.map((l) => l.codes);

const CC_LINE_IDX = LINES.findIndex((l) => l.id === "CC"); // Circle Line wraps around

type GraphEdge = { neighbor: string; weight: 0 | 1 };
let _graph: Map<string, GraphEdge[]> | null = null;

function buildGraph(): Map<string, GraphEdge[]> {
  if (_graph) return _graph;
  const graph = new Map<string, GraphEdge[]>();

  const addEdge = (a: string, b: string, weight: 0 | 1) => {
    if (!graph.has(a)) graph.set(a, []);
    if (!graph.has(b)) graph.set(b, []);
    graph.get(a)!.push({ neighbor: b, weight });
    graph.get(b)!.push({ neighbor: a, weight });
  };

  MRT_LINES.forEach((line, idx) => {
    for (let i = 0; i < line.length - 1; i++) addEdge(line[i], line[i + 1], 1);
    if (idx === CC_LINE_IDX) addEdge(line[line.length - 1], line[0], 1);
  });

  const byName = new Map<string, string[]>();
  for (const s of STATIONS) {
    if (!byName.has(s.name)) byName.set(s.name, []);
    byName.get(s.name)!.push(s.code);
  }
  for (const codes of byName.values()) {
    for (let i = 0; i < codes.length; i++)
      for (let j = i + 1; j < codes.length; j++)
        addEdge(codes[i], codes[j], 0);
  }

  _graph = graph;
  return graph;
}

export function lineColorForCode(code: string): string | undefined {
  return LINES.find((l) => l.codes.includes(code))?.color;
}

export function stopsFrom(originCodes: string[], maxStops: number): Map<string, number> {
  const graph = buildGraph();
  const dist = new Map<string, number>();
  const buckets: string[][] = Array.from({ length: maxStops + 1 }, () => []);

  for (const code of originCodes) {
    if (graph.has(code)) {
      dist.set(code, 0);
      buckets[0].push(code);
    }
  }

  for (let d = 0; d <= maxStops; d++) {
    for (const node of buckets[d]) {
      if ((dist.get(node) ?? Infinity) < d) continue;
      for (const { neighbor, weight } of graph.get(node) ?? []) {
        const nd = d + weight;
        if (nd <= maxStops && nd < (dist.get(neighbor) ?? Infinity)) {
          dist.set(neighbor, nd);
          buckets[nd].push(neighbor);
        }
      }
    }
  }

  return dist;
}

export const STATION_GROUPS: { name: string; codes: string[] }[] = (() => {
  const byName = new Map<string, string[]>();
  for (const s of STATIONS) {
    if (!byName.has(s.name)) byName.set(s.name, []);
    byName.get(s.name)!.push(s.code);
  }
  return [...byName.entries()]
    .map(([name, codes]) => ({ name, codes }))
    .sort((a, b) => a.name.localeCompare(b.name));
})();

export function nearestStation(lat: number, lng: number): { code: string; walkingMinutes: number } {
  let best: (typeof STATIONS)[number] = STATIONS[0];
  let bestDist = Infinity;
  for (const s of STATIONS) {
    const d = haversineMeters(lat, lng, s.lat, s.lng);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  const walkingMinutes = bestDist / 80; // 80 m/min walking speed
  return { code: best.code, walkingMinutes };
}
