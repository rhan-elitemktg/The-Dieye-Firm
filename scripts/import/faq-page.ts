/* One-time import: /faq/ — phase 5.
 *
 *   npx sanity exec scripts/import/faq-page.ts --with-user-token
 *
 * Three strings. The nine questions are the `faq` collection, at full length;
 * the homepage renders six of them condensed, and the two wordings are meant to
 * disagree. This page's kicker and standfirst are OURS — the live page has a
 * bare "FAQ" banner and no intro copy at all — which is why they are on the
 * "authored, no comp behind it" list in HANDOFF.md.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

const DOC = {
  "_id": "faqPage",
  "_type": "faqPage",
  "header": {
    "eyebrow": "Common Questions",
    "title": "Frequently Asked Questions",
    "intro": "The questions Texas families ask most about divorce, custody and support - answered plainly, before you ever pick up the phone."
  }
};

async function run() {
  await client.createOrReplace(DOC);
  console.log("\u2713 faqPage written");
  await waitForPublic('count(*[_id == "faqPage"])', 1, "the page copy");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
