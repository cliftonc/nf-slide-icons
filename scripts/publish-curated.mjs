#!/usr/bin/env node
// Pre-render and publish the curated common icon set in every brand colour, in
// one push. Run once, and again after editing CURATED. Names outside this set
// still work — the skill publishes them on demand via publish.mjs.
//
// Usage: node scripts/publish-curated.mjs [--colors green,navy,white]
import { existsSync } from "node:fs";
import { join } from "node:path";
import { publish, SVG_DIR, BRAND_COLORS } from "./lib.mjs";

// ~240 icons covering most consulting / engineering / enterprise decks.
const CURATED = `
database server cloud cloud-cog hard-drive network globe globe-lock cpu microchip
binary terminal code code-xml braces git-branch git-merge git-pull-request
container boxes box package layers component blocks puzzle workflow waypoints
share-2 git-fork webhook radio-tower satellite-dish router cable plug zap
shield shield-check shield-alert shield-half lock lock-keyhole key key-round
fingerprint scan-face shield-question eye eye-off user-check badge-check
bot brain brain-circuit sparkles wand-2 bot-message-square message-square-code
circuit-board activity gauge gauge-circle radar scan-search search
users users-round user user-plus user-cog contact handshake briefcase
building building-2 factory landmark store warehouse hospital school
target crosshair flag goal trophy award medal rocket plane gem
trending-up trending-down chart-line chart-bar chart-bar-big chart-pie
chart-area chart-column chart-scatter chart-no-axes-combined presentation
calculator percent dollar-sign euro pound-sterling banknote coins wallet
credit-card receipt piggy-bank scale scale-3d gavel
file-text file-code file-check file-search file-spreadsheet files folder
folder-git-2 folder-open clipboard clipboard-check clipboard-list notebook-pen
book book-open library bookmark scroll stamp signature pen-tool
settings settings-2 sliders-horizontal wrench hammer cog drill
list list-checks list-todo check-check circle-check square-check
calendar calendar-check calendar-clock clock timer hourglass alarm-clock-check
mail mail-check send inbox at-sign phone phone-call headset megaphone
map map-pin navigation compass route milestone signpost truck ship
lightbulb flame star heart thumbs-up smile party-popper
refresh-cw repeat rotate-cw history undo-2 redo-2 arrow-up-right arrow-right
maximize minimize expand shrink move scaling fullscreen focus
layout-dashboard layout-grid panels-top-left table-2 kanban
plug-zap battery-charging power thermometer-sun leaf recycle wind sun
alert-triangle alert-circle info circle-help octagon-alert ban shield-x bug
filter funnel arrow-down-up shuffle split merge combine group ungroup
upload download cloud-upload cloud-download import hard-drive-upload
monitor smartphone tablet laptop server-cog monitor-smartphone app-window mouse-pointer-click
`.trim().split(/\s+/);

const ci = process.argv.indexOf("--colors");
const colors = ci > -1 ? process.argv[ci + 1].split(",") : Object.keys(BRAND_COLORS).filter((c) => c !== "deepgreen");

const names = [...new Set(CURATED)].filter((n) => existsSync(join(SVG_DIR, `${n}.svg`)));
const missing = [...new Set(CURATED)].filter((n) => !existsSync(join(SVG_DIR, `${n}.svg`)));
if (missing.length) process.stderr.write(`skipping ${missing.length} unknown name(s): ${missing.join(", ")}\n`);

const entries = [];
for (const color of colors) for (const name of names) entries.push({ name, color });
process.stdout.write(`publishing ${names.length} icons x ${colors.length} colours = ${entries.length} PNGs…\n`);
const pushed = publish(entries);
process.stdout.write(`done: ${pushed} new PNG(s) pushed (${entries.length - pushed} already hosted)\n`);
