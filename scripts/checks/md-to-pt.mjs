#!/usr/bin/env node
/* Prove the markdown -> Portable Text converter loses nothing.
 *
 *   node scripts/checks/md-to-pt.mjs
 *   node scripts/checks/md-to-pt.mjs --verbose      # show every mismatch in full
 *
 * The 80 markdown files are the client's own published prose, scraped from
 * dieyelaw.com, and they are the reason this whole migration needs proving: they
 * carry the SEO equity the site is built on. So the converter is not tested
 * against fixtures anybody wrote — it is tested against the BASELINE BUILD.
 *
 * For each file: convert the markdown to Portable Text, render that back to
 * HTML, and compare it to the article body Astro actually produced in
 * .baseline/. If the two match on all 80, the conversion provably preserves
 * every heading, paragraph, list item, link and bold run on the site.
 *
 * ---- WHAT THIS PROVES, AND WHAT IT DOES NOT --------------------------------
 *
 * It proves the CONVERSION is lossless: every heading, paragraph, list item,
 * link and bold run in the markdown survives into Portable Text, because the
 * blocks can be rendered back into the exact HTML Astro produced.
 *
 * It does NOT prove astro-portabletext renders those blocks the same way. The
 * renderer below is an independent implementation, which is what makes it
 * evidence rather than a tautology — but the two can legitimately disagree on
 * details the data doesn't fix. One real example: a span carrying BOTH a bold
 * decorator and a link. This file emits `<strong><a>…</a></strong>`, matching
 * markdown; astro-portabletext emits `<a><strong>…</strong></a>`. Same data,
 * same appearance, inverted nesting — and it occurs three times, on one page.
 *
 * That gap is covered by the other half of the pair: `npm run diff:baseline`
 * compares the BUILT site against the pre-migration build, so a rendering
 * difference shows up there. Neither check is sufficient alone.
 *
 * ---- this file is also a specification for the renderer ---------------------
 *
 * `renderBlocks()` below emits exactly the markup satteri emits, heading ids
 * included. The Astro Portable Text components must produce the same thing, so
 * whatever this function does is the contract they have to meet. Keeping it here
 * rather than importing the real renderer is deliberate: an independent
 * implementation that agrees with the baseline is evidence, whereas the renderer
 * checking itself is not.
 *
 * ---- heading ids ------------------------------------------------------------
 *
 * Astro slugs every markdown heading — `<h2 id="what-is-a-qdro">` — via
 * github-slugger, ONE Slugger per document, so a repeated heading gets `-1`
 * appended. astro-portabletext does none of that. Nothing on the site links to
 * these fragments today (the only href="#…" in dist/ are SVG defs and the video
 * bundle), so they are search surface rather than navigation — but they are in
 * Google's index of the live pages, and they cost twenty lines to keep.
 */

import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";
import GithubSlugger from "github-slugger";
import { markdownToPortableText } from "../lib/md-to-pt.mjs";
import { sliceElement } from "../lib/html.mjs";

const ROOT = new URL("../..", import.meta.url).pathname;
const BASE = join(ROOT, ".baseline");
const verbose = process.argv.includes("--verbose");

/* ------------------------------------------------------- content -> route */

/* The content file path IS the route, with one exception each side. */
function routeFor(file) {
  const rel = file.replace(/^src\/content\//, "").replace(/\.md$/, "");
  const [collection, ...rest] = rel.split("/");
  const id = rest.join("/");
  if (collection === "blog") return `blog/${id}`;
  if (collection === "locations") return id;
  /* practice-areas: the section root renders at /family-law/, not
     /family-law/family-law/ — its id is the section prefix itself. */
  if (collection === "practice-areas") return id === "family-law" ? "family-law" : `family-law/${id}`;
  throw new Error(`Unknown collection "${collection}" for ${file}`);
}

const BODY_CLASS = {
  blog: "post__body",
  locations: "loc__body",
  "practice-areas": "pa__body",
};

/* ------------------------------------------------------------- rendering */

const esc = (s) =>
  s.replace(/&/g, "&#38;").replace(/</g, "&#60;").replace(/>/g, "&#62;");

/* Astro escapes text with numeric entities in some positions and named in
   others; normalise both sides rather than trying to predict it. */
const canonical = (html) =>
  html
    .replace(/&#38;|&amp;/g, "&")
    .replace(/&#60;|&lt;/g, "<")
    .replace(/&#62;|&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#34;|&quot;/g, '"')
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();

/* Render a run of spans, wrapping each mark around the LONGEST run of adjacent
   spans that share it.
 *
 * Wrapping span by span would be wrong, not just ugly. `**[Prenuptial](/a/) and
 * [Postnuptial](/b/)**` is three spans that all carry `strong`, two of which also
 * carry a link. Per-span wrapping emits
 *   <strong><a>Prenuptial</a></strong><strong> and </strong><strong><a>…</a></strong>
 * where markdown produces one <strong> around the whole phrase. Three of the 80
 * pages contain exactly this and nothing else distinguishes them.
 *
 * Decorators are taken before link keys so a link nests INSIDE bold, matching
 * the source order — <strong><a>…</a></strong>, never the reverse. */
const MARK_ORDER = ["strong", "em"];

function renderRun(spans, applied, defs) {
  let out = "";
  let i = 0;
  while (i < spans.length) {
    const remaining = (spans[i].marks ?? []).filter((m) => !applied.includes(m));
    if (!remaining.length) {
      out += esc(spans[i].text);
      i++;
      continue;
    }
    /* Decorators first, then whichever link this span carries. */
    const mark =
      MARK_ORDER.find((m) => remaining.includes(m)) ??
      remaining.find((m) => defs.has(m)) ??
      remaining[0];

    let end = i + 1;
    while (end < spans.length && (spans[end].marks ?? []).includes(mark)) end++;

    const inner = renderRun(spans.slice(i, end), [...applied, mark], defs);
    out += defs.has(mark)
      ? `<a href="${esc(defs.get(mark).href)}">${inner}</a>`
      : `<${mark}>${inner}</${mark}>`;
    i = end;
  }
  return out;
}

function renderSpans(block) {
  const defs = new Map((block.markDefs ?? []).map((d) => [d._key, d]));
  return renderRun(block.children ?? [], [], defs);
}

const plain = (block) => (block.children ?? []).map((s) => s.text).join("");

export function renderBlocks(blocks) {
  const slugger = new GithubSlugger();
  let out = "";
  let openList = null;

  const closeList = () => {
    if (openList) out += `</${openList}>`;
    openList = null;
  };

  for (const block of blocks) {
    if (block.listItem) {
      const tag = block.listItem === "number" ? "ol" : "ul";
      if (openList !== tag) {
        closeList();
        out += `<${tag}>`;
        openList = tag;
      }
      out += `<li>${renderSpans(block)}</li>`;
      continue;
    }
    closeList();

    const style = block.style ?? "normal";
    if (style === "normal") out += `<p>${renderSpans(block)}</p>`;
    else if (style === "blockquote") out += `<blockquote><p>${renderSpans(block)}</p></blockquote>`;
    else out += `<${style} id="${slugger.slug(plain(block))}">${renderSpans(block)}</${style}>`;
  }
  closeList();
  return out;
}

/* ------------------------------------------------------------------- run */

if (!existsSync(BASE)) {
  console.error("No .baseline/ — see scripts/diff-baseline.mjs.");
  process.exit(2);
}

const files = execSync("find src/content -name '*.md'", { cwd: ROOT })
  .toString()
  .trim()
  .split("\n")
  .sort();

let ok = 0;
const failures = [];
const missing = [];

for (const file of files) {
  const collection = file.split("/")[2];
  const route = routeFor(file);
  const page = join(BASE, route, "index.html");
  if (!existsSync(page)) {
    missing.push(route);
    continue;
  }

  const raw = readFileSync(join(ROOT, file), "utf8");
  let rendered;
  try {
    rendered = renderBlocks(await markdownToPortableText(raw, file));
  } catch (err) {
    failures.push({ route, reason: `converter threw: ${err.message}` });
    continue;
  }

  const html = readFileSync(page, "utf8");
  const expected = sliceElement(
    html,
    new RegExp(`<div class="prose ${BODY_CLASS[collection]}"[^>]*>`),
    "div",
  );
  if (expected === null) {
    failures.push({ route, reason: `no .${BODY_CLASS[collection]} found in the baseline` });
    continue;
  }

  const a = canonical(expected);
  const b = canonical(rendered);
  if (a === b) {
    ok++;
    continue;
  }

  /* Report the first divergence, with a little context either side. */
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  failures.push({
    route,
    reason: `differs at character ${i}`,
    expected: a.slice(Math.max(0, i - 60), i + 120),
    got: b.slice(Math.max(0, i - 60), i + 120),
  });
}

console.log(`\nmd -> Portable Text -> HTML, against .baseline/\n`);
console.log(`  ${ok}/${files.length} bodies identical`);
if (missing.length) console.log(`  ${missing.length} pages not in the baseline: ${missing.join(", ")}`);

for (const f of failures.slice(0, verbose ? failures.length : 5)) {
  console.log(`\n  ✗ /${f.route}/  — ${f.reason}`);
  if (f.expected !== undefined) {
    console.log(`      baseline: …${f.expected}…`);
    console.log(`      ours:     …${f.got}…`);
  }
}
if (!verbose && failures.length > 5) {
  console.log(`\n  …and ${failures.length - 5} more (pass --verbose)`);
}

const clean = failures.length === 0 && missing.length === 0;
console.log(`\n${clean ? "✓ converter preserves every body" : "✗ conversion is lossy"}\n`);
process.exit(clean ? 0 : 1);
