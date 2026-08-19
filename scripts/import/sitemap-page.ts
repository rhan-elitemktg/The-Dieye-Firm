/* One-time import: sitemapPage — phase 5.
 *
 *   npx sanity exec scripts/import/sitemap-page.ts --with-user-token
 *
 * Only the header. Every row on this page is derived from the collections, so
 * the list maintains itself; the standfirst carries a {count} token rather than
 * a typed-in number.
 *
 * Strings extracted from the page and its components and diffed, never retyped.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

const DOC = {
  "_id": "sitemapPage",
  "_type": "sitemapPage",
  "header": {
    "kicker": "Legal",
    "title": "Site Map",
    "deckTemplate": "Every page on this site - {count} of them - in one list."
  }
};

async function run() {
  await client.createOrReplace(DOC);
  console.log("\u2713 sitemapPage written");
  await waitForPublic('count(*[_id == "sitemapPage"])', 1, "the page copy");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
