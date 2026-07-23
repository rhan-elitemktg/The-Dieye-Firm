#!/usr/bin/env node
/* Run a snippet of JS against a page in real headless Chrome and print what
 * it returns as JSON.
 *
 *   npm run probe -- scripts/checks/font-shift.js
 *   npm run probe -- scripts/checks/font-shift.js --width 430
 *   npm run probe -- --eval "document.querySelectorAll('.tcard').length"
 *
 * Unlike the in-app browser pane this page is not throttled, so requestAnimationFrame
 * runs — which is the only way to observe a CSS transition mid-flight.
 */

import { readFile } from "node:fs/promises";
import { launch } from "./lib/headless.mjs";

const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) flags[argv[i].slice(2)] = argv[++i];
  else positional.push(argv[i]);
}
const flag = (name, fallback) => flags[name] ?? fallback;

const file = positional[0];
const inline = flag("eval");
if (!file && !inline) {
  console.error("Pass a .js file or --eval \"<expression>\"");
  process.exit(1);
}

const expression = inline ?? (await readFile(file, "utf8"));
const browser = await launch({
  width: Number(flag("width", 1440)),
  height: Number(flag("height", 900)),
});

try {
  await browser.goto(flag("url", "http://localhost:4321/"));
  await browser.settle();
  console.log(JSON.stringify(await browser.evaluate(expression), null, 2));
} finally {
  await browser.close();
}
