/* One-time import: the homepage's review SELECTIONS -> the `homePage` singleton.
 *
 *   npx sanity exec scripts/import/home-page.ts --with-user-token
 *
 * Run after scripts/import/testimonials.ts — it resolves references against the
 * documents that script writes.
 *
 * Two of the homepage's bands don't own their content, they choose it: Success
 * Stories shows six of the fourteen reviews, and the About section quotes a
 * seventh beside the video. Both choices were hardcoded in the components as
 * `pick(name, matter)` lookups that throw on a miss. This moves the choosing
 * into the document, where an editor can change it.
 *
 * The selections below are the ones the site renders today and are transcribed
 * from those components. The (name, matter) pairs are resolved against the
 * dataset rather than hardcoding document ids, and a miss throws — the same
 * invariant the components enforced, applied at import instead of at build.
 *
 * (name, matter) is the de-facto key and it is fragile: three reviews are signed
 * "Former Client" and are told apart only by matter. It is good enough for a
 * one-time resolve and is exactly why the selection becomes a reference here —
 * after this, nothing matches reviews by their text.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

/* Order matters — it is the order the six cards appear in.
 *
 * Two constraints behind this particular six, worth keeping if it is ever
 * re-picked: reviews whose pull quote is repeated word-for-word inside the body
 * are avoided, because on three cards side by side that repetition is the first
 * thing the eye catches; and Kim is deliberately absent because she is the About
 * section's pull quote and both bands render on this page. */
const SUCCESS_STORIES: [name: string, matter: string][] = [
  ["Kate", "Child Custody"],
  ["Former Client", "Divorce"],
  ["Cyndy", "Family Law"],
  ["Sharmain", "Divorce"],
  ["Osmin", "Divorce"],
  ["Former Client", "Family Law"],
];

/* Short enough that the video tile stays above the fold — a 50-word quote pushes
   it off. */
const ABOUT_PULL_QUOTE: [name: string, matter: string] = ["Kim", "Family Law"];

type Row = { _id: string; name: string; matter: string };

async function run() {
  const rows: Row[] = await client.fetch(
    `*[_type == "testimonial"]{ _id, name, matter }`,
  );
  if (!rows.length) {
    throw new Error(
      "No testimonial documents found. Run scripts/import/testimonials.ts first.",
    );
  }

  const resolve = ([name, matter]: [string, string]) => {
    const hits = rows.filter((r) => r.name === name && r.matter === matter);
    if (hits.length !== 1) {
      throw new Error(
        `Expected exactly one review for "${name} / ${matter}", found ${hits.length}. ` +
          `The homepage selection is transcribed from src/components/home/; if a review was ` +
          `renamed or re-categorised, update the list in this script.`,
      );
    }
    return hits[0]._id;
  };

  const picks = SUCCESS_STORIES.map(resolve);
  const pullQuote = resolve(ABOUT_PULL_QUOTE);

  if (picks.includes(pullQuote)) {
    throw new Error(
      "The About pull quote is also in Success Stories — the same review would print twice on the homepage.",
    );
  }

  await client.createOrReplace({
    _id: "homePage",
    _type: "homePage",
    about: {
      pullQuote: { _type: "reference", _ref: pullQuote },
    },
    testimonials: {
      /* _key is required on array members and must be stable across re-runs, so
         it is derived from the position rather than generated. */
      picks: picks.map((id, i) => ({
        _type: "reference",
        _ref: id,
        _key: `pick${i}`,
      })),
    },
  });

  console.log("✓ homePage written");
  console.log(`   about.pullQuote     ${pullQuote}`);
  picks.forEach((id, i) => console.log(`   testimonials.picks[${i}] ${id}`));

  /* Wait on the DEREFERENCED count, not on the document existing: homePage can
     be visible publicly while the testimonials it points at still aren't, which
     renders as a band with no cards. */
  await waitForPublic(
    'count(*[_id == "homePage"][0].testimonials.picks[]->_id)',
    picks.length,
    "the homepage's six reviews",
  );
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
