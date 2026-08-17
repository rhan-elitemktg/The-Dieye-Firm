import type { CollectionEntry } from "astro:content";

export type PracticeArea = CollectionEntry<"practiceAreas">;

/* The section root: a real practice-area page ("Pearland Family Lawyer") that
   lives AT /family-law/ rather than under it. It is the one page whose file
   path is not its route, because there is no filename for an empty slug — see
   SECTION_ROOT in scripts/scrape-practice-areas.mjs. The index the comp
   describes is a different page, at /practice-areas/. */
export const SECTION_ROOT_ID = "family-law";

/* The collection id IS the route tail — "divorce", "divorce/military-divorce"
   — because the scraper writes the files in that shape. Nothing reassembles a
   path from parts, so a page can't end up at a URL its file doesn't describe.
   The section root is the single documented exception. */
export const areaHref = (area: PracticeArea) =>
  area.id === SECTION_ROOT_ID ? "/family-law/" : `/family-law/${area.id}/`;

/* Alphabetical, and deliberately so. The client's own order is alphabetical
   except Mothers' Rights and Fathers' Rights, which sit at the end because
   they were added last — at 18 entries that reads as a ranking rather than as
   a list. Sorting invents nothing; it is the same 18 labels.

   Sorted on navLabel, not title: every title is SEO-shaped ("Pearland Divorce
   Lawyer"), so sorting on it would file two thirds of the section under P. */
export const byLabel = (a: PracticeArea, b: PracticeArea) =>
  a.data.navLabel.localeCompare(b.data.navLabel, "en");

export type AreaBranch = { area: PracticeArea; children: PracticeArea[] };

/* The section as the client models it: 18 top-level areas, two of which have
   children (10 under divorce, 3 under child-custody). One pass, so the parent
   list and the child lists can't disagree about who owns what.

   Order is alphabetical within two groups, areas with children first. The
   expandable rows are the ones that reward a second look, and grouping them
   puts every "+" together at the top rather than scattering two of them down
   an 18-row list where they read as inconsistency rather than structure. */
export function buildTree(areas: PracticeArea[]): AreaBranch[] {
  const children = new Map<string, PracticeArea[]>();
  for (const area of areas) {
    const parent = area.data.parent;
    if (!parent) continue;
    children.set(parent, [...(children.get(parent) ?? []), area]);
  }

  return areas
    .filter((area) => !area.data.parent)
    .map((area) => ({
      area,
      children: (children.get(area.id) ?? []).sort(byLabel),
    }))
    .sort((a, b) => {
      const byGroup = Number(b.children.length > 0) - Number(a.children.length > 0);
      return byGroup !== 0 ? byGroup : byLabel(a.area, b.area);
    });
}

/* Which top-level branch a page belongs to — itself if it is top-level, its
   parent if it is a child. The sidebar opens exactly this one. */
export const branchOf = (area: PracticeArea) => area.data.parent ?? area.id;

