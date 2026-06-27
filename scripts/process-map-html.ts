// Reads reference/mrt map.html, adds data-station-code to each station <li>,
// and outputs public/mrt-map.html as a static file served at /mrt-map.html.
import { readFileSync, writeFileSync, mkdirSync } from "fs";

const html = readFileSync("reference/mrt map.html", "utf-8");

// Split on any <li> variant (including <li style="...">) and reassemble with data-station-code injected
const rawParts = html.split(/(<li(?:\s[^>]*)?>)/);
const result: string[] = [rawParts[0]];

for (let i = 1; i < rawParts.length; i += 2) {
  const liTag = rawParts[i];
  const content = rawParts[i + 1] ?? "";

  const dcMatch = content.match(/data-content="([^"]+)"/);
  if (dcMatch) {
    const dataContent = dcMatch[1];
    // Encoded form: stn-nr [line]-line'&gt;CODE&lt;/span&gt;
    const codeMatch = dataContent.match(/stn-nr [a-z]+-line'&gt;([a-z]+[0-9]+)&lt;\/span&gt;/);
    if (codeMatch) {
      const code = codeMatch[1].toUpperCase();
      result.push(liTag.replace(/^<li/, `<li data-station-code="${code}"`), content);
      continue;
    }
  }
  result.push(liTag, content);
}

const processed = result.join("");

mkdirSync("public", { recursive: true });
writeFileSync("public/mrt-map.html", processed);

console.log("Generated public/mrt-map.html");
