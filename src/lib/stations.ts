export interface Station {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export const STATIONS = [
  // East-West Line
  { code: "EW1",  name: "Pasir Ris",       lat: 1.3731, lng: 103.9494 },
  { code: "EW2",  name: "Tampines",         lat: 1.3536, lng: 103.9453 },
  { code: "EW3",  name: "Simei",            lat: 1.3434, lng: 103.9529 },
  { code: "EW4",  name: "Tanah Merah",      lat: 1.3273, lng: 103.9456 },
  { code: "EW5",  name: "Bedok",            lat: 1.3240, lng: 103.9299 },
  { code: "EW6",  name: "Kembangan",        lat: 1.3207, lng: 103.9140 },
  { code: "EW7",  name: "Eunos",            lat: 1.3194, lng: 103.9032 },
  { code: "EW8",  name: "Paya Lebar",       lat: 1.3179, lng: 103.8922 },
  { code: "EW9",  name: "Aljunied",         lat: 1.3163, lng: 103.8832 },
  { code: "EW10", name: "Kallang",          lat: 1.3121, lng: 103.8716 },
  { code: "EW11", name: "Lavender",         lat: 1.3074, lng: 103.8637 },
  { code: "EW12", name: "Bugis",            lat: 1.3009, lng: 103.8556 },
  { code: "EW13", name: "City Hall",        lat: 1.2931, lng: 103.8520 },
  { code: "EW14", name: "Raffles Place",    lat: 1.2836, lng: 103.8515 },
  { code: "EW15", name: "Tanjong Pagar",    lat: 1.2766, lng: 103.8454 },
  { code: "EW16", name: "Outram Park",      lat: 1.2802, lng: 103.8399 },
  { code: "EW17", name: "Tiong Bahru",      lat: 1.2860, lng: 103.8268 },
  { code: "EW18", name: "Redhill",          lat: 1.2894, lng: 103.8167 },
  { code: "EW19", name: "Queenstown",       lat: 1.2942, lng: 103.8060 },
  { code: "EW20", name: "Commonwealth",     lat: 1.3024, lng: 103.7981 },
  { code: "EW21", name: "Buona Vista",      lat: 1.3069, lng: 103.7900 },
  { code: "EW22", name: "Dover",            lat: 1.3113, lng: 103.7786 },
  { code: "EW23", name: "Clementi",         lat: 1.3153, lng: 103.7655 },
  { code: "EW24", name: "Jurong East",      lat: 1.3331, lng: 103.7422 },
  { code: "EW25", name: "Chinese Garden",   lat: 1.3425, lng: 103.7322 },
  { code: "EW26", name: "Lakeside",         lat: 1.3444, lng: 103.7203 },
  { code: "EW27", name: "Boon Lay",         lat: 1.3388, lng: 103.7059 },
  { code: "EW28", name: "Pioneer",          lat: 1.3380, lng: 103.6967 },
  { code: "EW29", name: "Joo Koon",         lat: 1.3278, lng: 103.6783 },
  { code: "EW30", name: "Gul Circle",       lat: 1.3221, lng: 103.6609 },
  { code: "EW31", name: "Tuas Crescent",    lat: 1.3207, lng: 103.6484 },
  { code: "EW32", name: "Tuas West Road",   lat: 1.3310, lng: 103.6390 },
  { code: "EW33", name: "Tuas Link",        lat: 1.3412, lng: 103.6368 },
  // CG branch
  { code: "CG1",  name: "Expo",             lat: 1.3351, lng: 103.9613 },
  { code: "CG2",  name: "Changi Airport",   lat: 1.3591, lng: 103.9895 },
  // North-South Line
  { code: "NS1",  name: "Jurong East",      lat: 1.3331, lng: 103.7422 },
  { code: "NS2",  name: "Bukit Batok",      lat: 1.3491, lng: 103.7497 },
  { code: "NS3",  name: "Bukit Gombak",     lat: 1.3585, lng: 103.7512 },
  { code: "NS4",  name: "Choa Chu Kang",    lat: 1.3855, lng: 103.7440 },
  { code: "NS5",  name: "Yew Tee",          lat: 1.3972, lng: 103.7473 },
  { code: "NS7",  name: "Kranji",           lat: 1.4252, lng: 103.7618 },
  { code: "NS8",  name: "Marsiling",        lat: 1.4325, lng: 103.7740 },
  { code: "NS9",  name: "Woodlands",        lat: 1.4370, lng: 103.7864 },
  { code: "NS10", name: "Admiralty",        lat: 1.4408, lng: 103.8008 },
  { code: "NS11", name: "Sembawang",        lat: 1.4491, lng: 103.8202 },
  { code: "NS12", name: "Canberra",         lat: 1.4427, lng: 103.8295 },
  { code: "NS13", name: "Yishun",           lat: 1.4294, lng: 103.8354 },
  { code: "NS14", name: "Khatib",           lat: 1.4174, lng: 103.8329 },
  { code: "NS15", name: "Yio Chu Kang",     lat: 1.3818, lng: 103.8448 },
  { code: "NS16", name: "Ang Mo Kio",       lat: 1.3700, lng: 103.8494 },
  { code: "NS17", name: "Bishan",           lat: 1.3510, lng: 103.8483 },
  { code: "NS18", name: "Braddell",         lat: 1.3399, lng: 103.8469 },
  { code: "NS19", name: "Toa Payoh",        lat: 1.3327, lng: 103.8474 },
  { code: "NS20", name: "Novena",           lat: 1.3204, lng: 103.8438 },
  { code: "NS21", name: "Newton",           lat: 1.3122, lng: 103.8385 },
  { code: "NS22", name: "Orchard",          lat: 1.3044, lng: 103.8321 },
  { code: "NS23", name: "Somerset",         lat: 1.3008, lng: 103.8388 },
  { code: "NS24", name: "Dhoby Ghaut",      lat: 1.2990, lng: 103.8451 },
  { code: "NS25", name: "City Hall",        lat: 1.2931, lng: 103.8520 },
  { code: "NS26", name: "Raffles Place",    lat: 1.2836, lng: 103.8515 },
  { code: "NS27", name: "Marina Bay",       lat: 1.2762, lng: 103.8543 },
  { code: "NS28", name: "Marina South Pier",lat: 1.2709, lng: 103.8629 },
  // North-East Line
  { code: "NE1",  name: "HarbourFront",     lat: 1.2654, lng: 103.8200 },
  { code: "NE3",  name: "Outram Park",      lat: 1.2802, lng: 103.8399 },
  { code: "NE4",  name: "Chinatown",        lat: 1.2851, lng: 103.8444 },
  { code: "NE5",  name: "Clarke Quay",      lat: 1.2882, lng: 103.8461 },
  { code: "NE6",  name: "Dhoby Ghaut",      lat: 1.2990, lng: 103.8451 },
  { code: "NE7",  name: "Little India",     lat: 1.3064, lng: 103.8494 },
  { code: "NE8",  name: "Farrer Park",      lat: 1.3124, lng: 103.8551 },
  { code: "NE9",  name: "Boon Keng",        lat: 1.3196, lng: 103.8617 },
  { code: "NE10", name: "Potong Pasir",     lat: 1.3318, lng: 103.8688 },
  { code: "NE11", name: "Woodleigh",        lat: 1.3390, lng: 103.8710 },
  { code: "NE12", name: "Serangoon",        lat: 1.3497, lng: 103.8734 },
  { code: "NE13", name: "Kovan",            lat: 1.3596, lng: 103.8851 },
  { code: "NE14", name: "Hougang",          lat: 1.3715, lng: 103.8928 },
  { code: "NE15", name: "Buangkok",         lat: 1.3833, lng: 103.8930 },
  { code: "NE16", name: "Sengkang",         lat: 1.3917, lng: 103.8951 },
  { code: "NE17", name: "Punggol",          lat: 1.4053, lng: 103.9022 },
  // Circle Line
  { code: "CC1",  name: "Dhoby Ghaut",      lat: 1.2990, lng: 103.8451 },
  { code: "CC2",  name: "Bras Basah",       lat: 1.2969, lng: 103.8519 },
  { code: "CC3",  name: "Esplanade",        lat: 1.2931, lng: 103.8561 },
  { code: "CC4",  name: "Promenade",        lat: 1.2929, lng: 103.8616 },
  { code: "CC5",  name: "Nicoll Highway",   lat: 1.2989, lng: 103.8637 },
  { code: "CC6",  name: "Stadium",          lat: 1.3030, lng: 103.8760 },
  { code: "CC7",  name: "Mountbatten",      lat: 1.3070, lng: 103.8832 },
  { code: "CC8",  name: "Dakota",           lat: 1.3082, lng: 103.8869 },
  { code: "CC9",  name: "Paya Lebar",       lat: 1.3179, lng: 103.8922 },
  { code: "CC10", name: "MacPherson",       lat: 1.3267, lng: 103.8888 },
  { code: "CC11", name: "Tai Seng",         lat: 1.3355, lng: 103.8886 },
  { code: "CC12", name: "Bartley",          lat: 1.3424, lng: 103.8800 },
  { code: "CC13", name: "Serangoon",        lat: 1.3497, lng: 103.8734 },
  { code: "CC14", name: "Lorong Chuan",     lat: 1.3513, lng: 103.8640 },
  { code: "CC15", name: "Bishan",           lat: 1.3510, lng: 103.8483 },
  { code: "CC16", name: "Marymount",        lat: 1.3487, lng: 103.8396 },
  { code: "CC17", name: "Caldecott",        lat: 1.3374, lng: 103.8319 },
  { code: "CC19", name: "Botanic Gardens",  lat: 1.3162, lng: 103.8157 },
  { code: "CC20", name: "Farrer Road",      lat: 1.3172, lng: 103.8073 },
  { code: "CC21", name: "Holland Village",  lat: 1.3118, lng: 103.7959 },
  { code: "CC22", name: "Buona Vista",      lat: 1.3069, lng: 103.7900 },
  { code: "CC23", name: "one-north",        lat: 1.2995, lng: 103.7872 },
  { code: "CC24", name: "Kent Ridge",       lat: 1.2934, lng: 103.7844 },
  { code: "CC25", name: "Haw Par Villa",    lat: 1.2816, lng: 103.7826 },
  { code: "CC26", name: "Pasir Panjang",    lat: 1.2757, lng: 103.7930 },
  { code: "CC27", name: "Labrador Park",    lat: 1.2724, lng: 103.8021 },
  { code: "CC28", name: "Telok Blangah",    lat: 1.2707, lng: 103.8095 },
  { code: "CC29", name: "HarbourFront",     lat: 1.2654, lng: 103.8200 },
  // Downtown Line
  { code: "DT1",  name: "Bukit Panjang",    lat: 1.3785, lng: 103.7690 },
  { code: "DT2",  name: "Cashew",           lat: 1.3701, lng: 103.7731 },
  { code: "DT3",  name: "Hillview",         lat: 1.3625, lng: 103.7673 },
  { code: "DT5",  name: "Beauty World",     lat: 1.3411, lng: 103.7762 },
  { code: "DT6",  name: "King Albert Park", lat: 1.3361, lng: 103.7839 },
  { code: "DT7",  name: "Sixth Avenue",     lat: 1.3323, lng: 103.7961 },
  { code: "DT8",  name: "Tan Kah Kee",      lat: 1.3264, lng: 103.8071 },
  { code: "DT9",  name: "Botanic Gardens",  lat: 1.3162, lng: 103.8157 },
  { code: "DT10", name: "Stevens",          lat: 1.3192, lng: 103.8257 },
  { code: "DT11", name: "Newton",           lat: 1.3122, lng: 103.8385 },
  { code: "DT12", name: "Little India",     lat: 1.3064, lng: 103.8494 },
  { code: "DT13", name: "Rochor",           lat: 1.3010, lng: 103.8551 },
  { code: "DT14", name: "Bugis",            lat: 1.3009, lng: 103.8556 },
  { code: "DT15", name: "Promenade",        lat: 1.2929, lng: 103.8616 },
  { code: "DT16", name: "Bayfront",         lat: 1.2817, lng: 103.8617 },
  { code: "DT17", name: "Downtown",         lat: 1.2793, lng: 103.8527 },
  { code: "DT18", name: "Telok Ayer",       lat: 1.2817, lng: 103.8484 },
  { code: "DT19", name: "Chinatown",        lat: 1.2851, lng: 103.8444 },
  { code: "DT20", name: "Fort Canning",     lat: 1.2919, lng: 103.8441 },
  { code: "DT21", name: "Bencoolen",        lat: 1.2988, lng: 103.8496 },
  { code: "DT22", name: "Jalan Besar",      lat: 1.3054, lng: 103.8554 },
  { code: "DT23", name: "Bendemeer",        lat: 1.3138, lng: 103.8622 },
  { code: "DT24", name: "Geylang Bahru",    lat: 1.3215, lng: 103.8727 },
  { code: "DT25", name: "Mattar",           lat: 1.3244, lng: 103.8837 },
  { code: "DT26", name: "MacPherson",       lat: 1.3267, lng: 103.8888 },
  { code: "DT27", name: "Ubi",              lat: 1.3273, lng: 103.9004 },
  { code: "DT28", name: "Kaki Bukit",       lat: 1.3340, lng: 103.9096 },
  { code: "DT29", name: "Bedok North",      lat: 1.3344, lng: 103.9202 },
  { code: "DT30", name: "Bedok Reservoir",  lat: 1.3364, lng: 103.9324 },
  { code: "DT31", name: "Tampines West",    lat: 1.3456, lng: 103.9385 },
  { code: "DT32", name: "Tampines",         lat: 1.3536, lng: 103.9453 },
  { code: "DT33", name: "Tampines East",    lat: 1.3572, lng: 103.9544 },
  { code: "DT34", name: "Upper Changi",     lat: 1.3417, lng: 103.9611 },
  { code: "DT35", name: "Expo",             lat: 1.3351, lng: 103.9613 },
  // Thomson-East Coast Line
  { code: "TE1",  name: "Woodlands North",       lat: 1.4482, lng: 103.7852 },
  { code: "TE2",  name: "Woodlands",             lat: 1.4370, lng: 103.7864 },
  { code: "TE3",  name: "Woodlands South",       lat: 1.4218, lng: 103.7893 },
  { code: "TE4",  name: "Springleaf",            lat: 1.3992, lng: 103.8064 },
  { code: "TE5",  name: "Lentor",                lat: 1.3874, lng: 103.8327 },
  { code: "TE6",  name: "Mayflower",             lat: 1.3784, lng: 103.8346 },
  { code: "TE7",  name: "Bright Hill",           lat: 1.3692, lng: 103.8349 },
  { code: "TE8",  name: "Upper Thomson",         lat: 1.3544, lng: 103.8311 },
  { code: "TE9",  name: "Caldecott",             lat: 1.3374, lng: 103.8319 },
  { code: "TE11", name: "Stevens",               lat: 1.3192, lng: 103.8257 },
  { code: "TE12", name: "Napier",                lat: 1.2980, lng: 103.8195 },
  { code: "TE13", name: "Orchard Boulevard",     lat: 1.3039, lng: 103.8232 },
  { code: "TE14", name: "Orchard",               lat: 1.3044, lng: 103.8321 },
  { code: "TE15", name: "Great World",           lat: 1.2942, lng: 103.8297 },
  { code: "TE16", name: "Havelock",              lat: 1.2878, lng: 103.8361 },
  { code: "TE17", name: "Outram Park",           lat: 1.2802, lng: 103.8399 },
  { code: "TE18", name: "Maxwell",               lat: 1.2795, lng: 103.8448 },
  { code: "TE19", name: "Shenton Way",           lat: 1.2779, lng: 103.8484 },
  { code: "TE20", name: "Marina Bay",            lat: 1.2762, lng: 103.8543 },
  { code: "TE22", name: "Gardens by the Bay",    lat: 1.2797, lng: 103.8638 },
  { code: "TE23", name: "Tanjong Rhu",           lat: 1.3045, lng: 103.8739 },
  { code: "TE24", name: "Katong Park",           lat: 1.3015, lng: 103.8877 },
  { code: "TE25", name: "Tanjong Katong",        lat: 1.3033, lng: 103.9003 },
  { code: "TE26", name: "Marine Parade",         lat: 1.3030, lng: 103.9082 },
  { code: "TE27", name: "Marine Terrace",        lat: 1.3040, lng: 103.9145 },
  { code: "TE28", name: "Siglap",                lat: 1.3094, lng: 103.9234 },
  { code: "TE29", name: "Bayshore",              lat: 1.3177, lng: 103.9298 },
] as const satisfies readonly Station[];

export type StationCode = (typeof STATIONS)[number]["code"];

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

const MRT_LINES: readonly string[][] = [
  ["EW1","EW2","EW3","EW4","EW5","EW6","EW7","EW8","EW9","EW10","EW11","EW12","EW13","EW14","EW15","EW16","EW17","EW18","EW19","EW20","EW21","EW22","EW23","EW24","EW25","EW26","EW27","EW28","EW29","EW30","EW31","EW32","EW33"],
  ["EW4","CG1","CG2"],
  ["NS1","NS2","NS3","NS4","NS5","NS7","NS8","NS9","NS10","NS11","NS12","NS13","NS14","NS15","NS16","NS17","NS18","NS19","NS20","NS21","NS22","NS23","NS24","NS25","NS26","NS27","NS28"],
  ["NE1","NE3","NE4","NE5","NE6","NE7","NE8","NE9","NE10","NE11","NE12","NE13","NE14","NE15","NE16","NE17"],
  ["CC1","CC2","CC3","CC4","CC5","CC6","CC7","CC8","CC9","CC10","CC11","CC12","CC13","CC14","CC15","CC16","CC17","CC19","CC20","CC21","CC22","CC23","CC24","CC25","CC26","CC27","CC28","CC29"],
  ["DT1","DT2","DT3","DT5","DT6","DT7","DT8","DT9","DT10","DT11","DT12","DT13","DT14","DT15","DT16","DT17","DT18","DT19","DT20","DT21","DT22","DT23","DT24","DT25","DT26","DT27","DT28","DT29","DT30","DT31","DT32","DT33","DT34","DT35"],
  ["TE1","TE2","TE3","TE4","TE5","TE6","TE7","TE8","TE9","TE11","TE12","TE13","TE14","TE15","TE16","TE17","TE18","TE19","TE20","TE22","TE23","TE24","TE25","TE26","TE27","TE28","TE29"],
];

const CC_LINE_IDX = 4; // Circle Line wraps around

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
  let best = STATIONS[0];
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
