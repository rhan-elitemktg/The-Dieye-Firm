/* The site's hardcoded paths, and the one way to normalize a path.
 *
 * ═══ Deliberately dependency-free ═══
 *
 * `src/sanity/routes.ts` imports this to assemble the full route list, and so
 * does the `redirect` schema's validation — and schema files are loaded by the
 * Sanity CLI during `npm run typegen`, where the `sanity:client` virtual module
 * does not resolve. Anything a schema imports has to stay clean of it, so
 * nothing in here may reach for Sanity.
 *
 * ═══ Trailing slashes are KEPT, unlike the reference build ═══
 *
 * Every URL this site serves ends in a slash — `/faq/`, `/family-law/divorce/`
 * — and every canonical already emitted says so
 * (`new URL("/faq/", Astro.site).href`). So the paths below carry their slash
 * and the sitemap emits them verbatim; changing that would point 95 canonicals
 * at URLs that only exist as a redirect.
 *
 * `normalizePath()` is the exception and drops the slash, because it exists to
 * COMPARE paths, not to emit them: `/about-us` and `/about-us/` are the same
 * page, and a redirect guard that thought otherwise would wave through a rule
 * that takes a live page off the site.
 */

/** Static routes backed by a Sanity document, keyed by that document's `_id`. */
export const DOCUMENT_BACKED: Record<string, string> = {
  homePage: "/",
  aboutPage: "/about-us/",
  hiringGuidePage: "/about-us/choosing-a-family-law-attorney/",
  practiceAreasPage: "/practice-areas/",
  blogPage: "/blog/",
  testimonialsPage: "/testimonials/",
  contactPage: "/contact-us/",
  faqPage: "/faq/",
  videoCenterPage: "/video-center/",
  clientPortalPage: "/client-portal/",
  privacyPolicyPage: "/privacy-policy/",
  sitemapPage: "/sitemap/",
  thankYouPage: "/thank-you/",
};

/**
 * Routes with no document of their own.
 *
 * Empty today: every page on this site is backed by a singleton or a collection
 * document. Kept as the named seam so a future code-only page has an obvious
 * home rather than being wedged into DOCUMENT_BACKED with a fake id.
 */
export const CODE_ONLY_PATHS: string[] = [];

/**
 * Paths that are not sitemap entries and must never be redirected away.
 *
 * `/admin` is the Studio, and a redirect pointed at it would lock the SEO team
 * out of the one tool they would use to undo it. `/thank-you/` is not here —
 * it is a real page — but it IS excluded from the sitemap below, because a form
 * confirmation has nothing to offer a searcher.
 */
export const RESERVED_PATHS = [
  "/404",
  "/admin",
  "/robots.txt",
  "/sitemap.xml",
  "/bulk-redirects.json",
];

/**
 * Real pages that are deliberately kept OUT of the sitemap.
 *
 * `/thank-you/` is only reachable by submitting the form; indexing it invites
 * Google to send people to a confirmation for something they never did.
 */
export const SITEMAP_EXCLUDED = ["/thank-you/"];

/** Every path known at build time, without touching Sanity. */
export const STATIC_PATHS = [
  ...Object.values(DOCUMENT_BACKED),
  ...CODE_ONLY_PATHS,
  ...RESERVED_PATHS,
];

/**
 * A path in comparison form: lowercase, one leading slash, NO trailing slash.
 * "/" is left alone — it is the one path whose trailing slash IS the path.
 *
 * Lowercasing matches Vercel's bulk redirects, which are case-insensitive
 * unless `caseSensitive` is set. Use this to compare two paths; use the stored
 * slash-bearing form to emit one.
 */
export function normalizePath(path: string): string {
  const trimmed = path.trim().toLowerCase().replace(/\/+$/, "");
  if (!trimmed) return "/";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/**
 * Both spellings of a path, for a matcher that compares exactly.
 *
 * Vercel's bulk redirects match the path as given and run BEFORE trailing-slash
 * normalization, and the legacy Scorpion URLs this site inherits are a mix of
 * both forms — so a rule emitted in one spelling silently misses half the
 * inbound traffic. `vercel.json`'s own 46 rules are already 23 such pairs.
 */
export function slashForms(path: string): string[] {
  const bare = normalizePath(path);
  return bare === "/" ? ["/"] : [bare, `${bare}/`];
}
