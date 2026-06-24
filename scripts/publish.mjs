#!/usr/bin/env node
// Render + publish a single brand icon and print its public URL. Idempotent:
// if already hosted, just prints the URL. This is the entry point the
// nearform-slides skill calls to ensure an icon exists before using it.
//
// Usage: node scripts/publish.mjs <name> [--color green|navy|white|#hex]
import { publish, rawUrl, colorFolder, isHosted, DEFAULT_COLOR, die } from "./lib.mjs";

const name = process.argv[2];
if (!name) die("usage: node scripts/publish.mjs <name> [--color green]");
const ci = process.argv.indexOf("--color");
const color = ci > -1 ? process.argv[ci + 1] : DEFAULT_COLOR;

if (!isHosted(name, color)) publish([{ name, color }]);
process.stdout.write(rawUrl(name, colorFolder(color)) + "\n");
