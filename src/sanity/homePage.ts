import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImage } from "./image";

/* The homepage's own copy.
 *
 * ONE fetch for the whole page. Eleven components render bands of this document
 * and each could have asked for its own slice, but they all render on the same
 * request, so eleven queries would be eleven round trips for one page. The
 * promise is cached in PROD and deliberately not in dev, like every other helper
 * here, so a Studio edit shows up on refresh.
 *
 * `about.pullQuote` is a reference to a `testimonial`; the component wants the
 * review, not the id, so src/sanity/testimonials.ts resolves it.
 */
const HOME_PAGE_QUERY = defineQuery(`
  *[_id == "homePage"][0]{
    hero{ eyebrow, headingLines, headingAccent, lead, ctaLabel, stats[]{ value, label } },
    about{
      eyebrow, headingLead, headingAccent, videoLabel, videoCaption, body, ctaLabel,
      video->{ "id": wistiaId, title, poster{ asset, "dimensions": asset->metadata.dimensions } }
    },
    practiceAreas{ eyebrow, headingLead, headingAccent, intro, ctaLabel, areas[]{ icon, title, href, text } },
    featuredAttorney{ eyebrow, quote, paragraphs, ctaLabel, badgeYears, badgeLabelLines },
    sellingPoints{ eyebrow, headingLead, headingAccent, points[]{ icon, title, text } },
    faq{ eyebrow, headingLead, headingAccent },
    videoReels{ eyebrow, headingLead, headingAccent, ctaLabel },
    community{ eyebrow, headingLead, headingAccent, paragraphs, ctaLabel, tileTitle, tileText },
    guideRequest{ eyebrow, headingLead, headingAccent, lead, offer },
    blog{ eyebrow, headingLead, headingAccent, ctaLabel }
  }
`);

type Accent = { eyebrow: string; headingLead: string; headingAccent?: string };
type Card = { icon: string; title: string; text: string };

export type HomePage = {
  hero: {
    eyebrow: string;
    headingLines: string;
    headingAccent?: string;
    lead: string;
    ctaLabel: string;
    stats: { value: string; label: string }[];
  };
  about: Accent & {
    videoLabel: string;
    videoCaption: string;
    /* The tile's video. `pullQuote` is a reference too but is read by
       src/sanity/testimonials.ts, which resolves it to the review itself. */
    video: { id: string; title: string; poster: SanityImage };
    /* One rich-text field for the whole right-hand column. Rendered by
       home/AboutBody.astro, NOT by ProseBody - see that file's header. */
    body: PortableTextBlock[];
    ctaLabel: string;
  };
  practiceAreas: Accent & {
    intro: string;
    ctaLabel: string;
    areas: (Card & { href: string })[];
  };
  featuredAttorney: {
    eyebrow: string;
    quote: string;
    paragraphs: PortableTextBlock[];
    ctaLabel: string;
    badgeYears: number;
    badgeLabelLines: string[];
  };
  sellingPoints: Accent & { points: Card[] };
  faq: Accent;
  videoReels: Accent & { ctaLabel: string };
  community: Accent & {
    paragraphs: PortableTextBlock[];
    ctaLabel: string;
    tileTitle: string;
    tileText: string;
  };
  guideRequest: Accent & { lead: string; offer: string };
  blog: Accent & { ctaLabel: string };
};

let cache: Promise<HomePage> | undefined;

async function fetchHomePage(): Promise<HomePage> {
  const doc = (await sanityClient.fetch(HOME_PAGE_QUERY)) as HomePage | null;
  if (!doc?.hero?.eyebrow) {
    throw new Error(
      "The homePage document has no copy on it. Import it with:\n" +
        "  npx sanity exec scripts/import/home-page-copy.ts --with-user-token",
    );
  }
  return doc;
}

export function getHomePage(): Promise<HomePage> {
  if (!import.meta.env.PROD) return fetchHomePage();
  cache ??= fetchHomePage();
  return cache;
}
