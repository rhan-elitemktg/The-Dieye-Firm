import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type { PortableTextBlock } from "@portabletext/types";
import type { SeoInput } from "../lib/seo";

/* The 32 location pages, read from Sanity.
 *
 * ── The result deliberately mimics an Astro content entry ────────────────────
 *
 * `{ id, data: { … } }` is the shape `getCollection("locations")` returned, and
 * it is reproduced here on purpose. The route, LocationNav, LocationSidebar,
 * MainNav and the site map all consume it, as do the shared tree helpers in
 * src/components/interior/tree.ts, whose `TreeEntry` is exactly
 * `{ id, data: { navLabel, parent? } }`.
 *
 * Matching the old shape means TreeNav and both sidebars change by NOT ONE LINE
 * across the 33 routes they render, which is what makes "the menu is identical"
 * provable rather than argued. The alternative — a natural Sanity shape plus
 * adapters at six call sites — is the same data with more places to get it
 * wrong.
 *
 * `id` is the slug — here the WHOLE path, because these sit at the site root —
 * and `data.parent` / `data.location` are the target's SLUG rather than its
 * document id, because that is what `buildTree` and `rootOf` match against `id`.
 *
 * ── location is not derived from the URL ─────────────────────────────────────
 *
 * Two Pasadena pages hang off the site root and their paths do not name their
 * location, so `rootOf` is a lookup and never a string operation on the slug.
 *
 * ── TypeGen ──────────────────────────────────────────────────────────────────
 *
 * Query names are global across the project and `defineQuery` is parsed
 * statically, so the projection cannot be hoisted into a shared const and the
 * const name is prefixed per file.
 *
 * Two GROQ notes, both learned here:
 *   - Only `//` comments. A `/* … *\/` block inside a query is a parse error at
 *     request time, not at build time, so it surfaces as a failed fetch.
 *   - `faqs` is coalesced to [] because GROQ returns null for a field that is
 *     not set, while the content collection this replaces defaulted it to an
 *     empty array. Only one of the 32 practice areas has FAQs, so null is the
 *     normal case and every consumer would otherwise need its own guard.
 */

const LOCATION_PAGES_ALL_QUERY = defineQuery(`
  *[_type == "locationPage"]{
    "id": slug.current,
    "data": {
      title,
      navLabel,
      subtitle,
      "parent": parent->slug.current,
      "location": location->slug.current,
      "description": seo.metaDescription,
      "seoTitle": seo.metaTitle,
      "faqs": coalesce(faqs[]{ _key, question, answer }, [])
    },
    body,
    "seo": seo{ metaTitle, metaDescription, canonicalUrl, noIndex, ogImage },
    "noIndex": seo.noIndex,
    "canonicalUrl": seo.canonicalUrl,
    _updatedAt
  }
`);

export type LocationFaq = {
  _key: string;
  question: string;
  answer: PortableTextBlock[];
};

export type LocationPage = {
  id: string;
  data: {
    title: string;
    navLabel: string;
    subtitle?: string;
    parent?: string;
    description?: string;
    seoTitle?: string;
    faqs?: LocationFaq[];
    location: string;
  };
  body: PortableTextBlock[];
  seo?: SeoInput | null;
  noIndex?: boolean;
  canonicalUrl?: string;
  _updatedAt: string;
};

/* Promise-cached in PROD only, the same shape as getFirmDetails(). Skipping the
   cache in dev is what lets a Studio edit show on refresh. */
let cache: Promise<LocationPage[]> | undefined;

async function fetchAll(): Promise<LocationPage[]> {
  const rows = (await sanityClient.fetch(LOCATION_PAGES_ALL_QUERY)) as LocationPage[] | null;
  if (!rows?.length) {
    throw new Error(
      "No locationPage documents in Sanity. Import them with:\n" +
        "  npx sanity exec scripts/import/locations.ts --with-user-token",
    );
  }

  /* Two build-time assertions, both for failures that are otherwise silent.

     A slug that appears twice would have `getStaticPaths` emit the same path
     twice and the filesystem keep whichever wrote last — a page replaced by
     another page, with a green build.

     A parent that doesn't resolve drops a whole branch out of the sidebar on
     every page that renders it, and the menu just looks shorter. */
  const slugs = new Set<string>();
  for (const row of rows) {
    if (!row.id) throw new Error(`A locationPage has no slug (${row._updatedAt})`);
    if (slugs.has(row.id)) throw new Error(`Two location pages share the slug "${row.id}"`);
    slugs.add(row.id);
  }
  for (const row of rows) {
    for (const [field, ref] of [["sits under", row.data.parent], ["service area", row.data.location]] as const) {
      if (ref && !slugs.has(ref)) {
        throw new Error(`Location page "${row.id}" names "${ref}" as its ${field}, which is not a location page.`);
      }
    }
  }
  return rows;
}

export function getLocationPages(): Promise<LocationPage[]> {
  if (!import.meta.env.PROD) return fetchAll();
  cache ??= fetchAll();
  return cache;
}
