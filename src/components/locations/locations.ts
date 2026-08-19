import type { LocationPage } from "../../sanity/locationPages";

export type { LocationPage };

/* `id` IS the route, whole — "sugar-land-family-law-attorney",
   "sugar-land-family-law-attorney/divorce/uncontested-divorce". These URLs sit
   at the site ROOT, so unlike the practice areas there is no prefix to add and
   no section-root exception: every id is its own path. Nothing reassembles a
   route from parts, so a page cannot end up at a URL its slug doesn't name. */
export const locationHref = (page: LocationPage) => `/${page.id}/`;

/* The location root a page belongs to. `location` points at itself on a root,
   so this is total — no branch, and no caller has to ask "am I a root?" first.

   It is a lookup rather than a path derivation because two Pasadena pages hang
   off the site root and their paths do not name their location. See the note
   on `location` in src/sanity/schemaTypes/locationPage.ts. */
export const rootOf = (pages: LocationPage[], page: LocationPage) =>
  pages.find((candidate) => candidate.id === page.data.location);

/* Everything in a location's menu: its pages, minus the root itself. The root
   is the card's own title link, not a row — the same shape as /practice-areas/
   heading the practice-area card rather than sitting inside it. */
export const pagesIn = (pages: LocationPage[], location: string) =>
  pages.filter((page) => page.data.location === location && page.id !== location);
