/* Finds text that re-wraps when the real webfont replaces its fallback.
 *
 * Astro's `optimizedFallbacks` matches average character width, which keeps
 * most text stable — but a heading sitting near a line-break boundary can
 * still flip from one line to two the moment the real face swaps in, shifting
 * everything below it. That is invisible in a screenshot and shows up as CLS.
 *
 *   npm run probe -- scripts/checks/font-shift.js
 *   npm run probe -- scripts/checks/font-shift.js --width 430
 *
 * Anything listed under `shifts` needs its height reserved — usually a
 * min-height of the taller line count on the offending element.
 */
(() => {
  const SELECTORS = [
    "h1", "h2", "h3", "h4",
    ".hero__title", ".hero__stat-value",
    ".about__title", ".about__body h3", ".pullquote blockquote", ".testimonial__quote",
    ".pa__title", ".pa-card__title", ".pa-card__text",
    ".fa__title", ".fa__quote", ".fa__sign", ".fa__badge-num",
    ".tst__title", ".tcard__lead", ".tcard__body",
    ".sp__title", ".sp-card__title", ".sp-card__text",
    ".faq__title", ".faq__q", ".faq__a",
    "body",
  ];

  const measure = (el, family) => {
    const previous = el.style.fontFamily;
    el.style.fontFamily = family;
    void el.offsetHeight;
    const h = Math.round(el.getBoundingClientRect().height);
    el.style.fontFamily = previous;
    void el.offsetHeight;
    return h;
  };

  const shifts = [];
  let checked = 0;

  for (const selector of SELECTORS) {
    document.querySelectorAll(selector).forEach((el, i) => {
      const stack = getComputedStyle(el).fontFamily;
      const parts = stack.split(",").map((s) => s.trim());
      if (parts.length < 2) return;
      checked++;

      const real = measure(el, stack);
      // Drop the real face and let the metric-matched fallback take over.
      const fallback = measure(el, parts.slice(1).join(", "));
      if (real !== fallback) {
        shifts.push({
          selector: `${selector}${document.querySelectorAll(selector).length > 1 ? ` [${i}]` : ""}`,
          fallbackHeight: fallback,
          realHeight: real,
          deltaPx: real - fallback,
          text: (el.textContent ?? "").trim().slice(0, 60),
        });
      }
    });
  }

  return {
    viewport: innerWidth,
    elementsChecked: checked,
    shifts: shifts.sort((a, b) => Math.abs(b.deltaPx) - Math.abs(a.deltaPx)),
    verdict: shifts.length ? `${shifts.length} element(s) reflow on font swap` : "no font-swap reflow",
  };
})();
