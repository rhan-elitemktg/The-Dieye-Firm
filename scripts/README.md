# scripts/

Two small tools for checking the site in a real browser, from the terminal.
They drive whatever Chrome is already on the machine in headless mode. No
Playwright, no Puppeteer, nothing to install — Node 22+ ships the one piece
(`WebSocket`) that would otherwise need a dependency.

Start the dev server first (`npm run dev`), then:

## `npm run shot` — take a screenshot

Renders the page and saves a PNG to `.screenshots/` (gitignored).

```bash
npm run shot -- .faq                       # just that section
npm run shot -- .faq --width 430           # at phone width
npm run shot -- .hero --out hero.png       # to a specific path
npm run shot -- --url http://localhost:4321/contact-us/   # whole page, other route
```

Pass a CSS selector and it crops to exactly that element, at its full height,
even if that runs past the bottom of the window. Before capturing it forces
every lazy image to load, waits for fonts, and waits for images to decode — a
screenshot of half-loaded artwork isn't worth looking at.

## `npm run probe` — measure something

Runs a snippet of JavaScript against the page and prints whatever it returns
as JSON. Use it to measure things a screenshot can't show: computed styles,
element geometry, whether a transition actually animates.

```bash
npm run probe -- scripts/checks/font-shift.js
npm run probe -- scripts/checks/font-shift.js --width 430
npm run probe -- --eval "document.querySelectorAll('.tcard').length"
```

### `checks/font-shift.js`

Finds text that re-wraps when a webfont finishes loading — the kind of
layout shift that hurts the CLS score. It measures every heading twice, once
with the real font and once with its fallback, and reports anything whose
height changes.

```
$ npm run probe -- scripts/checks/font-shift.js
{
  "viewport": 1440,
  "elementsChecked": 68,
  "shifts": [],
  "verdict": "no font-swap reflow"
}
```

A non-empty `shifts` array means those elements move when the font swaps in.
The fix is normally a `min-height` on the element, sized to the taller of the
two line counts, so the space is reserved before the swap happens.

Run it at 1440, 1000, and 430 — an element can be stable at one width and
shift at another.

## Why these exist

The preview pane built into the editor runs the page in a background tab.
Chrome throttles those: screenshots come back blank, animations never
advance, and lazy images never load. These scripts use a real browser
window instead, so what you get back is what a visitor would actually see.

`CHROME_PATH=/path/to/chrome` overrides browser discovery if needed.
