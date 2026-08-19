/* One-time import: /testimonials/ — phase 5.
 *
 *   npx sanity exec scripts/import/testimonials-page.ts --with-user-token
 *
 * Two headings. The reviews are the `testimonial` collection and What Drives Us
 * is a shared record.
 *
 * NOT `testimonialsBand`, which is the six-card band on the homepage and
 * /about-us/. Their leads differ by a comma against a spaced hyphen and both are
 * left exactly as found — they are separate pages' words, not a typo.
 *
 * The video tile's label and name stay in ReviewWall.astro. It is a placeholder
 * over a stock photo of someone who is not a client, and a "name" box in the
 * Studio under that photograph is an invitation to fill it in.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

const DOC = {
  "_id": "testimonialsPage",
  "_type": "testimonialsPage",
  "hero": {
    "eyebrow": "Client Reviews",
    "headingLead": "What our clients",
    "headingAccent": "say.",
    "lead": "For more than seventeen years, families across Pearland and Houston have trusted The Dieye Firm through their hardest days. Here is what they have to say - in their own words.",
    "ctaLabel": "Schedule a Consultation"
  },
  "wall": {
    "eyebrow": "In Their Words",
    "headingLead": "Success",
    "headingAccent": "stories.",
    "lead": "Real outcomes for real families - shared with care, never as a guarantee.",
    "cardKicker": "Testimonial"
  }
};

async function run() {
  await client.createOrReplace(DOC);
  console.log("\u2713 testimonialsPage written");
  await waitForPublic('count(*[_id == "testimonialsPage"])', 1, "the page copy");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
