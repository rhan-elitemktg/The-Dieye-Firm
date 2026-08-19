/* One-time import: /video-center/ — phase 5.
 *
 *   npx sanity exec scripts/import/video-center-page.ts --with-user-token
 *
 * Three strings. The nine videos are the `video` collection, in their drag
 * order, with runtimes fetched from Wistia at build time. The kicker and
 * standfirst here are authored by us, like /faq/'s.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

const DOC = {
  "_id": "videoCenterPage",
  "_type": "videoCenterPage",
  "header": {
    "eyebrow": "Watch & Learn",
    "title": "Video Center",
    "intro": "Straight answers on divorce, custody, and what to expect in a Texas courtroom - from Papa Dieye himself."
  }
};

async function run() {
  await client.createOrReplace(DOC);
  console.log("\u2713 videoCenterPage written");
  await waitForPublic('count(*[_id == "videoCenterPage"])', 1, "the page copy");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
