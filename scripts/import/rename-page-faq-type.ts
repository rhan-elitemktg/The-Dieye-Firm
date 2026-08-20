/* Rename the inline FAQ array member's `_type` from "faq" to "pageFaq".
 *
 * ═══ Why ═══
 *
 * `practiceArea.faqs[]` and `locationPage.faqs[]` declared an inline object
 * named `faq`, which is also the name of a global DOCUMENT type — the nine
 * site-wide FAQs behind /faq/. Sanity reports it as a configuration warning:
 * two different shapes share one name, and which one resolves is not something
 * you want to depend on. The inline object is {question, answer}; the document
 * adds shortAnswer, showOnHomepage and orderRank.
 *
 * ═══ Why this needs a data migration and not just a rename ═══
 *
 * The 140-odd existing array items carry `_type: "faq"` in the dataset. Rename
 * the schema member alone and the Studio finds no definition matching the
 * stored `_type` and renders every one of them as "Unknown type" — strictly
 * worse than the warning. Schema and data have to move together.
 *
 * The SITE is unaffected either way: both queries select
 * `faqs[]{ _key, question, answer }` and never filter on `_type`.
 *
 * ═══ Running it ═══
 *
 *     npx sanity exec scripts/import/rename-page-faq-type.ts --with-user-token
 *     npx sanity exec scripts/import/rename-page-faq-type.ts --with-user-token -- --apply
 *
 * Without `--apply` it is a DRY RUN and writes nothing. Re-running after a
 * successful pass is a no-op: it only touches items still typed "faq".
 */

import { getCliClient } from "sanity/cli";

const OLD = "faq";
const NEW = "pageFaq";

const apply = process.argv.includes("--apply");
const client = getCliClient({ apiVersion: "2025-08-15" });

type FaqItem = { _key: string; _type: string; question?: string };
type Doc = { _id: string; _type: string; faqs?: FaqItem[] };

async function main() {
  const docs: Doc[] = await client.fetch(
    `*[_type in ["practiceArea", "locationPage"] && count(faqs) > 0]{ _id, _type, faqs }`,
  );

  const stale = docs
    .map((d) => ({ ...d, hits: (d.faqs ?? []).filter((f) => f._type === OLD).length }))
    .filter((d) => d.hits > 0);

  const items = stale.reduce((n, d) => n + d.hits, 0);
  console.log(
    `${docs.length} documents carry FAQs; ${stale.length} still hold "${OLD}" items (${items} in total).`,
  );

  /* An item with no `_type` at all would silently stay broken after the
     rename, so say so rather than skipping it quietly. */
  const untyped = docs.flatMap((d) =>
    (d.faqs ?? []).filter((f) => !f._type).map((f) => `${d._id}[${f._key}]`),
  );
  if (untyped.length) {
    console.log(`\n⚠ ${untyped.length} item(s) have no _type at all:`);
    untyped.slice(0, 10).forEach((x) => console.log(`    ${x}`));
  }

  if (!stale.length) {
    console.log("\nNothing to do.");
    return;
  }

  if (!apply) {
    console.log("\nDRY RUN — nothing written. Pass -- --apply to commit.\n");
    stale.slice(0, 5).forEach((d) => console.log(`  ${d._id}  ${d.hits} item(s)`));
    if (stale.length > 5) console.log(`  … and ${stale.length - 5} more`);
    return;
  }

  /* One transaction: either every document moves or none does. Rewriting the
     whole array preserves `_key` and every other field — only `_type` moves. */
  const tx = client.transaction();
  for (const d of stale) {
    tx.patch(d._id, {
      set: {
        faqs: (d.faqs ?? []).map((f) =>
          f._type === OLD ? { ...f, _type: NEW } : f,
        ),
      },
    });
  }
  await tx.commit({ visibility: "sync" });
  console.log(`\n✔ Retyped ${items} item(s) across ${stale.length} document(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
