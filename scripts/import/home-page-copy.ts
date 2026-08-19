/* One-time import: the homepage's own copy — phase 5.
 *
 *   npx sanity exec scripts/import/home-page-copy.ts --with-user-token
 *
 * Every string was EXTRACTED from the components under src/components/home/ and
 * diffed against them, never retyped. Eleven bands of prose is more than anyone
 * can proofread twice, and this is the most-linked page on the site.
 *
 * ⚠ THIS PATCHES; scripts/import/home-page.ts REPLACES. That one is phase 2's
 * and sets `about.pullQuote` and `testimonials.picks`, which are references
 * rather than copy. Running it again would wipe everything below. This script
 * uses dotted paths so those two survive; keep it that way.
 *
 * What is NOT here, and why:
 *   the awards strip     -> renders on 3 pages, so it is `awardsBand` + `award`
 *   the consultation cta -> renders on 93, so it is `consultForm`
 *   Papa's name + title  -> facts about the firm, so they are `attorney`
 *   the phone number     -> the same, so it is `firmDetails`
 *   the FAQ answers      -> /faq/ publishes the same nine, so they are `faq`
 *   the videos           -> /video-center/ shows the same nine, so `video`
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

const SECTIONS = {
  "hero": {
    "eyebrow": "Pearland & Houston Family Law",
    "headingLines": "When family life\nchanges,",
    "headingAccent": "we're with you.",
    "lead": "Compassionate, steady guidance through divorce, custody, and the moments that matter most, from an attorney who treats you like a neighbor, not a case number.",
    "ctaLabel": "Get in Touch",
    "stats": [
      {
        "_type": "stat",
        "_key": "stat-1",
        "value": "17+",
        "label": "Years of Experience"
      },
      {
        "_type": "stat",
        "_key": "stat-2",
        "value": "500+",
        "label": "Families Helped"
      },
      {
        "_type": "stat",
        "_key": "stat-3",
        "value": "Countless",
        "label": "Success Stories"
      }
    ]
  },
  "practiceAreas": {
    "eyebrow": "What We Do",
    "headingLead": "How We Can",
    "headingAccent": "Help",
    "intro": "From divorce and custody to support and modifications, we guide Pearland and Houston families through every family law matter with steady, compassionate counsel, and the honest answers you deserve. Family law covers issues about family relationships, including how to approach changes and resolve conflict. The legal landscape can be far more intricate than many expect.",
    "ctaLabel": "View All Services",
    "areas": [
      {
        "_type": "area",
        "_key": "area-1",
        "icon": "divorce",
        "title": "Divorce",
        "href": "/family-law/divorce/",
        "text": "Divorce, whether contested or amicable, calls for steady guidance that protects your future and the people you love most."
      },
      {
        "_type": "area",
        "_key": "area-2",
        "icon": "child-custody",
        "title": "Child Custody",
        "href": "/family-law/child-custody/",
        "text": "Child Custody arrangements put your children first while protecting your role, your rights, and your peace of mind as a parent."
      },
      {
        "_type": "area",
        "_key": "area-3",
        "icon": "family-law",
        "title": "Family Law",
        "href": "/family-law/",
        "text": "Family Law covers every family matter, from mediation to litigation, you'll have calm, capable counsel beside you every step."
      },
      {
        "_type": "area",
        "_key": "area-4",
        "icon": "child-support",
        "title": "Child Support",
        "href": "/family-law/child-support/",
        "text": "Child Support orders should be fair and accurate. We help you set them correctly, and adjust them as your life changes over time."
      },
      {
        "_type": "area",
        "_key": "area-5",
        "icon": "property-division",
        "title": "Property Division",
        "href": "/family-law/property-division/",
        "text": "Property Division under Texas law calls for a clear-eyed, even-handed approach to dividing your assets and debts as fairly as possible."
      },
      {
        "_type": "area",
        "_key": "area-6",
        "icon": "modifications",
        "title": "Modifications",
        "href": "/family-law/modifications-enforcement/",
        "text": "Modifications keep your orders current, because when life changes your custody, support, and parenting plans can change too."
      }
    ]
  },
  "featuredAttorney": {
    "eyebrow": "Meet the Attorney",
    "quote": "\"I became a family lawyer to be the steady voice families need on their hardest day.\"",
    "paragraphs": [
      "For more than seventeen years, Papa Dieye has guided families across Pearland and the greater Houston area through divorce, custody, and support. He built this firm on a simple belief: that people in crisis deserve a lawyer who treats them with dignity, answers honestly, and fights thoughtfully for what matters most.",
      "As a solo practitioner, Papa works with you directly. No handoffs, no shuffle. Just one experienced attorney who knows your story."
    ],
    "ctaLabel": "Get to Know Papa",
    "badgeYears": 17,
    "badgeLabelLines": [
      "Years of Texas",
      "Family Law"
    ]
  },
  "sellingPoints": {
    "eyebrow": "The Difference",
    "headingLead": "Why Hire",
    "headingAccent": "The Dieye Firm?",
    "points": [
      {
        "_type": "point",
        "_key": "point-1",
        "icon": "compassionate-approach",
        "title": "Compassionate Approach",
        "text": "We meet you with empathy first, listening before we advise, because this is your life, not just a case."
      },
      {
        "_type": "point",
        "_key": "point-2",
        "icon": "client-focused",
        "title": "Direct, Personal Attention",
        "text": "You work with Papa himself, the attorney who knows your name, your story, and your goals."
      },
      {
        "_type": "point",
        "_key": "point-3",
        "icon": "experienced",
        "title": "17+ Years of Experience",
        "text": "Steady, practical judgment navigating Texas family courts across the Houston area."
      },
      {
        "_type": "point",
        "_key": "point-4",
        "icon": "flexible-payments",
        "title": "Flexible Payment Plans",
        "text": "Transparent fees and financing options built for real families during a hard season."
      }
    ]
  },
  "faq": {
    "eyebrow": "Frequently Asked Questions",
    "headingLead": "Answers to the Most Commonly",
    "headingAccent": "Asked Questions"
  },
  "videoReels": {
    "eyebrow": "Watch & Learn",
    "headingLead": "Family Law,",
    "headingAccent": "Explained",
    "ctaLabel": "View More Videos"
  },
  "community": {
    "eyebrow": "Rooted in Community",
    "headingLead": "Giving Back to Our",
    "headingAccent": "Neighbors",
    "paragraphs": [
      "The Dieye Firm believes in showing up for the community that raised it. From pro bono family law clinics to local mentorship and neighborhood events, Papa is invested in Pearland and Houston beyond the courtroom.",
      "Because caring for families shouldn't stop at the office door."
    ],
    "ctaLabel": "The Dieye Difference",
    "tileTitle": "Beyond the Courtroom",
    "tileText": "Pro bono clinics, mentorship, and neighborhood events across Pearland."
  },
  "guideRequest": {
    "eyebrow": "No Pressure",
    "headingLead": "Hey, Not Ready Yet?",
    "headingAccent": "That's Okay.",
    "lead": "Choosing a lawyer is a big step. Here's something genuinely helpful to guide you through what comes next, on your own time.",
    "offer": "Get your free Texas Divorce Checklist"
  },
  "blog": {
    "eyebrow": "Our Blog",
    "headingLead": "We're Keeping You",
    "headingAccent": "Informed",
    "ctaLabel": "View All Blog Posts"
  }
};

/* Dotted, so the two reference fields phase 2 wrote are left alone. */
const FIELDS = {
  "about.eyebrow": "Houston Family Law Firm",
  "about.headingLead": "Family Law Isn't Just About Outcomes -",
  "about.headingAccent": "It's About People.",
  "about.videoLabel": "Watch Our Video",
  "about.videoCaption": "Meet Papa Dieye, and hear how he stands beside Pearland families.",
  "about.lead": "When your family is going through a divorce, a custody dispute, or a sudden change in circumstances, it can feel like the ground has shifted beneath you. At The Dieye Firm, we understand that behind every case file is a parent worried about their children, a spouse facing an uncertain future, or a family simply trying to find a way forward. We're here to help you carry that weight, with compassion, honesty, and seventeen years of Texas family law experience behind every decision.",
  "about.intro": "For more than seventeen years, attorney Papa Dieye has guided Pearland and Houston families through some of the hardest seasons of their lives. Our approach is people-first: we listen before we advise, we explain the law in plain language, and we never lose sight of the human beings at the center of every matter. You are not a number here. You are a neighbor, and your family's well-being is the measure of our work.",
  "about.helpHeading": "How The Dieye Firm Can Help",
  "about.helpIntro": "Family law in Texas covers a wide range of deeply personal matters, and we walk with you through all of them, from the first difficult conversation to the final signed order:",
  "about.checklist": [
    {
      "_type": "item",
      "_key": "check-1",
      "lead": "Direct access to your attorney.",
      "text": "You work with Papa himself, not a rotating cast of associates. The person you meet at your consultation is the person who stands beside you in court."
    },
    {
      "_type": "item",
      "_key": "check-2",
      "lead": "Seventeen-plus years of experience",
      "text": "across divorce, child custody, child support, property division, and post-decree modifications throughout the greater Houston area."
    },
    {
      "_type": "item",
      "_key": "check-3",
      "lead": "Honest counsel and realistic expectations,",
      "text": "so you can make informed decisions about your family's future without false promises or pressure."
    },
    {
      "_type": "item",
      "_key": "check-4",
      "lead": "Flexible, transparent fees and payment plans",
      "text": "built for real families navigating real financial stress during an already overwhelming time."
    }
  ],
  "about.whyHeading": "Why You Need a Compassionate Family Lawyer",
  "about.whyParagraphs": [
    "Family law touches the things you hold most dear: your children, your home, your financial security, and your peace of mind. A knowledgeable family lawyer takes over the confusing paperwork, the court deadlines, and the difficult negotiations, so you can focus on healing and on the people who depend on you most.",
    "Whether your situation is amicable or deeply contested, we work to resolve it efficiently, protect your rights, and keep your children's well-being at the heart of every strategy. We handle the legal complexity; you get room to breathe."
  ],
  "about.servingHeading": "Serving Families Across the Houston Area",
  "about.servingParagraph": "The Dieye Firm proudly represents families in Pearland, Houston, Sugar Land, Friendswood, Manvel, Alvin, and the surrounding communities. From contested divorces and high-conflict custody disputes to straightforward, uncontested separations, no family is too complicated and no concern is too small. We believe everyone deserves clear answers, dignified treatment, and an advocate who genuinely cares about what happens next.",
  "about.ctaLabel": "Get in Touch",
  "testimonials.eyebrow": "In Their Words",
  "testimonials.headingLead": "Success",
  "testimonials.headingAccent": "Stories",
  "testimonials.lead": "Real outcomes for real families, shared with care, never as a guarantee.",
  "testimonials.ctaLabel": "View All Reviews",
  "testimonials.cardKicker": "Testimonial"
};

async function run() {
  const existing = await client.getDocument("homePage");
  if (!existing) {
    throw new Error(
      "There is no homePage document to patch. Run phase 2's import first:\n" +
        "  npx sanity exec scripts/import/home-page.ts --with-user-token",
    );
  }

  await client.patch("homePage").set({ ...SECTIONS, ...FIELDS }).commit();
  console.log(`\u2713 homePage patched — ${Object.keys(SECTIONS).length} sections + about/testimonials copy`);

  await waitForPublic('count(*[_id == "homePage" && defined(hero.eyebrow)])', 1, "the homepage copy");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
