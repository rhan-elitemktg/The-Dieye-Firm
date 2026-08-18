/* One-time import: the 14 client reviews -> Sanity `testimonial` documents.
 *
 *   npx sanity exec scripts/import/testimonials.ts --with-user-token
 *
 * Reads src/components/testimonials/reviews.ts, which was the reviewed artifact —
 * the three documented departures from verbatim are already applied there, and
 * re-harvesting from the live site would undo them.
 *
 * ⚠ THAT FILE IS DELETED in the same commit that made this script's output live,
 * so this will not run as-is. It is kept as the record of how the fourteen
 * documents were derived, and as the way back if the dataset is ever lost:
 *
 *     git show 38f4770:src/components/testimonials/reviews.ts \
 *       > src/components/testimonials/reviews.ts
 *     npx sanity exec scripts/import/testimonials.ts --with-user-token
 *     rm src/components/testimonials/reviews.ts
 *
 * Day to day the dataset is the source of truth and `sanity dataset export` is
 * the backup. This is the cold-start path.
 *
 * ── Why deterministic ids and createOrReplace ────────────────────────────────
 *
 * `_id` is derived from the source position rather than generated, and every
 * write is createOrReplace inside ONE transaction. That buys three things:
 *
 *   - Re-runnable. Run it thirty times while iterating and it converges on the
 *     same 14 documents instead of creating 420.
 *   - Referenceable before it exists. The homePage document points at six of
 *     these by id, so its import doesn't need a lookup table built from this
 *     run's output.
 *   - Atomic. A failure part-way leaves nothing half-written.
 *
 * Deliberately NOT `patch`/`setIfMissing`: those no-op against existing data and
 * report success while writing nothing, which is a failure mode that looks
 * exactly like success.
 *
 * ── orderRank ────────────────────────────────────────────────────────────────
 *
 * The wall on /testimonials/ renders in this order, and the order is editorial:
 * the comp lays the cards out column-major so the three desktop columns balance.
 * Ranks are assigned by source position with the same lexorank scheme the Studio
 * drag-handle uses, so an editor can reorder from the first day without a
 * backfill.
 */

import { getCliClient } from "sanity/cli";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

/* The module is plain TypeScript with no imports of its own, so it can be read
   and evaluated directly. Importing it would need a TS loader; extracting the
   array literal is simpler and has no build step. */
async function loadReviews(): Promise<
  { lead: string; body: string; name: string; matter: string }[]
> {
  const path = join(process.cwd(), "src/components/testimonials/reviews.ts");
  const source = readFileSync(path, "utf8");
  const start = source.indexOf("export const reviews");
  if (start === -1) throw new Error(`No 'export const reviews' in ${path}`);
  /* Anchor on the assignment, not on the first `[`. The declaration reads
     `export const reviews: Review[] = [`, so the first bracket after `start` is
     the one in the TYPE, and slicing from there evaluates to an empty array —
     which then fails the count check rather than importing nothing silently. */
  const eq = source.indexOf("=", start);
  const open = source.indexOf("[", eq);
  if (eq === -1 || open === -1) throw new Error(`Can't find the array literal in ${path}`);
  const body = source.slice(open);
  /* Evaluate just the array literal. It contains only string literals and
     object braces — no expressions, no imports. */
  const end = matchBracket(body);
  // eslint-disable-next-line no-new-func
  const arr = new Function(`return ${body.slice(0, end + 1)}`)();
  if (!Array.isArray(arr)) throw new Error("reviews.ts did not evaluate to an array");
  return arr;
}

/** Index of the `]` closing the `[` at position 0, ignoring brackets in strings. */
function matchBracket(s: string): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "[") depth++;
    else if (c === "]" && --depth === 0) return i;
  }
  throw new Error("Unbalanced brackets in reviews.ts");
}

/* Matches @sanity/orderable-document-list's scheme, so the Studio's drag handle
   inserts between these without a rebalance. */
const rank = (i: number) => `0|${String(i + 1).padStart(6, "0")}:`;

/* Stable, readable, and derived only from the source — so the same review keeps
   the same id across re-runs. Three reviews are signed "Former Client", so the
   position is part of the key.
 *
 * ⚠ NO DOTS IN A DOCUMENT ID. A `.` makes the id a PATH, and Sanity's public
 * read grant covers root-level ids only — the same mechanism that keeps
 * `drafts.foo` out of anonymous reads. `testimonial.01-kim` is therefore visible
 * to the authenticated CLI and INVISIBLE to the anonymous build, permanently,
 * with no error anywhere: the Studio shows the document, `sanity documents
 * query` shows the document, and the site renders as though the dataset were
 * empty. Verified directly — two documents written in the same transaction,
 * `probeAlpha-hyphen` public and `probeAlpha.dotted` not.
 *
 * Hyphens throughout. This applies to every import script in this migration. */
const idFor = (r: { name: string }, i: number) =>
  `testimonial-${String(i).padStart(2, "0")}-${r.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

async function run() {
  const reviews = await loadReviews();
  if (reviews.length !== 14) {
    throw new Error(
      `Expected 14 reviews, found ${reviews.length}. Fourteen is the complete published corpus — ` +
        `if that has genuinely changed, update the provenance note in testimonial.ts too.`,
    );
  }

  const tx = client.transaction();
  for (const [i, r] of reviews.entries()) {
    for (const field of ["lead", "body", "name", "matter"] as const) {
      if (!r[field]?.trim()) throw new Error(`Review ${i} (${r.name}) has an empty ${field}`);
    }
    tx.createOrReplace({
      _id: idFor(r, i),
      _type: "testimonial",
      orderRank: rank(i),
      lead: r.lead,
      body: r.body,
      name: r.name,
      matter: r.matter,
    });
  }

  await tx.commit();
  console.log(`✓ ${reviews.length} testimonials written`);
  for (const [i, r] of reviews.entries()) {
    console.log(`   ${idFor(r, i).padEnd(34)} ${r.name} · ${r.matter}`);
  }

  /* The build reads anonymously and the public path lags the authenticated one,
     so don't report success until the site can actually see these. */
  await waitForPublic(
    'count(*[_type == "testimonial"])',
    reviews.length,
    `${reviews.length} testimonials`,
  );
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
