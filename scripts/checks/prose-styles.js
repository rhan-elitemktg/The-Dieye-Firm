/* Computed styles for prose that moved into a Portable Text renderer.
 *
 *   npm run probe -- scripts/checks/prose-styles.js --url http://localhost:PORT/family-law/mediation-vs-litigation/
 *
 * This checks the one class of regression an HTML diff structurally CANNOT see.
 *
 * Astro scopes a component's styles by stamping a hash onto the elements in
 * that component's own template. Markup rendered by a CHILD component never
 * receives it, so the moment a <p> moves from a page's template into a renderer,
 * every scoped rule targeting it stops matching. The markup stays correct, the
 * build stays green, the text is all present — and the type silently reverts to
 * browser defaults. A diff that ignores `data-astro-cid` to reduce noise is
 * exactly blind to it.
 *
 * The fix is `.parent :global(child)`, and this is what proves the fix landed.
 *
 * Run it against the PRE-migration build first and keep the numbers; a check
 * written after the change only proves the change is self-consistent.
 */
(() => {
  const expect = [];
  const px = (el, prop) => (el ? getComputedStyle(el).getPropertyValue(prop).trim() : null);

  const check = (label, selector, prop, want) => {
    const el = document.querySelector(selector);
    const got = px(el, prop);
    expect.push({
      label,
      selector,
      prop,
      want,
      got,
      pass: el ? got === want : false,
      found: Boolean(el),
    });
  };

  /* FAQ answers — the paragraph that moved into ProseBody. `.pfaq__a p` is a
     scoped rule, so this is the F14 canary. */
  check("faq answer size", ".pfaq__a p", "font-size", "17px");
  check("faq answer leading", ".pfaq__a p", "line-height", "28.9px");
  check("faq answer colour", ".pfaq__a p", "color", "rgb(71, 82, 96)");

  /* Article body — .prose is UNSCOPED in global.css precisely so it survives
     this, and the per-page size override lives in the page's own scoped style
     on a div the page still owns. Both must still apply. */
  check("body paragraph size", ".prose p", "font-size", "18px");
  check("body h2 present", ".prose h2", "display", "block");
  check("body link underline", ".prose a", "text-decoration-line", "underline");

  const failures = expect.filter((e) => !e.pass);
  return {
    url: location.pathname,
    passed: expect.length - failures.length,
    failed: failures.length,
    failures: failures.map((f) => `${f.label}: ${f.found ? `${f.prop} ${f.got} (want ${f.want})` : "NOT FOUND"}`),
    detail: expect,
  };
})();
