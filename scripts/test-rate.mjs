const blocks = [
  ["406", "ANG MO KIO AVE 10"],
  ["108", "ANG MO KIO AVE 4"],
  ["501", "TAMPINES ST 41"],
  ["201", "YISHUN ST 21"],
  ["1", "QUEENSWAY"],
  ["302", "WOODLANDS ST 31"],
  ["100", "BEDOK NORTH AVE 4"],
  ["3", "TECK WHYE CRES"],
  ["10", "BUONA VISTA DR"],
  ["50", "SERANGOON NORTH AVE 4"]
];

let ok=0, none=0, err=0;
for (const [block, street] of blocks) {
  const q = encodeURIComponent(block + " " + street);
  const url = "https://www.onemap.gov.sg/api/common/elastic/search?searchVal=" + q + "&returnGeom=Y&getAddrDetails=Y&pageNum=1";
  const res = await fetch(url);
  if (res.status === 429) { err++; console.log(block + " " + street + ": 429"); }
  else {
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { err++; console.log(block + " " + street + ": non-JSON"); continue; }
    const count = data.results?.length ?? 0;
    if (count === 0) { none++; console.log(block + " " + street + ": no results"); }
    else { ok++; console.log(block + " " + street + ": OK => " + data.results[0].ADDRESS); }
  }
  await Bun.sleep(800);
}
console.log("ok:" + ok + " none:" + none + " err:" + err);
