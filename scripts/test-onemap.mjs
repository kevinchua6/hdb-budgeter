async function test(label, q) {
  const url = "https://www.onemap.gov.sg/api/common/elastic/search?searchVal=" + encodeURIComponent(q) + "&returnGeom=Y&getAddrDetails=Y&pageNum=1";
  try {
    const res = await fetch(url);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { console.log(label + ": NON-JSON (" + text.slice(0, 80) + ")"); return; }
    const count = data.results?.length ?? 0;
    const first = data.results?.[0];
    console.log(label + ": " + count + " results" + (first ? " => " + first.ADDRESS : ""));
  } catch(e) { console.log(label + ": ERROR " + e.message); }
  await Bun.sleep(200);
}
await test("block+street+SG", "406 ANG MO KIO AVE 10 SINGAPORE");
await test("block+street", "406 ANG MO KIO AVE 10");
await test("street only", "ANG MO KIO AVE 10");
await test("108 AMK AVE 4", "108 ANG MO KIO AVE 4");
await test("501 TAMPINES+SG", "501 TAMPINES ST 41 SINGAPORE");
await test("501 TAMPINES", "501 TAMPINES ST 41");
await test("TAMPINES ST 41", "TAMPINES ST 41");
await test("1 QUEENSWAY", "1 QUEENSWAY");
