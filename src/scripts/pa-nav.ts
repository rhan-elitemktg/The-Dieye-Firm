/* pa-nav — the expand/collapse behaviour for the practice-area sidebar menu.
 *
 * Lives here rather than in FamilyLawNav.astro for the same reason lead-form.ts
 * does: the route binds it once for the document, and the component stays pure
 * markup. See src/pages/family-law/[...slug].astro.
 *
 * The markup is already correct before this runs. Each branch renders with
 * aria-expanded and an is-expanded class that match, and the CSS that hides a
 * closed branch is keyed on the `data-pa-boot` attribute the route's head
 * script sets — so the only thing left to do here is respond to clicks.
 *
 * Branches are independent: opening one does not close another. A visitor
 * comparing two branches should not have to keep reopening the first.
 */

export function initPracticeAreaNav(root: ParentNode = document) {
  for (const toggle of root.querySelectorAll<HTMLButtonElement>("[data-pa-toggle]")) {
    if (toggle.dataset.paNavBound) continue;
    toggle.dataset.paNavBound = "true";

    toggle.addEventListener("click", () => {
      const row = toggle.closest(".fl__row");
      if (!row) return;

      const expanded = row.classList.toggle("is-expanded");
      toggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });
  }
}
