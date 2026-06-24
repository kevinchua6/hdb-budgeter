import { copyFileSync, existsSync } from "fs";
import { join } from "path";

if (process.platform !== "win32") process.exit(0);

const root = join(import.meta.dirname, "..", "node_modules", "@tailwindcss");
const src = join(root, "oxide-win32-x64-msvc", "tailwindcss-oxide.win32-x64-msvc.node");
const dest = join(root, "oxide", "tailwindcss-oxide.win32-x64-msvc.node");

if (existsSync(src) && !existsSync(dest)) {
  copyFileSync(src, dest);
  console.log("Copied oxide native binding into @tailwindcss/oxide");
}
