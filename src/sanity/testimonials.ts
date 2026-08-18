import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/* The client reviews, read from Sanity.
 *
 * Replaces src/components/testimonials/reviews.ts. The provenance note that
 * module carried now lives on the schema type (src/sanity/schemaTypes/
 * testimonial.ts), where an editor can actually see it — including the rule that
 * matters most, which is that nothing here may be invented.
 *
 * Three consumers: the wall on /testimonials/ (all fourteen, in drag order), the
 * homepage's Success Stories band (six, chosen on the homePage document) and the
 * homepage About pull quote (one, likewise). The two selections used to be
 * `pick(name, matter)` lookups compiled into the components; they are references
 * now, so an editor can change which reviews appear without a deploy — and
 * without being able to break the build by renaming a client.
 *
 * ── TypeGen ──────────────────────────────────────────────────────────────────
 * Query names are GLOBAL across the project and `defineQuery` is parsed
 * STATICALLY, so two files declaring the same const name silently overwrite each
 * other's generated types, and a projection assembled by string interpolation
 * resolves to `unknown`. Hence the file-scoped prefix and the spelled-out
 * projections.
 */

const TESTIMONIALS_ALL_QUERY = defineQuery(`
  *[_type == "testimonial"] | order(orderRank) {
    _id, lead, body, name, matter
  }
`);

const TESTIMONIALS_HOME_QUERY = defineQuery(`
  *[_id == "homePage"][0]{
    "pullQuote": about.pullQuote->{ _id, lead, body, name, matter },
    "picks": testimonials.picks[]->{ _id, lead, body, name, matter }
  }
`);

export type Testimonial = {
  _id: string;
  lead: string;
  body: string;
  name: string;
  matter: string;
};

/* Promise-cached in PROD only — the same shape as getFirmDetails(), and for the
   same two reasons. Caching the PROMISE rather than the value stops several
   fetches starting before the first resolves, since components render
   concurrently. Skipping the cache in dev is what lets a Studio edit show up on
   refresh; a module-level promise has nothing to invalidate it, so a dev server
   would otherwise serve the reviews it fetched at boot for the life of the
   process, with every symptom pointing at the edit having failed. */
let allCache: Promise<Testimonial[]> | undefined;
let homeCache: Promise<HomeTestimonials> | undefined;

async function fetchAll(): Promise<Testimonial[]> {
  const rows = await sanityClient.fetch(TESTIMONIALS_ALL_QUERY);
  if (!rows?.length) {
    throw new Error(
      "No testimonial documents in Sanity. Import them with:\n" +
        "  npx sanity exec scripts/import/testimonials.ts --with-user-token",
    );
  }
  return rows as Testimonial[];
}

/** Every published review, in the order the Studio's drag handle sets. */
export function getTestimonials(): Promise<Testimonial[]> {
  if (!import.meta.env.PROD) return fetchAll();
  allCache ??= fetchAll();
  return allCache;
}

export type HomeTestimonials = {
  pullQuote: Testimonial;
  picks: Testimonial[];
};

async function fetchHome(): Promise<HomeTestimonials> {
  const doc = await sanityClient.fetch(TESTIMONIALS_HOME_QUERY);
  /* Fail loudly rather than rendering a band with no cards or an empty
     blockquote. Both are on the homepage, so a silent miss is the single most
     visible thing that could go wrong on the site. */
  if (!doc?.pullQuote) {
    throw new Error(
      "homePage.about.pullQuote is not set — the homepage About section has no review to quote. " +
        "Set it in the Studio under Pages → Home Page → About section.",
    );
  }
  if (doc.picks?.length !== 6) {
    throw new Error(
      `homePage.testimonials.picks has ${doc.picks?.length ?? 0} reviews, expected 6. ` +
        "Set them in the Studio under Pages → Home Page → Success Stories.",
    );
  }
  return doc as HomeTestimonials;
}

/** The homepage's two curated selections, in one round trip. */
export function getHomeTestimonials(): Promise<HomeTestimonials> {
  if (!import.meta.env.PROD) return fetchHome();
  homeCache ??= fetchHome();
  return homeCache;
}
