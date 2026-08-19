/* One-time import: notFoundPage — phase 5.
 *
 *   npx sanity exec scripts/import/not-found-page.ts --with-user-token
 *
 * Header, the five suggested routes, and the sentence before the phone number.
 * The number itself comes from firmDetails.
 *
 * Strings extracted from the page and its components and diffed, never retyped.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

const DOC = {
  "_id": "notFoundPage",
  "_type": "notFoundPage",
  "header": {
    "kicker": "404",
    "title": "We couldn't find that page",
    "deck": "The link may be out of date, or the address may have a typo in it. Here is the way back."
  },
  "routes": [
    {
      "_type": "route",
      "_key": "route-1",
      "label": "Practice Areas",
      "href": "/practice-areas/",
      "note": "All 32 areas of family law we handle"
    },
    {
      "_type": "route",
      "_key": "route-2",
      "label": "Service Areas",
      "href": "/harris-county-family-law-attorney/",
      "note": "Harris County, League City, Sugar Land and Pasadena"
    },
    {
      "_type": "route",
      "_key": "route-3",
      "label": "Blog",
      "href": "/blog/",
      "note": "Articles on divorce, custody and support in Texas"
    },
    {
      "_type": "route",
      "_key": "route-4",
      "label": "FAQs",
      "href": "/faq/",
      "note": "The questions we are asked most often"
    },
    {
      "_type": "route",
      "_key": "route-5",
      "label": "Site Map",
      "href": "/sitemap/",
      "note": "Every page on this site, in one list"
    }
  ],
  "callLead": "If you would rather just speak to someone, call us at"
};

async function run() {
  await client.createOrReplace(DOC);
  console.log("\u2713 notFoundPage written");
  await waitForPublic('count(*[_id == "notFoundPage"])', 1, "the page copy");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
