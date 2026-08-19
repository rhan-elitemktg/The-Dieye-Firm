import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/* /testimonials/ — its own copy.
 *
 * NOT `testimonialsBand`, which is the six-card band on the homepage and
 * /about-us/. This is the full wall's two headings. The reviews are the
 * `testimonial` collection, and the video tile's strings stay in the component
 * because it is a placeholder — see the schema header.
 */
const TESTIMONIALS_PAGE_QUERY = defineQuery(`
  *[_id == "testimonialsPage"][0]{
    hero{ eyebrow, headingLead, headingAccent, headingTail, lead, ctaLabel },
    wall{ eyebrow, headingLead, headingAccent, headingTail, lead, cardKicker }
  }
`);

type Heading = {
  eyebrow: string;
  headingLead: string;
  headingAccent?: string;
  headingTail?: string;
};

export type TestimonialsPage = {
  hero: Heading & { lead: string; ctaLabel: string };
  wall: Heading & { lead: string; cardKicker: string };
};

let cache: Promise<TestimonialsPage> | undefined;

async function fetchTestimonialsPage(): Promise<TestimonialsPage> {
  const doc = (await sanityClient.fetch(TESTIMONIALS_PAGE_QUERY)) as TestimonialsPage | null;
  if (!doc?.hero?.eyebrow) {
    throw new Error(
      "The testimonialsPage document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/testimonials-page.ts --with-user-token",
    );
  }
  return doc;
}

export function getTestimonialsPage(): Promise<TestimonialsPage> {
  if (!import.meta.env.PROD) return fetchTestimonialsPage();
  cache ??= fetchTestimonialsPage();
  return cache;
}
