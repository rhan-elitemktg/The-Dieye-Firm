/* tree.ts — the shape of a two-level sidebar menu.
 *
 * Extracted alongside TreeNav so the practice-area menu and the location menus
 * sort and nest identically by construction rather than by two people
 * remembering the same rule. Typed on the minimum both collections share, so
 * neither has to know about the other.
 */

export type TreeEntry = { id: string; data: { navLabel: string; parent?: string } };

/* Alphabetical, and deliberately so. The client's own order is alphabetical
   except where pages were appended as they were written, which at 18 entries
   reads as a ranking rather than as a list. Sorting invents nothing; it is the
   same labels.

   Sorted on navLabel, not title: every title is SEO-shaped ("Pearland Divorce
   Lawyer", "Sugar Land Paternity Attorney"), so sorting on it would file two
   thirds of a section under P or S. */
export const byLabel = (a: TreeEntry, b: TreeEntry) =>
  a.data.navLabel.localeCompare(b.data.navLabel, "en");

/* Which top-level branch a page belongs to — itself if it is top-level, its
   parent if it is a child. The sidebar opens exactly this one. */
export const branchOf = (entry: TreeEntry) => entry.data.parent ?? entry.id;

export type Branch<T> = { item: T; children: T[] };

/* One pass, so the parent list and the child lists can't disagree about who
   owns what.
 *
 * Order is alphabetical within two groups, entries with children first. The
 * expandable rows are the ones that reward a second look, and grouping them
 * puts every "+" together at the top rather than scattering them down a long
 * list where they read as inconsistency rather than as structure. */
export function buildTree<T extends TreeEntry>(entries: T[]): Branch<T>[] {
  const children = new Map<string, T[]>();
  for (const entry of entries) {
    const parent = entry.data.parent;
    if (!parent) continue;
    children.set(parent, [...(children.get(parent) ?? []), entry]);
  }

  return entries
    .filter((entry) => !entry.data.parent)
    .map((item) => ({
      item,
      children: (children.get(item.id) ?? []).sort(byLabel),
    }))
    .sort((a, b) => {
      const byGroup = Number(b.children.length > 0) - Number(a.children.length > 0);
      return byGroup !== 0 ? byGroup : byLabel(a.item, b.item);
    });
}
