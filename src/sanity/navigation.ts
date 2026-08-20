import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type { NavLink } from "./firmDetails";

/* The site's menus. One fetch, four consumers: MainNav, Footer, AreasWeServe
 * and the JSON-LD builders.
 *
 * ⚠️ `serviceAreas` lives here rather than in Firm Details, and it is doing two
 * jobs: it is the Service Areas dropdown AND the `areaServed` given to Google
 * on 65+ pages. `[...slug].astro` throws if a location root has no entry here,
 * which is the check that keeps the two honest.
 *
 * The practice-area rows are REFERENCES, dereferenced to a label and an href
 * here so callers get the same `{ label, href }` shape the hardcoded array
 * produced. `navLabel` is the page's own short name; `label` overrides it only
 * where the nav needs it shorter.
 */
const NAVIGATION_QUERY = defineQuery(`
  *[_id == "navigation"][0]{
    practiceAreaLinks[]{
      _key,
      label,
      "slug": area->slug.current,
      "navLabel": area->navLabel
    },
    serviceAreas[]{ _key, label, navLabel, href },
    aboutLinks[]{ _key, label, href },
    resourcesLinks[]{ _key, label, href },
    footerNav[]{ _key, heading, links[]{ _key, label, href } },
    legalLinks[]{ _key, label, href }
  }
`);

export type ServiceArea = {
  _key: string;
  label: string;
  navLabel: string;
  href: string;
};

export type Navigation = {
  /** Already resolved to what the nav renders: a label and a real href. */
  practiceAreaLinks: { _key: string; label: string; href: string }[];
  serviceAreas: ServiceArea[];
  aboutLinks: NavLink[];
  resourcesLinks: NavLink[];
  footerNav: { _key: string; heading: string; links: NavLink[] }[];
  legalLinks: NavLink[];
};

type RawLink = {
  _key: string;
  label?: string;
  slug?: string;
  navLabel?: string;
};

/* Memoised in PROD the same way getFirmDetails() is: a static build asks once
   rather than once per page. Dev refetches so a Studio edit shows on refresh. */
let cache: Promise<Navigation> | undefined;

async function fetchNavigation(): Promise<Navigation> {
  const doc = (await sanityClient.fetch(NAVIGATION_QUERY)) as
    | (Omit<Navigation, "practiceAreaLinks"> & { practiceAreaLinks?: RawLink[] })
    | null;

  if (!doc) {
    throw new Error(
      "No `navigation` document in Sanity. Create it with:\n" +
        "  npx sanity exec scripts/import/navigation.ts --with-user-token -- --apply",
    );
  }

  /* A row whose referenced page was deleted resolves to no slug. That used to
     be a build failure by construction — the ids were in code and a bad one
     threw — so it stays one rather than silently dropping a menu row. */
  const practiceAreaLinks = (doc.practiceAreaLinks ?? []).map((link) => {
    if (!link.slug) {
      throw new Error(
        "Navigation: a Practice Areas dropdown row points at a page that no " +
          "longer exists. Fix it in the Studio under Site Settings → Navigation.",
      );
    }
    return {
      _key: link._key,
      label: link.label ?? link.navLabel ?? link.slug,
      /* The section root renders AT /family-law/, not under it — the same
         special case areaHref() and getStaticPaths() carry. */
      href: link.slug === "family-law" ? "/family-law/" : `/family-law/${link.slug}/`,
    };
  });

  return {
    practiceAreaLinks,
    serviceAreas: doc.serviceAreas ?? [],
    aboutLinks: doc.aboutLinks ?? [],
    resourcesLinks: doc.resourcesLinks ?? [],
    footerNav: doc.footerNav ?? [],
    legalLinks: doc.legalLinks ?? [],
  };
}

export function getNavigation(): Promise<Navigation> {
  if (!import.meta.env.PROD) return fetchNavigation();
  cache ??= fetchNavigation();
  return cache;
}
