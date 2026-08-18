/* One-time import: the sidebar enquiry card and the attorney record.
 *
 *   npx sanity exec scripts/import/site-wide.ts --with-user-token
 *
 * Strings transcribed from the components they were hardcoded in:
 * blog/CaseEvaluationCard.astro, blog/AuthorCard.astro, about/MeetPapa.astro
 * and home/FeaturedAttorney.astro.
 *
 * ⚠ ONE DELIBERATE CHANGE. The site described Papa as "Founding Attorney" on
 * two pages and "Principal & Founder" on eighty-five — the marketing pages and
 * the article byline had drifted apart because each hardcoded its own string.
 * Rhan chose "Founding Attorney" on 2026-08-18, so the byline changes on 85
 * pages. That is a content decision, not a regression.
 *
 * The photo is NOT uploaded here. papa-headshot-square.jpg is a design asset
 * that also appears in three non-attorney contexts, so it stays in src/assets
 * and the component keeps using it; the field exists for the day the firm wants
 * to swap it, and for a second attorney who would have no code asset at all.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

async function run() {
  const tx = client.transaction();

  tx.createOrReplace({
    _id: "caseEvaluationForm",
    _type: "caseEvaluationForm",
    heading: "Get a Case Evaluation",
    intro:
      "Tell us a little about your situation and Papa will personally review your request.",
    submitLabel: "Request Consultation",
    privacyNote: "Confidential & Privileged",
  });

  tx.createOrReplace({
    _id: "attorney-papa-dieye",
    _type: "attorney",
    name: "Papa Dieye",
    role: "Founding Attorney",
    rating: {
      score: "5.0",
      caption: "Over 150 five-star Google reviews",
    },
  });

  await tx.commit();
  console.log("✓ caseEvaluationForm + attorney written");

  await waitForPublic(
    'count(*[_id in ["caseEvaluationForm", "attorney-papa-dieye"]])',
    2,
    "the sidebar card and the attorney record",
  );
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
