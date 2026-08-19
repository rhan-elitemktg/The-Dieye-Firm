/* One-time import: thankYouPage — phase 5.
 *
 *   npx sanity exec scripts/import/thank-you-page.ts --with-user-token
 *
 * Two bands. The awards strip below them is a shared record, and this page
 * suppresses the consultation prompt because the visitor has just submitted it.
 *
 * Strings extracted from the page and its components and diffed, never retyped.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

const DOC = {
  "_id": "thankYouPage",
  "_type": "thankYouPage",
  "head": {
    "eyebrow": "Message Received",
    "title": "Thank You"
  },
  "band": {
    "headingLines": [
      "Your Family Law"
    ],
    "headingAccent": "Attorney",
    "headingTail": "in Pearland.",
    "lead": "While you wait, take a moment to learn how our firm walks alongside Texas families through their most difficult seasons. From divorce and child custody to support, property division, and modifications, Papa Dieye brings steady, plain-spoken counsel and a genuine commitment to protecting the people who matter most to you. Every case is handled personally, with the care and attention your family deserves at each step of the way.",
    "ctaLabel": "Meet the Attorney"
  }
};

async function run() {
  await client.createOrReplace(DOC);
  console.log("\u2713 thankYouPage written");
  await waitForPublic('count(*[_id == "thankYouPage"])', 1, "the page copy");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
