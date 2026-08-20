import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { SeoInput } from "../lib/seo";

/* Global SEO Settings, plus the per-page `seo` reads the singletons need.
 *
 * Three consumers: Layout (the crawl switch and the default share image),
 * robots.txt.ts (the switch again) and sitemap.xml.ts (per-page `noIndex`).
 *
 * ⚠️ The `seo{…}` projection is spelled out LITERALLY in each query below and
 * in every collection helper, rather than shared as an interpolated constant.
 * TypeGen parses `defineQuery` statically: a projection built from a template
 * variable is invisible to it, and the generated types silently lose the
 * fields. Duplication here is the price of the types being real.
 */

const GLOBAL_SEO_QUERY = defineQuery(`
  *[_id == "globalSeo"][0]{ discourageCrawling, defaultOgImage }
`);

const PAGE_SEO_QUERY = defineQuery(`
  *[_id == $pageId][0].seo{
    metaTitle, metaDescription, canonicalUrl, noIndex, ogImage
  }
`);

const STATIC_PAGE_SEO_QUERY = defineQuery(`
  *[_id in $ids]{ _id, _updatedAt, "noIndex": seo.noIndex }
`);

export type GlobalSeo = {
  discourageCrawling?: boolean;
  defaultOgImage?: SanityImageSource | null;
};

export type StaticPageSeo = {
  _id: string;
  _updatedAt: string;
  noIndex?: boolean | null;
};

/* Memoised the way every other helper here is: a static build asks once rather
   than once per page. `import.meta.env.PROD` keeps a dev server seeing Studio
   edits on refresh — see the note in AGENTS.md about the dev server never
   picking up a Sanity change. */
let globalCache: Promise<GlobalSeo | null> | undefined;

/**
 * The sitewide SEO settings, or null before anyone has created the document.
 *
 * Null is a normal state and NOT an error: the site must build on a dataset
 * where this singleton has never been opened, because the fallback layer has to
 * be a no-op until an editor touches it.
 */
export function getGlobalSeo(): Promise<GlobalSeo | null> {
  const fetchIt = () =>
    sanityClient.fetch(GLOBAL_SEO_QUERY) as Promise<GlobalSeo | null>;
  if (!import.meta.env.PROD) return fetchIt();
  globalCache ??= fetchIt();
  return globalCache;
}

/** One page singleton's `seo` block. Null when the tab was never filled in. */
export async function getSeo(pageId: string): Promise<SeoInput | null> {
  return (await sanityClient.fetch(PAGE_SEO_QUERY, { pageId })) as SeoInput | null;
}

/** `_updatedAt` and `noIndex` for the page singletons, for the sitemap. */
export async function getStaticPageSeo(ids: string[]): Promise<StaticPageSeo[]> {
  return ((await sanityClient.fetch(STATIC_PAGE_SEO_QUERY, { ids })) ??
    []) as StaticPageSeo[];
}
