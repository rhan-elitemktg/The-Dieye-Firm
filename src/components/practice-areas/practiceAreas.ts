import type { PracticeArea } from "../../sanity/practiceAreas";

export type { PracticeArea };

/* The section root: a real practice-area page ("Pearland Family Lawyer") that
   lives AT /family-law/ rather than under it. It is the one page whose file
   path is not its route, because there is no filename for an empty slug — see
   SECTION_ROOT in scripts/scrape-practice-areas.mjs. The index the comp
   describes is a different page, at /practice-areas/. */
export const SECTION_ROOT_ID = "family-law";

/* `id` IS the route tail — "divorce", "divorce/military-divorce" — taken
   straight from the document's slug. Nothing reassembles a path from the parent
   chain, and it must not start: eight pages sit under a parent in the sidebar
   while keeping a top-level URL, so a derived path would move them. The section
   root is the single documented exception. */
export const areaHref = (area: PracticeArea) =>
  area.id === SECTION_ROOT_ID ? "/family-law/" : `/family-law/${area.id}/`;

/* Sorting, nesting and branch resolution are shared with the location menus —
   both collections carry `navLabel` and an optional `parent`, and the two
   sidebars must order rows the same way. See src/components/interior/tree.ts. */
export { byLabel, branchOf, buildTree } from "../interior/tree";
