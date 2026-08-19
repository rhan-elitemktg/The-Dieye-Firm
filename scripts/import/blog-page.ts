/* One-time import: /blog/ — phase 5.
 *
 *   npx sanity exec scripts/import/blog-page.ts --with-user-token
 *
 * Three strings, and that is the whole page's copy: the posts are a collection,
 * the category chips derive from their slugs, and "All Posts" / "Load More
 * Posts" / "Featured Post" are chrome that stays in code.
 *
 * The eyebrow was BlogHeader's default prop rather than a string on the page —
 * one page's copy living in a component that three pages render. The prop is
 * required now and all three pass their own.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

const DOC = {
  "_id": "blogPage",
  "_type": "blogPage",
  "header": {
    "eyebrow": "News & Insights",
    "title": "Our Blog",
    "intro": "Clear, compassionate guidance on divorce, custody, support, and everything Texas families face - straight from Papa Dieye."
  }
};

async function run() {
  await client.createOrReplace(DOC);
  console.log("\u2713 blogPage written");
  await waitForPublic('count(*[_id == "blogPage"])', 1, "the page copy");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
