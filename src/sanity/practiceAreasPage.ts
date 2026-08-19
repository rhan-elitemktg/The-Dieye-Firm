import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/* /practice-areas/ — its own copy, in one fetch.
 *
 * NOT the practice-area COLLECTION, which is src/sanity/practiceAreas.ts and
 * holds the 32 pages. This is the index page's headings and card text. Keeping
 * the two names apart matters; the section has burnt people before.
 *
 * The two bands not here are shared records: By the Numbers (also on
 * /about-us/) and What Drives Us (8 pages).
 */
const PRACTICE_AREAS_PAGE_QUERY = defineQuery(`
  *[_id == "practiceAreasPage"][0]{
    hero{ eyebrow, headingLead, headingAccent, headingTail, lead, ctaLabel },
    featured{
      eyebrow, headingLead, headingAccent, headingTail, lead,
      cards[]{ areaId, label, icon, text }
    },
    allAreas{ eyebrow, headingLead, headingAccent, headingTail }
  }
`);

type Heading = {
  eyebrow: string;
  headingLead: string;
  headingAccent?: string;
  headingTail?: string;
};

export type PracticeAreasPage = {
  hero: Heading & { lead: string; ctaLabel: string };
  featured: Heading & {
    lead: string;
    cards: { areaId: string; label?: string; icon: string; text: string }[];
  };
  allAreas: Heading;
};

let cache: Promise<PracticeAreasPage> | undefined;

async function fetchPracticeAreasPage(): Promise<PracticeAreasPage> {
  const doc = (await sanityClient.fetch(PRACTICE_AREAS_PAGE_QUERY)) as PracticeAreasPage | null;
  if (!doc?.hero?.eyebrow) {
    throw new Error(
      "The practiceAreasPage document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/practice-areas-page.ts --with-user-token",
    );
  }
  return doc;
}

export function getPracticeAreasPage(): Promise<PracticeAreasPage> {
  if (!import.meta.env.PROD) return fetchPracticeAreasPage();
  cache ??= fetchPracticeAreasPage();
  return cache;
}
