// Reads reference/mrt map.html, adds data-station-code to each station <li>,
// and outputs public/mrt-map.html as a static file served at /mrt-map.html.
import { readFileSync, writeFileSync, mkdirSync } from "fs";

const html = readFileSync("reference/mrt map.html", "utf-8");

// Split on every <li ...> open tag (some carry inline style attributes) and
// reassemble with data-station-code injected. Escaped popups use &lt;li&gt;,
// so the split never lands inside data-content.
const parts = html.split(/(<li[^>]*>)/);
const result: string[] = [];

for (let i = 0; i < parts.length; i++) {
  const part = parts[i];
  const liMatch = part.match(/^<li([^>]*)>$/);
  if (liMatch && i + 1 < parts.length) {
    const dcMatch = parts[i + 1].match(/data-content="([^"]+)"/);
    if (dcMatch) {
      // Encoded form: stn-nr [line]-line'&gt;CODE&lt;/span&gt;
      const codeMatch = dcMatch[1].match(/stn-nr [a-z]+-line'&gt;([a-z]+[0-9]+)&lt;\/span&gt;/);
      if (codeMatch) {
        let code = codeMatch[1].toUpperCase();
        // The source map's Woodleigh popup wrongly carries Kovan's code
        const nameMatch = dcMatch[1].match(/h2 class='h6'&gt;([^&]+)&lt;/);
        if (nameMatch?.[1] === "Woodleigh" && code === "NE13") code = "NE11";
        result.push(`<li data-station-code="${code}"${liMatch[1]}>`);
        continue;
      }
    }
  }
  result.push(part);
}

const processed = result.join("");

mkdirSync("public", { recursive: true });
writeFileSync("public/mrt-map.html", processed);

console.log("Generated public/mrt-map.html");
