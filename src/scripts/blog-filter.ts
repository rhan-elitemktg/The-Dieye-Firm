/* Blog index — category filtering and paging.
 *
 * Every post is in the document already (PostGrid renders all of them), so
 * both jobs are visibility passes over existing markup. With 16 posts that
 * beats a round trip, and it lets a pre-filtered arrival resolve without a
 * fetch — see FilterBoot for how the first paint is kept honest.
 *
 * Bound by the page rather than by a component: a component's <script> renders
 * a stray hoisted tag wherever the component sits, which is what bit the
 * sidebar form (AGENTS.md).
 */

import { CATEGORY_PARAM, categoryLabel } from "../components/blog/blog";

/* Cards revealed per Load More click. A multiple of three, like the initial
   batch, so the 3-up desktop grid never ends on a short row. */
const STEP = 6;

export function initBlogFilter(): void {
  const grid = document.querySelector<HTMLElement>("[data-blog-grid]");
  const chipRow = document.querySelector<HTMLElement>("[data-blog-chips]");
  const moreBtn = document.querySelector<HTMLButtonElement>("[data-blog-more]");
  const status = document.querySelector<HTMLElement>("[data-blog-status]");
  const root = document.documentElement;

  if (!grid || !chipRow || !moreBtn) return;

  const items = Array.from(grid.querySelectorAll<HTMLElement>(".pg__item"));
  const chips = Array.from(chipRow.querySelectorAll<HTMLAnchorElement>("[data-cat]"));
  const valid = new Set(chips.map((c) => c.dataset.cat).filter(Boolean) as string[]);

  /* Read from the markup rather than repeated as a constant, so the initial
     batch is only ever set in one place — PostGrid's `initial` prop. */
  const rest = items.filter((el) => el.dataset.rest !== undefined).length;
  const INITIAL = items.length - rest || items.length;

  const readParam = (): string | null => {
    const value = new URLSearchParams(location.search).get(CATEGORY_PARAM);
    return value && valid.has(value) ? value : null;
  };

  let category = readParam();
  let shown = INITIAL;

  const matches = (el: HTMLElement) =>
    !category || (el.dataset.cats ?? "").split(" ").includes(category);

  interface RenderOpts {
    /* Index within the visible set from which cards should animate in. -1
       animates nothing, which is what first paint wants: there is no change to
       explain, and the delay would only hold up the content. */
    animateFrom?: number;
    announce?: boolean;
  }

  function render({ animateFrom = -1, announce = false }: RenderOpts = {}): void {
    const visible = items.filter(matches);

    for (const el of items) {
      el.classList.add("is-hidden");
      el.classList.remove("is-entering");
    }

    /* Removing and re-adding the class in one task would not restart the
       animation — the browser only ever sees the end state. This flush makes
       the removal real so the re-add counts as a new one. */
    if (animateFrom >= 0) void grid!.offsetHeight;

    visible.slice(0, shown).forEach((el, i) => {
      el.classList.remove("is-hidden");
      if (animateFrom >= 0 && i >= animateFrom) {
        el.style.setProperty("--i", String(i - animateFrom));
        el.classList.add("is-entering");
      }
    });

    moreBtn!.hidden = visible.length <= shown;

    for (const chip of chips) {
      const on = (chip.dataset.cat || null) === category;
      if (on) chip.setAttribute("aria-current", "true");
      else chip.removeAttribute("aria-current");
    }

    if (status && announce) {
      const count = Math.min(shown, visible.length);
      const scope = category ? ` in ${categoryLabel(category)}` : "";
      status.textContent = `Showing ${count} of ${visible.length} posts${scope}.`;
    }
  }

  function select(next: string | null, href: string): void {
    if (next === category) return;
    category = next;
    shown = INITIAL;
    history.pushState({ [CATEGORY_PARAM]: next }, "", href);
    render({ animateFrom: 0, announce: true });
  }

  chipRow.addEventListener("click", (event) => {
    /* Let the browser handle anything that isn't a plain left click, so
       middle-click and cmd-click still open the filter in a new tab. */
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    const chip = (event.target as HTMLElement).closest<HTMLAnchorElement>("[data-cat]");
    if (!chip) return;

    event.preventDefault();
    select(chip.dataset.cat || null, chip.href);
  });

  /* The chips are real links and push real history entries, so Back has to put
     the previous filter back rather than leaving the page. */
  window.addEventListener("popstate", () => {
    category = readParam();
    shown = INITIAL;
    render({ animateFrom: 0, announce: true });
  });

  moreBtn.addEventListener("click", () => {
    const from = shown;
    shown += STEP;
    render({ animateFrom: from, announce: true });

    /* When the last batch lands the button goes away, which would drop focus
       to the top of the document. Hand it to the first new card instead. Only
       when the button actually vanished — otherwise a mouse click would cause
       an unasked-for scroll. */
    if (moreBtn.hidden) {
      const firstNew = items.filter((el) => !el.classList.contains("is-hidden"))[from];
      firstNew?.querySelector<HTMLAnchorElement>("a")?.focus();
    }
  });

  render();

  function scrollToFilter(): void {
    const chipRow = document.querySelector(".cf");
    if (!chipRow) return;

    /* The header is sticky, so scrollIntoView would tuck the chips underneath
       it. Measured rather than tokenised because the header is two-tone and
       its height changes with the breakpoint. */
    const header = document.querySelector("header");
    const offset = (header?.getBoundingClientRect().height ?? 0) + 16;
    const top = chipRow.getBoundingClientRect().top + window.scrollY - offset;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, top), behavior: still ? "auto" : "smooth" });
  }

  /* Hand over from FilterBoot's pre-paint rules in the same synchronous pass
     that applied the real state, so the two can never both be live for a
     frame. The button reveals itself here too: without a script there is
     nothing hidden for it to load. */
  moreBtn.setAttribute("data-blog-ready", "");
  root.removeAttribute("data-blog-boot");

  /* Arriving with a filter already applied means the visitor came from a
     category link elsewhere on the site — a post's sidebar or its kicker. The
     top of the page is the wrong place to put them: they asked for a category,
     and the chip row is what shows which one they got. So open on the chips,
     with the featured post left just above to scroll back to.

     Only on arrival. Clicking a chip in place must not move the page — you are
     already looking at the row you clicked.

     Waits for `load`: this module is deferred, so it runs before the browser
     has finished settling a fresh navigation at the top of the document, and
     a scroll issued now is simply undone a moment later. */
  if (category) {
    if (document.readyState === "complete") scrollToFilter();
    else window.addEventListener("load", scrollToFilter, { once: true });
  }
}
