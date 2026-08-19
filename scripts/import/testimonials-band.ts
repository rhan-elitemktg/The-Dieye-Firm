/* One-time import: the Success Stories band moves out of `homePage`.
 *
 *   npx sanity exec scripts/import/testimonials-band.ts --with-user-token
 *
 * The band renders on the homepage AND on /about-us/, so by the rule the page
 * singletons follow it is a record, not the homepage's copy. It spent one commit
 * inside `homePage` — phase 2 put the six picks there, phase 5 added the copy
 * beside them, and modelling /about-us/ is what surfaced it.
 *
 * This READS the six picks off `homePage` rather than hardcoding ids, so the
 * selection an editor may already have changed is the one that moves. It then
 * unsets `homePage.testimonials`, which is the field the schema no longer
 * declares — an undeclared field is invisible in the Studio but still in the
 * document, and a stale copy of a heading is exactly the thing this move exists
 * to prevent.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

async function run() {
  const home = (await client.getDocument("homePage")) as
    | { testimonials?: { picks?: { _ref: string; _key: string }[] } }
    | undefined;

  const picks = home?.testimonials?.picks;
  if (!picks?.length) {
    throw new Error(
      "homePage.testimonials.picks is empty, so there is nothing to move. If the band " +
        "has already been moved, this script has already run.",
    );
  }

  await client.createOrReplace({
    _id: "testimonialsBand",
    _type: "testimonialsBand",
    eyebrow: "In Their Words",
    headingLead: "Success",
    headingAccent: "Stories",
    lead: "Real outcomes for real families, shared with care, never as a guarantee.",
    cardKicker: "Testimonial",
    ctaLabel: "View All Reviews",
    picks,
  });
  console.log(`✓ testimonialsBand written with ${picks.length} reviews`);

  await client.patch("homePage").unset(["testimonials"]).commit();
  console.log("✓ homePage.testimonials unset");

  await waitForPublic('count(*[_id == "testimonialsBand"])', 1, "the Success Stories band");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
