/* One-time import: /contact-us/ — phase 5.
 *
 *   npx sanity exec scripts/import/contact-page.ts --with-user-token
 *
 * Two bands, and they are the only two this page owns. The form between them is
 * `consultForm` (a record, on 93 pages) and the address below is `firmDetails`.
 * A comp once carried a wrong phone number for this firm, which is why the NAP
 * lives in one record rather than in page copy.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

const DOC = {
  "_id": "contactPage",
  "_type": "contactPage",
  "hero": {
    "eyebrow": "Contact Us",
    "title": "Let's Talk",
    "lead": "One conversation can bring clarity. Reach out for a free, confidential consultation - Papa reviews every inquiry personally."
  },
  "findUs": {
    "eyebrow": "Find Us",
    "headingLead": "Visit our",
    "headingAccent": "Pearland office."
  }
};

async function run() {
  await client.createOrReplace(DOC);
  console.log("\u2713 contactPage written");
  await waitForPublic('count(*[_id == "contactPage"])', 1, "the page copy");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
