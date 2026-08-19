#!/usr/bin/env node
/* Diff the current build against the frozen pre-migration build.
 *
 *   npm run diff:baseline                      # every page, strict
 *   npm run diff:baseline -- --only family-law # just that subtree
 *   npm run diff:baseline -- --normalize       # ignore scope hashes + whitespace
 *   npm run diff:baseline -- --context 6       # more lines around each hunk
 *
 * This is the governing test for the Sanity content-modelling pass. Sixty-four
 * of the ninety-five pages are the client's own published prose, scraped from
 * dieyelaw.com, and they carry the SEO equity the whole site is built on. Moving
 * that prose from markdown into Sanity has to be provably invisible: the bytes
 * that reach the browser must not change.
 *
 * `.baseline/` is a copy of `dist/` taken before the migration started; the
 * commit it was built from is recorded in `.baseline/.BASELINE_COMMIT`. It is
 * gitignored, so a fresh clone has to rebuild it — and it must be rebuilt from a
 * commit with NO migration work in it, or the test silently starts comparing the
 * new world against itself and passes for the wrong reason.
 *
 * Exit code is 1 when anything differs, so it can gate a phase.
 *
 * ---- strict vs --normalize -------------------------------------------------
 *
 * Strict is the default because it is the only mode that can prove nothing moved.
 * Prefer it, and reach for --normalize only when a change is legitimately
 * structural — a component moved to a new file, say.
 *
 * --normalize drops three things:
 *
 *   1. `data-astro-cid-*` attributes. Astro derives that hash from a component's
 *      FILE PATH, not its contents, so editing a component does not move it —
 *      but renaming or relocating one changes it on every page that renders it,
 *      which reads as ninety-five failures for one rename.
 *   2. Whitespace between tags. Portable Text and markdown do not agree on where
 *      they put newlines inside a block, and no reader can tell the difference.
 *   3. The content hash in `/_astro/<name>.<hash>.<ext>`. Nine stylesheets are
 *      content-hashed, so ONE CSS edit renames a file and rewrites a <link> on
 *      every page that loads it — ninety-four "regressions" for one changed
 *      colour. The name and extension are kept, so a stylesheet that genuinely
 *      appears, vanishes or is loaded by a different page still shows up.
 *
 * It deliberately does NOT drop heading `id` attributes. Astro's markdown
 * renderer slugs every heading; astro-portabletext does not, so the Portable Text
 * renderer has to replicate the slug. Normalising those away would hide exactly
 * the regression this script exists to catch — a body anchor that stops resolving.
 */

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const BASE = join(ROOT, ".baseline");
const CURR = join(ROOT, "dist");

const argv = process.argv.slice(2);
const flags = {};
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) {
    const name = argv[i].slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) flags[name] = next, i++;
    else flags[name] = true;
  }
}
const only = typeof flags.only === "string" ? flags.only : null;
const normalize = Boolean(flags.normalize);
const context = Number(flags.context ?? 2);
const maxHunks = Number(flags.hunks ?? 3);

/* ------------------------------------------------------------------ helpers */

/* /admin is the Sanity Studio, injected by @sanity/astro. Its bundle is
   content-hashed and the hash moves whenever the schema changes — which is every
   commit of this migration — so including it would mean the diff never comes back
   clean and everyone learns to ignore a red result. It is also not a page we
   render: nothing in it is ours to prove. The site is 94 pages plus the Studio. */
const EXCLUDED = new Set(["admin/index.html"]);

function htmlFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) {
        const rel = relative(dir, full);
        if (!EXCLUDED.has(rel.split(sep).join("/"))) out.push(rel);
      }
    }
  };
  if (existsSync(dir)) walk(dir);
  return out.sort();
}

/* Split on tag boundaries so a diff points at markup, not at a 4,000-character
   single line. Every page is minified onto one line, so a raw line diff would
   report "line 1 differs" and tell you nothing. */
const lines = (html) =>
  (normalize
    ? html
        .replace(/\s+data-astro-cid-[a-z0-9-]+(="[^"]*")?/g, "")
        .replace(/(\/_astro\/[A-Za-z0-9_-]+)\.[A-Za-z0-9_-]{8}\.(css|js)\b/g, "$1.$2")
        .replace(/>\s+</g, "><")
    : html
  )
    .replace(/></g, ">\n<")
    .split("\n");

/* Smallest useful diff: walk from both ends, report what's left in the middle.
   Good enough to see what changed without pulling in a diff library. */
function hunks(a, b) {
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length - 1;
  let endB = b.length - 1;
  while (endA > start && endB > start && a[endA] === b[endB]) endA--, endB--;
  const from = Math.max(0, start - context);
  return {
    line: start + 1,
    before: a.slice(from, endA + 1 + context),
    after: b.slice(from, endB + 1 + context),
  };
}

const trim = (s) => (s.length > 200 ? s.slice(0, 200) + "…" : s);

/* --------------------------------------------------------------------- run */

if (!existsSync(BASE)) {
  console.error(
    "No .baseline/ found.\n" +
      "It is gitignored on purpose. Rebuild it from a commit with no migration\n" +
      "work in it:  git stash && npm run build && cp -R dist .baseline && git stash pop",
  );
  process.exit(2);
}
if (!existsSync(CURR)) {
  console.error("No dist/ found — run `npm run build` first.");
  process.exit(2);
}

const stamp = join(BASE, ".BASELINE_COMMIT");
if (existsSync(stamp)) {
  const [commit, built] = readFileSync(stamp, "utf8").trim().split("\n");
  console.log(`baseline  ${commit?.slice(0, 9)}  built ${built ?? "(unknown)"}`);
}
console.log(`mode      ${normalize ? "normalized" : "strict"}${only ? `  ·  only "${only}"` : ""}`);

const baseFiles = htmlFiles(BASE);
const currFiles = htmlFiles(CURR);
const match = (f) => !only || f.includes(only);

const baseSet = new Set(baseFiles);
const currSet = new Set(currFiles);
const removed = baseFiles.filter((f) => !currSet.has(f) && match(f));
const added = currFiles.filter((f) => !baseSet.has(f) && match(f));
const shared = baseFiles.filter((f) => currSet.has(f) && match(f));

const differing = [];
for (const file of shared) {
  const a = readFileSync(join(BASE, file), "utf8");
  const b = readFileSync(join(CURR, file), "utf8");
  if (a === b) continue;
  const la = lines(a);
  const lb = lines(b);
  if (normalize && la.join("\n") === lb.join("\n")) continue;
  differing.push({ file, ...hunks(la, lb) });
}

console.log(
  `\npages     ${shared.length} compared` +
    `  ·  ${shared.length - differing.length} identical` +
    `  ·  ${differing.length} differ` +
    (added.length ? `  ·  ${added.length} added` : "") +
    (removed.length ? `  ·  ${removed.length} removed` : ""),
);

for (const f of removed) console.log(`\n  GONE   /${f.split(sep).join("/")}`);
for (const f of added) console.log(`\n  NEW    /${f.split(sep).join("/")}`);

for (const d of differing.slice(0, maxHunks)) {
  console.log(`\n  DIFF   /${d.file.split(sep).join("/")}   (from element ${d.line})`);
  for (const l of d.before.slice(0, 8)) console.log(`    - ${trim(l)}`);
  for (const l of d.after.slice(0, 8)) console.log(`    + ${trim(l)}`);
}
if (differing.length > maxHunks) {
  console.log(`\n  …and ${differing.length - maxHunks} more:`);
  for (const d of differing.slice(maxHunks)) console.log(`    /${d.file.split(sep).join("/")}`);
}

const clean = !differing.length && !added.length && !removed.length;
console.log(`\n${clean ? "✓ byte-identical" : "✗ output changed"}\n`);
process.exit(clean ? 0 : 1);
