#!/usr/bin/env node
/* Screenshot a page, or one element of it, from real headless Chrome.
 *
 *   npm run shot -- .hero
 *   npm run shot -- .faq --width 430 --out faq-mobile.png
 *   npm run shot -- --url http://localhost:4321/contact-us/
 *
 * Output lands in .screenshots/ (gitignored) unless --out gives a path.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { launch } from "./lib/headless.mjs";

/* Split `--name value` pairs out first; whatever is left over positionally is
   the selector. */
const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) flags[argv[i].slice(2)] = argv[++i];
  else positional.push(argv[i]);
}
const flag = (name, fallback) => flags[name] ?? fallback;

const selector = positional[0];
const url = flag("url", "http://localhost:4321/");
const width = Number(flag("width", 1440));
const height = Number(flag("height", 900));
const out = resolve(
  flag("out", `.screenshots/${(selector ?? "page").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}-${width}.png`),
);

const browser = await launch({ width, height });

try {
  await browser.goto(url);
  await browser.settle();

  let clip;
  if (selector) {
    clip = await browser.evaluate(`
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return null;
        // Stay at scroll 0 and let captureBeyondViewport reach the element —
        // scrolling it to the top drags the fixed header over it.
        window.scrollTo(0, 0);
        document.querySelector('astro-dev-toolbar')?.remove();
        const b = el.getBoundingClientRect();
        return { x: b.x + scrollX, y: b.y + scrollY, width: b.width, height: b.height, scale: 1 };
      })()
    `);
    if (!clip) throw new Error(`No element matched: ${selector}`);
  } else {
    await browser.evaluate(`document.querySelector('astro-dev-toolbar')?.remove()`);
  }

  const shot = await browser.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: Boolean(clip),
    ...(clip ? { clip } : {}),
  });

  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, Buffer.from(shot.result.data, "base64"));

  const size = clip ? ` ${Math.round(clip.width)}x${Math.round(clip.height)}` : "";
  console.log(`${out}${size}`);
} finally {
  await browser.close();
}
