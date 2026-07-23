/* Line count for the hero headline, real font vs fallback, at whatever width
 * the probe was launched with. Run it across the range to find where a
 * headline flips from N lines to N+1 on font swap:
 *
 *   for w in 1920 1440 1200 1000 900 700; do
 *     npm run probe -- scripts/checks/hero-lines.js --width $w
 *   done
 */
(() => {
  const el = document.querySelector(".hero__title");
  const stack = getComputedStyle(el).fontFamily;
  const fallback = stack.split(",").slice(1).join(",");

  const read = (family) => {
    const previous = el.style.fontFamily;
    el.style.fontFamily = family;
    void el.offsetHeight;
    const cs = getComputedStyle(el);
    const height = el.getBoundingClientRect().height;
    const result = {
      lines: Math.round(height / parseFloat(cs.lineHeight)),
      height: Math.round(height),
      fontSize: Math.round(parseFloat(cs.fontSize)),
    };
    el.style.fontFamily = previous;
    void el.offsetHeight;
    return result;
  };

  const real = read(stack);
  const fb = read(fallback);

  return {
    viewport: innerWidth,
    contentWidth: Math.round(document.querySelector(".hero__content").getBoundingClientRect().width),
    fontSize: real.fontSize,
    realLines: real.lines,
    fallbackLines: fb.lines,
    shiftPx: real.height - fb.height,
  };
})();
