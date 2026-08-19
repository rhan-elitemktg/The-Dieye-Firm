#!/usr/bin/env node
/* Guards the one rule the page singletons live by:
 *
 *     a section rendering on more than one page is a RECORD,
 *     a section rendering on exactly one page is that PAGE's copy
 *
 *   npm run check:page-copy
 *
 * ── Why this is a script and not a note in AGENTS.md ─────────────────────────
 *
 * The rule was written down, and then broken twice in two days. The Success
 * Stories band went into `homePage` and was caught by /about-us/ rendering it;
 * By the Numbers went into `aboutPage` and was caught by /practice-areas/. Both
 * times the page being migrated looked self-contained, because the component
 * that gave it away was imported by a DIFFERENT page nobody was reading at the
 * time. That is not a thing a person reliably remembers to check — it is a
 * graph query, so it should be one.
 *
 * The symptom, if it slips through: an editor opens "Home Page" to change a
 * heading and it changes on /about-us/ too. Nothing errors. The Studio has
 * simply told them something untrue about the site.
 *
 * ── What it does ────────────────────────────────────────────────────────────
 *
 * Walks `import ... from "*.astro"` from every page in src/pages/ to build the
 * transitive set of components each page renders, then flags any component that
 * reads a page singleton and appears under more than one page.
 *
 * Dynamic routes count as ONE page each. That is deliberate: [...slug].astro
 * renders 32 URLs, but they are one template, and a section on it is that
 * template's copy.
 *
 * ── The exception, and why it is hardcoded ───────────────────────────────────
 *
 * home/Faq.astro renders on the homepage and on /faq/, but /faq/ passes
 * `head={false}` and its own nine questions, so the fields modelled on
 * `homePage` — an eyebrow and a heading — really do appear on one page. The
 * rule is about the pages the FIELDS reach, which no import graph can see.
 * Anything added to this list needs the same kind of reason written beside it.
 */

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";

const ROOT = new URL("../..", import.meta.url).pathname;
const PAGES = join(ROOT, "src/pages");

/** Components whose page-singleton fields provably render on one page only. */
const EXEMPT = new Map([
  [
    "src/components/home/Faq.astro",
    "/faq/ passes head={false} and its own items, so the homePage eyebrow and heading render on the homepage only",
  ],
]);

/** How a component says which page singleton it reads. */
const READERS = [
  ["getHomePage", "homePage"],
  ["getAboutPage", "aboutPage"],
  ["getPracticeAreasPage", "practiceAreasPage"],
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (entry.endsWith(".astro")) out.push(path);
  }
  return out;
}

function importsOf(file) {
  const source = readFileSync(file, "utf8");
  const out = [];
  for (const match of source.matchAll(/^import\s+\w+\s+from\s+"([^"]+\.astro)"/gm)) {
    const target = resolve(dirname(file), match[1]);
    if (existsSync(target)) out.push(target);
  }
  return out;
}

function singletonRead(file) {
  const source = readFileSync(file, "utf8");
  return READERS.find(([helper]) => source.includes(helper))?.[1] ?? null;
}

const pageOf = new Map(); // component -> Set(page)
for (const page of walk(PAGES)) {
  const seen = new Set();
  const stack = importsOf(page);
  while (stack.length) {
    const component = stack.pop();
    if (seen.has(component)) continue;
    seen.add(component);
    stack.push(...importsOf(component));
  }
  for (const component of seen) {
    if (!pageOf.has(component)) pageOf.set(component, new Set());
    pageOf.get(component).add(relative(PAGES, page));
  }
}

const violations = [];
for (const [component, pages] of pageOf) {
  const singleton = singletonRead(component);
  if (!singleton || pages.size < 2) continue;
  const key = relative(ROOT, component);
  if (EXEMPT.has(key)) continue;
  violations.push({ key, singleton, pages: [...pages].sort() });
}

const checked = [...pageOf.keys()].filter((c) => singletonRead(c)).length;
console.log(`page-copy scope: ${checked} components read a page singleton, ${pageOf.size} components in the graph`);
for (const [key, why] of EXEMPT) console.log(`  exempt  ${key}\n          ${why}`);

if (!violations.length) {
  console.log("\n✓ every page singleton's copy renders on exactly one page");
  process.exit(0);
}

console.error("\n✗ page copy is rendering on more than one page:\n");
for (const v of violations) {
  console.error(`  ${v.key}`);
  console.error(`     reads ${v.singleton}, renders on ${v.pages.length}: ${v.pages.join(", ")}`);
  console.error(`     -> move those fields to a record in Site Settings, or exempt it here with a reason\n`);
}
process.exit(1);
