/* Every URL this site builds, assembled once from the same helpers the routes
 * themselves use.
 *
 * ═══ Two consumers, wanting different slices ═══
 *
 *   sitemap.xml.ts         — the indexable subset (drops `noIndex` pages and
 *                            the ones in SITEMAP_EXCLUDED).
 *   bulk-redirects.json.ts — the FULL set, as a collision guard. Vercel
 *                            evaluates bulk redirects BEFORE the filesystem, so
 *                            a redirect whose source is a live path would take
 *                            that page off the site. A `noIndex` page is still
 *                            a live page, which is why the filtering is left to
 *                            the caller rather than done here.
 *
 * Two copies of "what URLs exist" would drift, and the failure mode of the
 * drift is a live page silently disappearing — so there is one copy, here.
 *
 * The hardcoded half of the list lives in `lib/routePaths.ts`; that is the one
 * part of this that is not derived from a route, so check it when adding a page.
 */
import {
  DOCUMENT_BACKED,
  CODE_ONLY_PATHS,
  STATIC_PATHS,
  normalizePath,
} from "../lib/routePaths";
import { getStaticPageSeo } from "./globalSeo";
import { getPracticeAreas } from "./practiceAreas";
import { getLocationPages } from "./locationPages";
import { getBlogPosts } from "./blogPosts";

export interface SiteEntry {
  /** The path AS SERVED, trailing slash included. */
  path: string;
  lastmod?: string;
  noIndex?: boolean | null;
}

/* Built once per production build and reused — both consumers run in the same
   build and there is no reason for the second to refetch. Dev refetches so a
   Studio edit shows on refresh. */
let entriesCache: Promise<SiteEntry[]> | null = null;

/** Every route the site builds, `noIndex` flags included but NOT applied. */
export function getSiteEntries(): Promise<SiteEntry[]> {
  if (import.meta.env.PROD) {
    entriesCache ??= fetchSiteEntries();
    return entriesCache;
  }
  return fetchSiteEntries();
}

async function fetchSiteEntries(): Promise<SiteEntry[]> {
  const [pageSeo, areas, locations, posts] = await Promise.all([
    getStaticPageSeo(Object.keys(DOCUMENT_BACKED)),
    getPracticeAreas(),
    getLocationPages(),
    getBlogPosts(),
  ]);

  const entries: SiteEntry[] = [
    ...pageSeo.map((page) => ({
      path: DOCUMENT_BACKED[page._id],
      lastmod: page._updatedAt,
      noIndex: page.noIndex,
    })),
    ...CODE_ONLY_PATHS.map((path) => ({ path })),
    /* The section root's slug is "family-law" and it renders AT /family-law/,
       not under it — the same special case `areaHref` and `getStaticPaths`
       carry. Getting it wrong here would put /family-law/family-law/ in the
       sitemap and, worse, leave the real /family-law/ out of the redirect
       guard. */
    ...areas.map((area) => ({
      path: area.id === "family-law" ? "/family-law/" : `/family-law/${area.id}/`,
      lastmod: area._updatedAt,
      noIndex: area.noIndex,
    })),
    ...locations.map((page) => ({
      path: `/${page.id}/`,
      lastmod: page._updatedAt,
      noIndex: page.noIndex,
    })),
    ...posts.map((post) => ({
      path: `/blog/${post.id}/`,
      lastmod: post._updatedAt,
      noIndex: post.noIndex,
    })),
  ];

  return entries.filter((entry) => Boolean(entry.path));
}

/**
 * Every live path plus the reserved ones, normalized and ready to test a
 * redirect source against.
 *
 * Normalized (slash-less, lowercase) because this set exists to COMPARE, and
 * `/about-us` and `/about-us/` are the same page — a guard that thought
 * otherwise would wave through a rule that takes a live page off the site.
 */
export async function getLivePaths(): Promise<Set<string>> {
  const entries = await getSiteEntries();
  return new Set(
    [...entries.map((entry) => entry.path), ...STATIC_PATHS].map(normalizePath),
  );
}
