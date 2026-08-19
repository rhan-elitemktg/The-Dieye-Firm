import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/* /about-us/ — its own copy, in one fetch for the whole page.
 *
 * Five components read bands of this document. They all render on the same
 * request, so one query beats six round trips. Promise-cached in PROD and
 * deliberately not in dev, so a Studio edit shows up on refresh.
 *
 * Four more bands on that page are NOT here: the awards strip, the Success
 * Stories band, the By the Numbers strip and What Drives Us are shared
 * records. Papa's name and title
 * are not here either — they are the `attorney` record, and they render in
 * four places on this page.
 */
const ABOUT_PAGE_QUERY = defineQuery(`
  *[_id == "aboutPage"][0]{
    hero{ eyebrow, headingLead, headingAccent, headingTail, lead, ctaLabel },
    whoWeAre{ eyebrow, headingLead, headingAccent, headingTail, paragraphs, ctaLabel },
    promise{ quoteLead, quoteAccent, quoteTail },
    meetPapa{ eyebrow, chips[]{ icon, value, label }, paragraphs, milestones[]{ when, title, text } },
    whyFamilyLaw{ eyebrow, headingLead, headingAccent, headingTail, paragraphs }
  }
`);

type Heading = {
  eyebrow: string;
  headingLead: string;
  headingAccent?: string;
  headingTail?: string;
};

export type AboutPage = {
  hero: Heading & { lead: string; ctaLabel: string };
  whoWeAre: Heading & { paragraphs: string[]; ctaLabel: string };
  promise: { quoteLead: string; quoteAccent?: string; quoteTail?: string };
  meetPapa: {
    eyebrow: string;
    chips: { icon: string; value: string; label: string }[];
    paragraphs: string[];
    milestones: { when: string; title: string; text: string }[];
  };
  whyFamilyLaw: Heading & { paragraphs: string[] };
};

let cache: Promise<AboutPage> | undefined;

async function fetchAboutPage(): Promise<AboutPage> {
  const doc = (await sanityClient.fetch(ABOUT_PAGE_QUERY)) as AboutPage | null;
  if (!doc?.hero?.eyebrow) {
    throw new Error(
      "The aboutPage document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/about-page.ts --with-user-token",
    );
  }
  return doc;
}

export function getAboutPage(): Promise<AboutPage> {
  if (!import.meta.env.PROD) return fetchAboutPage();
  cache ??= fetchAboutPage();
  return cache;
}

/* The tail of a heading whose italic sits mid-sentence.
 *
 * ", not a case number." butts straight against the italic; "in this process."
 * needs a space in front of it. Deciding here rather than storing the space
 * means the Studio field can be trimmed — a leading space in a text box is
 * invisible, and the first editor to tidy it would close up the sentence. */
export function tail(text?: string): string {
  if (!text) return "";
  return /^[,.;:!?)\]]/.test(text) ? text : ` ${text}`;
}
