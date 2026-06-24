// Icon generation engine for nf-slide-icons. Recolour a Lucide SVG to a brand
// colour, rasterize to a transparent PNG via headless Chrome (no deps), and
// commit/push it. The scripts live IN the repo, so they operate on the repo's
// own working tree — no separate clone. The committed PNG is the cache.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SVG_DIR = join(REPO, "svg");
const CACHE = join(REPO, ".cache"); // gitignored scratch for the render HTML
const RENDER_PX = 512;

const GH_OWNER = "cliftonc";
const GH_REPO = "nf-slide-icons";
const GH_BRANCH = "main";
export const rawUrl = (name, folder) =>
  `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}/${folder}/${name}.png`;

// Nearform brand palette. Green is the default icon colour.
export const BRAND_COLORS = { green: "#00e5a4", navy: "#000e38", white: "#ffffff", deepgreen: "#07a06f" };
export const DEFAULT_COLOR = "green";

export function die(msg) { process.stderr.write(msg.replace(/\n?$/, "\n")); process.exit(1); }

function resolveColor(c) {
  if (!c) return BRAND_COLORS[DEFAULT_COLOR];
  if (/^#?[0-9a-fA-F]{6}$/.test(c)) return c.startsWith("#") ? c : `#${c}`;
  const hex = BRAND_COLORS[c.toLowerCase()];
  if (!hex) die(`unknown colour "${c}" (use ${Object.keys(BRAND_COLORS).join("/")} or a #hex)`);
  return hex;
}
// Folder name for a colour: the brand name, or "hex-rrggbb" for a custom hex.
export function colorFolder(color) {
  const c = (color ?? DEFAULT_COLOR).toLowerCase();
  return BRAND_COLORS[c] ? c : `hex-${resolveColor(color).replace("#", "")}`;
}
export const pngPath = (name, color) => join(REPO, colorFolder(color), `${name}.png`);
export const isHosted = (name, color) => existsSync(pngPath(name, color));

function chromeBin() {
  for (const c of [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium", "google-chrome", "chromium",
  ]) { try { execFileSync(c, ["--version"], { stdio: "ignore" }); return c; } catch {} }
  die("no Chrome/Chromium found for rasterizing icons");
}

// Render a recoloured transparent PNG straight into its colour folder.
export function render(name, color = DEFAULT_COLOR, px = RENDER_PX) {
  const svg = join(SVG_DIR, `${name}.svg`);
  if (!existsSync(svg)) die(`no icon "${name}" in svg/ (browse: ls svg)`);
  const folder = colorFolder(color);
  const out = pngPath(name, color);
  mkdirSync(dirname(out), { recursive: true });
  mkdirSync(CACHE, { recursive: true });
  // Lucide icons are stroke="currentColor", fill="none" — CSS color recolours them.
  const body = readFileSync(svg, "utf8").replace(/width="24"/, "").replace(/height="24"/, "");
  const htmlPath = join(CACHE, `${folder}__${name}.html`);
  writeFileSync(htmlPath, `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:transparent}
    svg{width:${px}px;height:${px}px;color:${resolveColor(color)};display:block}
  </style></head><body>${body}</body></html>`);
  execFileSync(chromeBin(), [
    "--headless=new", "--disable-gpu", "--hide-scrollbars",
    "--default-background-color=00000000", "--force-device-scale-factor=2",
    `--window-size=${px},${px}`, `--screenshot=${out}`, `file://${htmlPath}`,
  ], { stdio: "ignore" });
  if (!existsSync(out)) die(`rasterize failed for "${name}"`);
  return out;
}

function git(args, opts = {}) {
  return execFileSync("git", args, { cwd: REPO, encoding: "utf8", stdio: opts.stdio ?? "pipe" });
}

// Render any not-yet-hosted entries [{name,color}] and push them in one commit.
// Returns the number newly pushed. Idempotent: already-hosted entries are no-ops.
export function publish(entries) {
  const todo = entries.filter((e) => !isHosted(e.name, e.color));
  if (!todo.length) return 0;
  try { git(["pull", "--ff-only"], { stdio: "ignore" }); } catch {}
  for (const e of todo) render(e.name, e.color);
  git(["add", "."]);
  git(["commit", "-m", `add ${todo.length} icon(s)`], { stdio: "ignore" });
  git(["push", "origin", GH_BRANCH], { stdio: "ignore" });
  return todo.length;
}
