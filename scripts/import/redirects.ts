/* One-time import: vercel.json's `redirects` array -> `redirect` documents.
 *
 * ═══ Why ═══
 *
 * The 46 rules in vercel.json are 23 redirects written twice, once per slash
 * form — the old Scorpion URLs the site inherited. They work, but they are
 * developer-owned: the SEO team cannot see them, let alone add to them. Moving
 * them into Sanity gives that team ONE list, which is the whole point of the
 * redirect layer.
 *
 * ═══ The pairs collapse ═══
 *
 * Each source is stored ONCE here, without its trailing slash.
 * `bulk-redirects.json.ts` re-emits both forms on every build, so storing both
 * would produce four rules per redirect and trip the duplicate-source guard.
 * The two forms of every pair were checked to agree before this ran.
 *
 * ═══ Ids are deterministic ═══
 *
 * Derived from the source path so a re-run updates rather than duplicates —
 * the same shape the other importers here use. Note the sanitising: a Sanity
 * document id may not contain a DOT (it would make the id a path, and the
 * public read grant covers root-level ids only, so the document would be
 * invisible to the build while the Studio still showed it). Slashes go too.
 *
 *   npx sanity exec scripts/import/redirects.ts --with-user-token
 *   npx sanity exec scripts/import/redirects.ts --with-user-token -- --apply
 *
 * Without `--apply` it is a DRY RUN and writes nothing.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getCliClient } from "sanity/cli";

const apply = process.argv.includes("--apply");
const client = getCliClient({ apiVersion: "2025-08-15" });

type VercelRedirect = {
  source: string;
  destination: string;
  permanent?: boolean;
};

/** Comparison form: lowercase, one leading slash, no trailing slash. */
const norm = (path: string) =>
  path.trim().toLowerCase().replace(/\/+$/, "") || "/";

/** A stable, dot-free, slash-free document id for a source path. */
const idFor = (source: string) =>
  `redirect-${norm(source).slice(1).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

async function main() {
  const config = JSON.parse(
    readFileSync(join(process.cwd(), "vercel.json"), "utf8"),
  ) as { redirects?: VercelRedirect[] };

  const raw = config.redirects ?? [];
  if (!raw.length) {
    console.log("No redirects in vercel.json. Nothing to do.");
    return;
  }

  /* Collapse the slash pairs, and refuse to guess if a pair disagrees. */
  const bySource = new Map<string, VercelRedirect[]>();
  for (const rule of raw) {
    const key = norm(rule.source);
    bySource.set(key, [...(bySource.get(key) ?? []), rule]);
  }

  const conflicts = [...bySource.entries()].filter(([, forms]) => {
    const shapes = new Set(
      forms.map((f) => `${norm(f.destination)}|${f.permanent !== false}`),
    );
    return shapes.size > 1;
  });
  if (conflicts.length) {
    throw new Error(
      `These sources have two slash forms that disagree, so the right answer is not knowable here:\n  ${conflicts
        .map(([source]) => source)
        .join("\n  ")}`,
    );
  }

  const docs = [...bySource.entries()].map(([source, forms]) => ({
    _id: idFor(source),
    _type: "redirect" as const,
    source,
    destination: forms[0].destination,
    permanent: forms[0].permanent !== false,
  }));

  /* An id collision would silently merge two different redirects into one. */
  const ids = new Set(docs.map((d) => d._id));
  if (ids.size !== docs.length) {
    throw new Error("Two sources produced the same document id — widen idFor().");
  }

  console.log(
    `${raw.length} rules in vercel.json → ${docs.length} redirect documents.`,
  );

  const existing: string[] = await client.fetch(
    `*[_type == "redirect"]._id`,
  );
  const overwrites = docs.filter((d) => existing.includes(d._id));
  console.log(
    `${existing.length} redirect document(s) already in Sanity; ${overwrites.length} of these would be overwritten.`,
  );

  if (!apply) {
    console.log("\nDRY RUN — nothing written. Pass -- --apply to commit.\n");
    docs.slice(0, 5).forEach((d) =>
      console.log(`  ${d._id}\n    ${d.source} → ${d.destination}`),
    );
    if (docs.length > 5) console.log(`  … and ${docs.length - 5} more`);
    return;
  }

  /* One transaction: either all 23 land or none does. `createOrReplace` makes
     a re-run idempotent rather than a second copy of every rule. */
  const tx = client.transaction();
  docs.forEach((doc) => tx.createOrReplace(doc));
  await tx.commit({ visibility: "sync" });

  console.log(`\n✔ Wrote ${docs.length} redirect document(s).`);
  console.log(
    "Now DELETE the `redirects` array from vercel.json — two lists that mean\n" +
      "the same thing will drift, and the Studio one is the one editors can see.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
