# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-18, on the `video_center` branch._

---

## Start here

**`/video-center/` is built.** Nine videos in one 3-across grid, on the branch
and **not committed**. It was item 1 on the list below; the homepage's
`/videos/` link is fixed in the same change, so two of the seven dangling
routes are gone.

**What's left, in the order Rhan set on 2026-08-18:**

1. **`/faq/`** — a real section of the live site with the client's own prose,
   so the same rule that governed the four ingests applies. Finishes the
   Resources flyout.
2. **`/privacy-policy/`, `/disclaimer/` and `/sitemap/`** — the three footer
   links that still 404.

**Still unscheduled, and still the only thing between the site and a real
enquiry: the lead form has no endpoint.** `lead-form.ts` cancels submission and
confirms inline, so `/thank-you/` remains unreachable. It needs a decision about
where leads go before it can be built.

---

## Where we are

Branch `video_center`, cut from `master`. **Everything below is uncommitted.**
Build passes at **90 pages** (was 89).

| | |
|---|---|
| New | `src/pages/video-center.astro` |
| New | `src/components/video-center/VideoGrid.astro`, `VideoTile.astro` |
| New | `scripts/checks/video-center.js` |
| Changed | `src/components/blog/BlogHeader.astro` — optional `eyebrow` prop |
| Changed | `src/components/home/VideoReels.astro` — CTA `/videos/` → `/video-center/` |
| Changed | `src/pages/[...slug].astro` — `"video-center"` added to `RESERVED` |
| Changed | `vercel.json` — 8 redirects (4 paths × both slash forms) |

The `master` work before this branch is all pushed; PR #27 took `location_pages`
in, plus one commit on top for the scraper regex fix.

---

## What landed this session

### The video centre — nine videos, no new assets, no new JavaScript

The page is a header, a grid and `WhatDrivesUs`. The heavy lifting was already
in the repo: `VideoModal.astro` is a shared click-to-load Wistia modal rendered
once from `Layout`, and any element opts in with four `data-*` attributes. The
new page therefore **ships no script of its own**, and the office map is still
the only embed without a facade.

Runtimes come from Wistia's oEmbed at build time, the same try/catch shape as
`VideoReels.astro`, so an outage costs the duration pills and not the build.

**`xnom95l12h` replaced `z79lx3x00o` everywhere**, at Rhan's direction: the
firm shot a new About Us video, so the old one is gone from the video centre,
the **homepage About card** and the **`/testimonials/` video tile**, and the
hardcoded id in `scripts/checks/video-modal.js` moved with it. A grep for
`z79lx3x00o` across `src/` and `scripts/` now returns nothing. The new cut is
1:44 where the old was 1:55, so the About card's aria-label runtime changed
too — it is fetched at build time and needed no edit.

**"About The Dieye Firm" leads the grid**, also Rhan's call. Only the two
VIDEOS swapped; the two POSTERS stayed where they were, because moving them
would have put the storefront pair in positions 2 and 8 — the same column at
3-up — for no gain. Poster order is geometry, video order is editorial, and
they are allowed to disagree.

**The ten ids Rhan supplied contain a duplicate** — `e15abitkx1` is listed
twice — so the page has **nine** videos. Six of them are the vertical shorts
already on the homepage; three are the studio pieces from the live
`/video-center/`.

---

## Decisions made — don't relitigate

- **One 3-across grid, every card 16:9, every poster `object-fit: cover`.**
  Rhan's call over the two alternatives he was shown: two bands (16:9 then
  9:16), or one 16:9 grid with the portrait posters contained over a blurred
  copy of themselves. The video's own shape survives where it matters — each
  tile passes its true `data-video-aspect`, so a short opens 9:16 in the modal
  and a studio piece opens 16:9. The card's shape and the video's shape
  disagree on purpose, and `scripts/checks/video-center.js` guards that.
- **Posters are photographs already in `src/assets/images/`.** No new assets and
  no Wistia thumbnails. `btxq2ysibw`'s still is Papa mid-sentence and
  `e15abitkx1` is a whiteboard explainer whose still is a near-blank white frame
  reading "BILLING".
- **The poster ORDER is load-bearing and is commented as such in the
  component.** Nine distinct files but only six distinct shoots, so three
  shoots appear twice and the pairs have to stay apart at three column counts
  (3-up, 2-up, and one column where DOM order *is* visual order). Positions 4
  and 9 are the only pairing that separates at all three, and they go to the
  tan-jacket pair — `papa-tan-wide` and `papa-hero-b` are two crops of one
  frame and the only pair that reads as a mistake. **They were consecutive on
  mobile in the first build; that is what the order exists to fix.** Anyone
  reordering this grid has to re-check 430 as well as 1600.
- **The custody short sits fifth, not fourth**, so it keeps `comm-n1` — the
  community day with families and children. Wanting both that pairing and that
  poster order is the only reason the video order differs from the live site's.
- **Two labels, not per-video categories.** "The Firm" for the three studio
  pieces, "Quick Answer" for the six shorts. Real categories would have put
  "Divorce" on five of nine.
- **The three studio titles are the live site's labels**, not Wistia's:
  "Choosing An Attorney", not "How to Find Family Law Lawyer Houston Texas".
  The equity is on the live page. The six shorts keep the curated titles
  `VideoReels.astro` already set, for the reason stated there.
- **`CollectionPage` JSON-LD, not `VideoObject`.** `VideoObject` wants an
  `uploadDate` and a real per-video description, neither of which exists, and
  the `thumbnailUrl` it would declare is one of our own photographs rather than
  a frame from the video. Same reasoning as `testimonials.astro`. See *Waiting
  on Rhan*.
- **No per-video detail pages.** The three live ones carry a video and nothing
  else — no description, no transcript — so there is nothing to build them from.
  All four live child URLs 301 to `/video-center/` instead.
- **No content collection and no scraper.** Nine hand-curated entries with
  authored titles are a named array in component frontmatter, which is what the
  Sanity sweep wants.
- **`BlogHeader` gained an optional `eyebrow` prop rather than being cloned or
  moved.** `/blog/` passes nothing and is a proven no-op (below). If a third
  page ever wants it, it graduates to `interior/PageHeader.astro`; two does not
  justify the move.

---

## Verified

All measured against a static server of `dist/` on a spare port, not the dev
server, and diffed against a `dist/` snapshot taken before the first edit.

- Build **90 pages**. **Of the 89 pre-existing pages, exactly one body
  changed** — the homepage, and only its reels CTA href.
- **CSS rule sets identical**: `/blog/` 394 / 394, `/` 722 / 722, comparing
  every rule from every inline `<style>` and every linked stylesheet with
  `@media` context flattened in. Astro moved `BlogHeader`'s rules from a bundle
  into an inline block and re-hashed the page's CSS chunk, so the files differ
  and **the rules do not**.
- `scripts/checks/video-center.js`: **60 / 60**. Nine unique ids, six declared
  9/16 and three 16/9, each tile opening its own id with its own aspect
  reaching `--video-ar`, dialog labelled, scroll locked, exactly one iframe per
  open, and teardown plus focus restore on all three close paths.
- **No Wistia iframe before any click.**
- No horizontal overflow at **1920 / 1441 / 1440 / 1000 / 768 / 650 / 430**;
  columns ramp 3 / 3 / 3 / 2 / 2 / 1 / 1; no duplicate ids, no orphaned labels.
- Zero console errors, zero broken images (15 images).
- **No poster is upscaled** — every `srcset` candidate is at or below its
  source width.
- 31 internal hrefs on the page; 5 unresolved, all pre-existing and listed
  below. `/videos/` is gone from the entire build.
- Font swap: the only reflow is the known `WhatDrivesUs` one.

---

## Things that would surprise you

- **`scripts/checks/video-modal.js` fails one assertion, and did before this
  branch.** Its "no iframes before click" counts *every* iframe, and the
  sitewide Contact section carries the Google map — so it reports 16 / 1 on the
  homepage in both the baseline and the current build. The new
  `video-center.js` states the invariant as "no **Wistia** iframe before click"
  and separately asserts the map is the only pre-click frame, so the two facts
  stay apart. Fixing `video-modal.js` is a one-line change nobody has made;
  leave it failing rather than making it pass without deciding.
- **`scripts/checks/blog-forms.js` does not apply to this page.** It asserts
  *two* lead forms and errors with "expected 2 lead forms, found 1" — on
  `/testimonials/` too, as a control. It is a check for the two-form page shapes
  (blog posts, practice areas, locations), not for every page rendering
  `Contact`.
- **`npx serve -s dist` silently serves the homepage for `/video-center/`.**
  The `-s` flag rewrites to `index.html`, so a probe reports the wrong page's
  DOM while `curl` returns 200 and looks fine. Cost twenty minutes once. Use
  `python3 -m http.server` from inside `dist/`.
- **`npm run shot --out <name>` writes to the repo root, not `.screenshots/`.**
  Pass a path (`.screenshots/foo.png`) or clean up after.
- **`e15abitkx1` is a whiteboard-animation explainer**, not a talking head. Its
  Wistia still is a line-drawn cartoon and the word BILLING on white. The other
  eight are Papa on camera.
- **The photo library has far fewer photographs than files.** Nine landscape
  frames are wide enough for a 460px card, but they come from six shoots:
  `papa-tan-wide` / `papa-hero-b` are one frame twice, `papa-storefront` /
  `hero-practice` are one shoot mirrored, and `papa-old-town-portrait` /
  `video-poster-pearland` / `papa-old-town-pearland.png` are three crops of one
  street shot. `ss-video-1.jpg` is a stock portrait of an unrelated man.
- **A card title cannot cause layout shift here.** `.vc-tile__content` is
  absolutely positioned against the bottom of a fixed 16:9 frame, so a title
  going two lines to three grows upward over the photo and moves nothing.
- **`video-poster-pearland.jpg` is 960×407**, so a 16:9 cover crop leaves only
  723px of width and it would upscale on a desktop card. It is therefore not
  used on `/video-center/` at all, only on the homepage About card where it is
  laid out differently.
- **`ColumnContentExpand_1..8` on a location page is not a container.** Those
  ids sit on `<a>` and `<span>` elements inside the CTA phone links, carrying
  Scorpion's `{F:P:Cookie:…}` replacement tokens. `scrape-locations.mjs`
  measures the content wrapper against `#MainContent` instead.
- **Alignment is not the CTA signature; `txt-hlt` is.** 62 of the 65 phone-plug
  paragraphs are centred and one is `text-align:right`. `class="txt-hlt"` OR
  centred takes exactly the 63 that are chrome.
- **Coverage that excludes the FAQ reads like data loss.** The FAQ words come
  out of the same `#MainContent` the source total is measured on, so they belong
  in the numerator.
- **`RESERVED` at module scope fails.** Astro builds `getStaticPaths` into its
  own prerender chunk, where a module-level const is not defined. Declare it
  inside the function. **Any new root-level page must be added to it** —
  `/video-center/` was.
- **`#ContentS4` is a `<section>`, not a `<div>`.**
- **A dev server started before `content.config.ts` changed cannot serve a new
  collection.** Serving `dist/` on another port is the better move anyway.
- **The interior `h1` reflows on font swap**, ~58px at 1440, sitewide.
- **Scorpion's phone links carry TWO href-like attributes**, and a greedy regex
  takes the wrong one. Fixed; nothing ever shipped with it and the live site is
  fine.
- **`sed -E` on macOS does not support `\b`.**
- **`zsh` does not word-split unquoted variables.** Use an array.
- **`/family-law/` is a content page and `/practice-areas/` is the index.**
  `locations` versus `firmDetails.serviceAreas` is the same trap.
- **`npm run shot` and `npm run probe` force lazy images to load**, so a probe
  reports every image as `loading="eager"`. Check `dist/` for the truth.
- **The headless lib drops CDP events**, so there is no console-error check in
  `scripts/checks/`. Inject a collector via
  `Page.addScriptToEvaluateOnNewDocument` before `goto` — that is how this
  session's zero-errors result was measured.
- **`CLAUDE.md` is a symlink to `AGENTS.md`.** Edit `AGENTS.md`.
- **Rhan runs the dev server from his IDE.** Check 4321 before starting a second.

---

## Waiting on Rhan

1. **The lead form still has no endpoint.** `lead-form.ts` cancels submission
   and confirms inline, so `/thank-you/` is unreachable.
2. **`/thank-you/` says nothing about what happens next** — no response time,
   no "call us if it's urgent". The wording is a commitment on the firm's
   behalf.
3. **`VideoObject` markup needs data only the firm has** — an upload date and a
   one-line description per video, and ideally a real frame from each as the
   thumbnail. With those, `/video-center/` becomes eligible for video rich
   results; without them the markup would be guesswork.
4. **The `/testimonials/` video tile is still a placeholder, and the new video
   makes the mismatch plainer.** It is labelled "Video Testimonial" /
   "Watch their story" over a stock-photo poster of a man unconnected to the
   firm, and it plays the firm's own About Us video. A real client video, or
   dropping the tile, is the fix; the poster question was closed on 2026-08-18
   but the label question was not.
5. **Send the firm `docs/live-site-corrections.md`.** Two errors in their own
   published copy, both already fixed on the new site and both still live:
   **"Pasadena, CA" on a Texas page**, and the "Lawyer" singular-for-plural typo
   in **13 places** across twelve pages, three of them in meta descriptions.
6. **Authored strings with no comp behind them** — now including
   **`/video-center/`'s kicker ("Watch & Learn"), deck and meta description**,
   plus the page title and meta description on `/thank-you/`, `/testimonials/`,
   `/contact-us/`, `/about-us/choosing-a-family-law-attorney/`, and the A–Z
   section head on `/practice-areas/`.
7. **26 of the 32 practice-area pages and 26 of the 32 location pages close with
   a "come talk to us" section.** Kept deliberately — six end on real content
   that must survive. Trivial to strip later, impossible to recover if dropped.
8. **FAQ answers flatten to one paragraph.** `PracticeAreaFaqs` renders
   `<p>{answer}</p>`, so a multi-paragraph source answer joins with a space —
   14 pages, ~37 answers. Fixing it changes a component 64 routes render.
9. **The source FAQ headings are more specific than the rendered one.** Five
   pages say "Frequently Asked Questions About Divorce in Harris County". A
   `faqsHeading` field would fix it.
10. **`modifications-enforcement` is 290 words**, the thinnest practice area and
   the only one where the sidebar overhangs the article.
11. **The August blog post is categorised by us, not the client**
    (`child-custody` via `CATEGORY_OVERRIDES`) and still has no artwork.
12. **Two near-duplicate blog posts** — `understanding-child-custody-laws`
    (2025-01) and `understanding-child-custody-laws-in-pearland-texas` (2026-07).

**Closed at Rhan's direction on 2026-08-18**, and deliberately no longer
tracked: the stock-photo testimonial poster, the two CMS-truncated reviews,
attorney review of the Key Takeaways, and confirming the "500+ Families Helped" /
"5.0 Stars" / "17+ Years" claims. Recorded so a later session reopens them by
decision rather than by rediscovery.

---

## Known issues

- **`WhatDrivesUs` reflows on font swap.** "Direct, Personal Attention" goes
  from one line to two when the real face loads, a 30px shift — **now on six
  pages**, `/video-center/` being the sixth. A CLS hit worth fixing before
  launch. The interior `h1` reflow is the same class of problem and is sitewide.
- **`scripts/checks/video-modal.js` reports 16 / 1.** Pre-existing; see *Things
  that would surprise you*.
- **`/about-us/` passes no `canonical`.** It and `/` are the only two built
  pages that don't. One-line fix.
- **`/about-us/` and `/blog/` carry no JSON-LD at all.** `/about-us/` is the
  canonical entity page for Papa Dieye and has no `Person`/`Attorney` markup.
- **The `/practice-areas/` hero is 1247×741**, so it upscales about 1.5× across
  a full-bleed band at 1920. Rhan chose the image knowing this.
- **The office map is a bare Google embed**, on `/contact-us/` and on every
  content page via the shared section. It sets third-party cookies everywhere
  and is the last holdout of the click-to-load rule. `/video-center/`
  deliberately did not add a second one.
- **No location page carries an image.** The 32 are text and chrome only.

---

## Carry into the Sanity pass

**The nine videos want a `video` document type** — `wistiaId`, `title`, `label`,
`poster`, `aspect`, and eventually `uploadDate` and `description` so the
`VideoObject` markup above becomes possible. They are already a flat array of
plain objects at the top of `VideoGrid.astro`. **The poster ORDER carries a
design constraint that a CMS sort will lose**, so whatever models this needs an
explicit order field and the comment in that file needs to travel with it.
`home/VideoReels.astro` holds six of the same videos with different titles and
portrait posters; both should read one collection.

**`InteriorShell`, `InteriorHeader` and `TreeNav` are the interior template.**
Anything modelled later that renders long-form copy with a rail should use them.

**The `locations` collection wants a `locationPage` document type.** `location`
and `parent` both become references. The four `firmDetails.serviceAreas` entries
should become references to the four root documents.

**The 14 reviews want a `testimonial` document type** — `lead`, `body`, `name`,
`matter`, and an optional video reference. `matter` is our categorisation and
should become a reference to the practice-area document.

**`/about-us/choosing-a-family-law-attorney/`'s copy is already Sanity-shaped**
— a named `sections` array of `{heading, paragraphs[]}`. The four deviations at
the top of the file are the editorial record that should travel with it.

**The Google Maps CID is a constant in `firmDetails.ts`**, not a field on the
singleton. It should become one.

**"Updated on" instead of "Posted on"** for blog posts: an optional `updated`
field, the card picking its label from it, and `dateModified` in the
`BlogPosting` JSON-LD. Both dates need `timeZone: "UTC"`.

**All three collections are already the shape Sanity needs.** Categories are
still derived from posts, not modelled.

**`/contact-us/` reads everything factual from `firmDetails`**, so it needs no
work in the sweep.

---

## Redirects in place

| From | To | Why |
|---|---|---|
| `/about-us/papa-dieye` + `/` | `/about-us/` | Bio moved up; live stub had no content |
| `/about-us/the-difference` + `/` | `/about-us/` | Folded into the bio page |
| `/video-center/the-dieye-firm` + `/` | `/video-center/` | Category page folded into the index |
| 3 × `/video-center/the-dieye-firm/<video>` + `/` | `/video-center/` | Detail pages folded in; no copy existed to keep them |
| 16 × `/blog/<year>/<month>/<truncated-slug>` | `/blog/<full-slug>/` | Scorpion cut slugs mid-word |

All four video-center children are in `dieyelaw.com/sitemap.xml`, which is
`AGENTS.md`'s test for equity. **Both slash forms are present for each**, since
Vercel applies `redirects` before its own trailing-slash normalisation and a
single form can silently never fire. Note the 16 blog rules carry only one form
each — pre-existing, and worth a look if any of them ever misses.

**Practice areas and location pages need none** — both sections' URLs match the
live site exactly. `/sugar-land-family-law/*` is deliberately absent: it is not
in the sitemap.

---

## Known dangling routes

| Link | Lives in | Lands with |
|---|---|---|
| `/faq/` | Resources flyout + footer | an FAQ page |
| `/client-portal` | Info bar | a third-party portal, or removal |
| `/privacy-policy/` | Footer | a privacy page |
| `/disclaimer/` | Footer | a disclaimer page |
| `/sitemap/` | Footer | an HTML sitemap, or point it at `/sitemap.xml` |

**`/video-center/` and `/videos/` are off this list**, and nothing else in the
build dangles. Nothing links to `/thank-you/` yet, and that is correct — it is a
form destination, not a nav item.

All three scrapers print their own dangling list on every run.
