/* One-time import: /about-us/ — phase 5, page 2 of 14.
 *
 *   npx sanity exec scripts/import/about-page.ts --with-user-token
 *
 * Every string EXTRACTED from the components under src/components/about/ and
 * diffed against them, never retyped.
 *
 * Nine bands render on that page and six are here. The other three are shared
 * records: the awards strip (3 pages), the Success Stories band (2) and What
 * Drives Us (8). Papa's name and title are the `attorney` record — they appear
 * four times on this page and not once in this document.
 *
 * TAILS. Two headings put their italic mid-sentence, so they carry a third part
 * after it. The tail is stored TRIMMED and the component decides the spacing,
 * because a leading space in a Studio text box is invisible and the first editor
 * to tidy it would close up the sentence.
 *
 * The Google rating stays hardcoded in MeetPapa. It was modelled once on the
 * `attorney` record and removed at Rhan's direction on 2026-08-19; putting it
 * here would be that decision taken again with a different answer.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

const DOC = {
  "_id": "aboutPage",
  "_type": "aboutPage",
  "hero": {
    "eyebrow": "About The Dieye Firm",
    "headingLead": "Treated like a",
    "headingAccent": "neighbor",
    "headingTail": ", not a case number.",
    "lead": "For more than seventeen years, attorney Papa Dieye has guided Pearland and Houston families through divorce, custody, and the hardest seasons of their lives, with steady counsel and genuine compassion.",
    "ctaLabel": "Schedule a Consultation"
  },
  "whoWeAre": {
    "eyebrow": "Who We Are",
    "headingLead": "Not just a family lawyer,",
    "headingAccent": "a steady hand for your family.",
    "paragraphs": [
      "When your family is going through a divorce, a custody dispute, or a sudden change in circumstances, it can feel like the ground has shifted beneath you. At The Dieye Firm, we understand that behind every case file is a parent worried about their children and a family simply trying to find a way forward.",
      "Our approach is people-first: we listen before we advise, we explain the law in plain language, and we never lose sight of the human beings at the center of every matter. You are not a number here. You are a neighbor, and your family's well-being is the measure of our work."
    ],
    "ctaLabel": "Our Practice Areas"
  },
  "byTheNumbers": {
    "stats": [
      {
        "_type": "stat",
        "_key": "stat-1",
        "value": "17+",
        "label": "Years in Family Law"
      },
      {
        "_type": "stat",
        "_key": "stat-2",
        "value": "6",
        "label": "Communities Served"
      },
      {
        "_type": "stat",
        "_key": "stat-3",
        "value": "100%",
        "label": "Focused on Families"
      },
      {
        "_type": "stat",
        "_key": "stat-4",
        "value": "Financing",
        "label": "Payment Plans Available"
      }
    ]
  },
  "promise": {
    "quoteLead": "I tell every client the same thing on day one: my job is to protect your family, and to make sure you",
    "quoteAccent": "never feel alone",
    "quoteTail": "in this process."
  },
  "meetPapa": {
    "eyebrow": "Meet the Attorney",
    "chips": [
      {
        "_type": "chip",
        "_key": "chip-1",
        "value": "17+ Years",
        "label": "Texas Family Law",
        "icon": "scales"
      },
      {
        "_type": "chip",
        "_key": "chip-2",
        "value": "5.0 Stars",
        "label": "Google Reviews",
        "icon": "star"
      },
      {
        "_type": "chip",
        "_key": "chip-3",
        "value": "500+",
        "label": "Families Helped",
        "icon": "heart"
      }
    ],
    "paragraphs": [
      "For more than seventeen years, Papa Dieye has guided families across Pearland and the greater Houston area through divorce, custody, and support. He built this firm on a simple belief: that people in crisis deserve a lawyer who treats them with dignity, answers honestly, and fights thoughtfully for what matters most.",
      "As a solo practitioner, Papa works with you directly. No handoffs, no shuffle. Just one experienced attorney who knows your story."
    ],
    "milestones": [
      {
        "_type": "milestone",
        "_key": "ms-1",
        "when": "Then",
        "title": "A Calling to Serve",
        "text": "Answered a calling to family law, the area where steady counsel matters most."
      },
      {
        "_type": "milestone",
        "_key": "ms-2",
        "when": "Now",
        "title": "Rooted in Pearland",
        "text": "Serving neighbors across the greater Houston area, right here from Old Town Pearland."
      },
      {
        "_type": "milestone",
        "_key": "ms-3",
        "when": "Always",
        "title": "People First",
        "text": "Plain-language advice, realistic expectations, and empathy on every single matter."
      },
      {
        "_type": "milestone",
        "_key": "ms-4",
        "when": "With You",
        "title": "To Resolution",
        "text": "Standing beside your family from the first call through the final signed order."
      }
    ]
  },
  "whyFamilyLaw": {
    "eyebrow": "Why Family Law",
    "headingLead": "Why Papa chose",
    "headingAccent": "family law.",
    "paragraphs": [
      "Family law is the one area of practice where the stakes are never abstract. The outcome of a case decides where children sleep at night, how parents share holidays, and whether a family can move forward with dignity. For Papa, that weight is exactly the point. It is work worth doing well.",
      "He built his practice in the heart of the Houston area, rooted in Old Town Pearland, because he wanted to serve the neighbors he lives alongside. Over the years, that has meant guiding families through divorce, custody, child support, property division, and the modifications that come as life keeps changing.",
      "Through all of it, one principle has never wavered: meet people with empathy first, because this is their life, not just a case. It is a standard he holds himself to on every matter, from the most amicable agreement to the most difficult trial."
    ]
  }
};

async function run() {
  await client.createOrReplace(DOC);
  console.log("\u2713 aboutPage written");
  await waitForPublic('count(*[_id == "aboutPage" && defined(hero.eyebrow)])', 1, "the About page copy");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
