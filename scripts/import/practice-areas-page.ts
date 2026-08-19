/* One-time import: /practice-areas/ — phase 5, page 3 of 14.
 *
 *   npx sanity exec scripts/import/practice-areas-page.ts --with-user-token
 *
 * Every string EXTRACTED from the components under src/components/practice-areas/
 * and diffed against them, never retyped.
 *
 * NOT /family-law/, which is a practice-area page in its own right. Five bands
 * render on this page and three are here; By the Numbers (also on /about-us/)
 * and What Drives Us (8 pages) are shared records.
 *
 * The featured cards carry TEXT and ICON only. Their title and link come from
 * the practice-area document each one points at, so a card cannot drift from
 * its page, and their photos are art-directed files keyed by the same id in
 * src/assets/images/practice-areas/.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

const DOC = {
  "_id": "practiceAreasPage",
  "_type": "practiceAreasPage",
  "hero": {
    "eyebrow": "Practice Areas",
    "headingLead": "How we help",
    "headingAccent": "Texas families.",
    "lead": "From divorce and custody to support and modifications, Papa Dieye guides Pearland and Houston families through every family law matter - with steady, compassionate counsel and honest answers.",
    "ctaLabel": "Schedule a Consultation"
  },
  "featured": {
    "eyebrow": "What We Do",
    "headingLead": "Every corner of",
    "headingAccent": "Texas family law.",
    "lead": "Steady, experienced counsel across the matters that shape your family's future.",
    "cards": [
      {
        "_type": "card",
        "_key": "card-1",
        "areaId": "divorce",
        "icon": "divorce",
        "text": "Whether your divorce is contested or amicable, it calls for steady, strategic guidance that protects your finances, your future, and the people you love most through every stage of the process."
      },
      {
        "_type": "card",
        "_key": "card-2",
        "areaId": "child-custody",
        "icon": "child-custody",
        "text": "Custody arrangements should put your children first while protecting your role and your rights as a parent - we work to secure a plan that gives your family stability and you lasting peace of mind."
      },
      {
        "_type": "card",
        "_key": "card-3",
        "areaId": "family-law",
        "icon": "family-law",
        "text": "From quiet mediation to the courtroom, every family matter is met with calm, capable counsel who stays beside you at each step and keeps your goals and your family's wellbeing at the center."
      },
      {
        "_type": "card",
        "_key": "card-4",
        "areaId": "child-support",
        "icon": "child-support",
        "text": "Support orders should be fair, accurate, and rooted in the real numbers - we help you establish them correctly the first time and adjust them as your circumstances and your children's needs change."
      },
      {
        "_type": "card",
        "_key": "card-5",
        "areaId": "property-division",
        "icon": "property-division",
        "text": "Texas community-property law calls for a clear-eyed, even-handed approach - we work to divide your assets and debts as fairly as possible while safeguarding the things that matter most to you."
      },
      {
        "_type": "card",
        "_key": "card-6",
        "areaId": "modifications-enforcement",
        "icon": "modifications",
        "text": "When life changes, your custody, support, and parenting orders can change too - we petition the court to keep every order current, realistic, and aligned with what your family needs today.",
        "label": "Modifications"
      }
    ]
  },
  "allAreas": {
    "eyebrow": "Full Index",
    "headingLead": "Every practice area,",
    "headingAccent": "A to Z."
  }
};

async function run() {
  await client.createOrReplace(DOC);
  console.log("\u2713 practiceAreasPage written");
  await waitForPublic('count(*[_id == "practiceAreasPage" && defined(hero.eyebrow)])', 1, "the Practice Areas page copy");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
