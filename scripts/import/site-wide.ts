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
 * The photo IS uploaded here. An earlier version of this script left it out on
 * the reasoning that papa-headshot-square.jpg was a shared design asset — that
 * was simply wrong. All three places it appears are Papa in an attorney
 * context: the article byline, the About page and the homepage guide offer. The
 * result was a `photo` field in the Studio that nothing read, so uploading a new
 * headshot changed nothing and looked like a broken CMS.
 */

import { getCliClient } from "sanity/cli";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

async function run() {
  const headshot = await client.assets.upload(
    "image",
    createReadStream(join(process.cwd(), "src/assets/images/papa-headshot-square.jpg")),
    { filename: "papa-headshot-square.jpg" },
  );
  console.log(`   uploaded headshot  ${headshot._id}`);

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
    _id: "attorney",
    _type: "attorney",
    name: "Papa Dieye",
    role: "Founding Attorney",
    photo: {
      _type: "image",
      asset: { _type: "reference", _ref: headshot._id },
    },
    rating: {
      score: "5.0",
      caption: "Over 150 five-star Google reviews",
    },
  });

  await tx.commit();
  console.log("✓ caseEvaluationForm + attorney written");

  await waitForPublic(
    'count(*[_id in ["caseEvaluationForm", "attorney"]])',
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
