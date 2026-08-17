# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-17, at the `/testimonials/` commit._

---

## Start here

**`/testimonials/` is built.** The nav's "Testimonials" item and the homepage
"View All Reviews" button both land on a real page now.

**Next up: the About Us group** — About Us index, Choosing a Family Law
Attorney, The Difference. It has **no comp**, so it needs direction from Rhan
before it can start. Don't invent the copy and don't fall back to the live site.

After that: the service areas, then `/faq/` and `/video-center/` to fill the
Resources flyout.

---

## Where we are

Branch `testimonials_2`, cut from `master` at `339db6a` (PR #23 merged). One
commit, carrying the whole page. **Not pushed, no PR open.**

Build passes at **55 pages** (was 54).

Nothing outside the new page was touched — no tracked file changed, so the
other 54 pages are byte-identical to `master` apart from the `AGENTS.md` note.

---

## What landed this session

**`/testimonials/`**, built from "Testimonials.dc.html". Three sections, plus
`Layout`'s Contact and Footer:

- `testimonials/TestimonialsHero.astro` — full-bleed consultation photo with a
  navy side-scrim, same structure as `PracticeAreasHero` and `PapaHero`.
- `testimonials/ReviewWall.astro` — the video tile plus 14 review cards.
- `about/WhatDrivesUs.astro`, reused unchanged. The comp's third section is
  exactly it.

**`src/assets/images/hero-testimonials.jpg`** is new (the comp's asset,
1200x896 — the smallest hero on the site, so `widths` stops at native).

**`src/assets/images/ss-video-1.jpg` is now referenced.** It had been sitting
untracked and unused since the old `testimonials` branch; it is the video
tile's poster.

### The reviews — read this before touching the copy

The 14 reviews are the clients' own words, taken **from the live site, not from
the comp** (the comp's versions are copy-edited, and these carry real names).
The full rule is now in `AGENTS.md`; what matters here is the provenance work:

- **14 is the complete corpus.** A sweep of all 121 URLs in
  `dieyelaw.com/sitemap.xml` finds no fifteenth.
- **`/testimonials/` itself carries only 9.** Its "1 / 2" pager splits those 9
  across two carousel views — it is *not* hiding a second batch. The other 5
  are scattered across the About and practice-area pages. Anyone re-checking
  the source and finding 9 has not found a discrepancy.
- **The comp's "Load More Reviews" button is deliberately not built.** All 14
  render; the button would have nothing to load.

**Three deviations from verbatim, all listed at the top of `ReviewWall.astro`.**
Keep that list current if a fourth is ever added:

1. Four bodies (Kim, Osmin, Rosy, the "grateful" Former Client) had one
   sentence dropped because it was word-for-word the pull-quote above it. The
   card would otherwise have printed it twice, at 30px and again at 17px.
2. **Larry's and the "Honest, Sincere" review are truncated mid-word in the
   firm's own CMS** — they literally end `…what he can do. H"` and `…Mr. Papa
   was always h`. Each is cut back to its last complete sentence. **The missing
   tails are not recoverable from the live site; ask the firm for the
   originals.**
3. Cyndy's is punctuated and de-garbled, at Rhan's instruction — the only one
   edited for readability rather than for a defect in the source.

---

## Decisions made — don't relitigate

- **The wall has no pagination, no infinite scroll and no scroll-reveal.** All
  14 cards are in the HTML on first paint; the section ships zero JavaScript.
  At 14 items, paging or lazy-reveal would hide content from crawlers and put a
  loading state on the page whose whole job is to look substantial immediately.
- **CSS multi-column, not the comp's three hand-packed `<div>` columns.** The
  cards run from 3 lines to 11, and hand-packed columns only balance at the one
  width they were packed for — at two columns the comp's third column drops
  whole beneath the other two. `columns` rebalances at every width and keeps
  the data a flat array, which is what the Sanity sweep wants. Measured spread
  at 1600 is 218px on a ~3,900px wall.
- **`<Header />` in flow, not `overlay`.** The hero photo puts Papa's head at
  ~15% of the frame and just right of centre, which is where an overlay nav's
  gold CTA lands at every width. Same reason as `/practice-areas/` and
  `/about-us/papa-dieye/`.
- **The wall's h2 is "Success stories.", not the comp's "What our clients are
  saying."** The hero h1 forty pixels above reads "What our clients say." and
  the two sat on screen together as an obvious slip. "Success Stories" is the
  comp's own nav label for this page *and* the title of the homepage teaser
  that links here, so the click-through now lands on the heading it promised.
- **`CollectionPage` in the JSON-LD, deliberately not `Review` /
  `AggregateRating`.** Review markup a business emits about itself is
  "self-serving" under Google's structured-data policy and is ineligible for
  rich results on `LocalBusiness`/`Organization` — the stars would never render,
  and marking it up anyway invites a manual action. The star ratings on the
  cards are honest UI; they just don't get to claim to be schema. If the firm
  wants review stars in search they come from the Google Business Profile (4.7
  from 104), not from here.
- **The video tile is square on desktop, 4:3 on mobile.** The poster is a 16:9
  source, so a 1:1 crop at full phone width would throw away a third of the
  frame either side and stand a whole screen tall.
- **The tile's tint is two layers** — a flat `--navy-900` at 0.36 with
  `mix-blend-mode: multiply`, then a bottom gradient for caption contrast.
  `multiply` keeps the photo's modelling where a plain alpha fill goes muddy;
  one gradient can do the tint or the contrast well, not both.

---

## Verified

- `npm run build` — 55 pages, clean.
- No horizontal overflow at 1920 / 1441 / 1440 / 1000 / 768 / 650 / 430.
- No console errors at 1440 or 430.
- One `h1`, no duplicate element ids, `aria-current="page"` on the nav item,
  one form (Layout's).
- Hero image `loading="eager"` + `fetchpriority="high"` with intrinsic
  dimensions — checked in `dist/`, not via probe, which forces lazy images
  eager and would have reported it either way.
- The video tile opens the shared modal with the right id, 16:9, autoplay,
  correct `aria-label`; Escape, backdrop and close each tear the iframe down,
  unlock scroll and restore focus to the tile.
- `font-shift.js` at 1440 / 1000 / 430 finds only the pre-existing
  `WhatDrivesUs` h3 (below).

Two check-suite results that look like failures and aren't:

- **`scripts/checks/video-modal.js` errors on `/testimonials/`.** It queries
  `.video-card` and `.reel`, which are homepage selectors — the same
  page-specific limitation `blog-forms.js` has. Run it against `/`, where it
  still passes 16 of 17.
- **That one homepage failure is `"no iframes before click"`**, and it is the
  Google Maps embed in the shared Contact section, not the video modal. It
  predates this branch; see Known issues.

---

## Waiting on Rhan

1. **Direction for the About Us group.** No comp for any of the three pages.
   This is the blocker on what's next.
2. **A real client video testimonial.** The tile is wired to `z79lx3x00o` —
   which is the firm's own "About Us" reel, **the same id `home/About.astro`
   already plays** — as a working stand-in. Its poster is the comp's
   `ss-video-1.jpg`, a stock portrait of nobody connected to the firm, so the
   tile is deliberately left **un-attributed**: it reads "Video Testimonial /
   Watch their story" with no name, because a name would assert a client who
   doesn't exist. Swap the id, the poster and add a name together.
3. **Two authored strings on `/testimonials/`** — the page title ("Testimonials
   from Pearland and Houston Families | The Dieye Firm") and its meta
   description. Neither is in the comp.
4. **The two CMS-truncated reviews** (item 2 under "The reviews", above).
5. **Two authored strings on `/practice-areas/`** — the A–Z section head ("Full
   Index" / "Every practice area, *A to Z.*") and the page title. No comp.
6. **Two authored strings on `/contact-us/`** — page title and meta
   description. No comp.
7. **26 of the 32 practice-area detail pages close with a "come talk to us"
   section.** The template already has a sidebar form and the sitewide Contact
   section, so these are a third ask. Kept deliberately, because it is **not** a
   blanket strip: the other six end on real content and must survive —
   Commonly Asked Questions · Frequently Asked Questions · How Mediation Can
   Save Time and Reduce Costs · How a Divorce Modification Is Filed in Texas ·
   Parental Rights Cases in Harris County Family Court · Visitation Rights for
   Unmarried Parents in Pearland. Trivial to strip later, impossible to recover
   if dropped now.
8. **`modifications-enforcement` is 290 words**, the thinnest page and the only
   one where the sidebar overhangs the article.
9. **Key Takeaways still need attorney review before launch** —
   `scripts/add-takeaways.mjs`.
10. **The August blog post is categorised by us, not the client**
    (`child-custody` via `CATEGORY_OVERRIDES`) and still has no artwork.
11. **Two near-duplicate blog posts** — `understanding-child-custody-laws`
    (2025-01) and `understanding-child-custody-laws-in-pearland-texas`
    (2026-07).
12. **Branch granularity** — one branch per page, or per template group? Still
    unanswered. This branch carries one page.

---

## Known issues

- **`WhatDrivesUs` reflows on font swap.** "Direct, Personal Attention" goes
  from one line to two when the real face loads, a 30px shift. **Pre-existing**
  — it does the same on `/about-us/papa-dieye/` and `/practice-areas/`, and
  `/testimonials/` now inherits it as a third page. Worth fixing before launch
  since it is a CLS hit on three pages.
- **The `/practice-areas/` hero is 1247×741**, so it upscales about 1.5× across
  a full-bleed band at 1920. Rhan chose the image knowing this.
- **The office map is a bare Google embed**, on `/contact-us/` and on all other
  content pages via the shared section. It sets third-party cookies on every
  page. `AGENTS.md` wants embeds behind a click-to-load facade; this one
  predates that rule and is the last holdout. It is also the sole failure in
  `video-modal.js`. Worth doing if a consent banner ever lands.
- **The testimonials video poster is a stock face.** Not a defect in the build
  — it is item 2 under "Waiting on Rhan" — but it is on the one page whose job
  is credibility, so it should not reach launch.

---

## Carry into the Sanity pass

**The 14 reviews want a `testimonial` document type** — `lead`, `body`, `name`,
`matter`, and an optional video reference so the tile stops being a hardcoded
constant. They are already a flat named array of plain objects in
`ReviewWall.astro`, so the migration is a query and a map. `matter` is our
categorisation, not the client's; every value is a practice area the quote
itself names, and it should become a reference to the practice-area document
rather than a string.

**The Google Maps CID is a constant in `firmDetails.ts`**, not a field on the
singleton. It should become one, so a second office or a re-verified listing
doesn't need a deploy.

**"Updated on" instead of "Posted on"** for blog posts, once editors can revise
one: an optional `updated` field, the card picking its label from it, and
`dateModified` in the `BlogPosting` JSON-LD. `AuthorCard` already takes an
optional date — practice-area pages render it without one — so that switch is
half-built. Both dates need `timeZone: "UTC"`.

**Both collections are already the shape Sanity needs.** `practiceArea` wants
`title` / `navLabel` / `subtitle` / `parent` / `faqs`, with parent/child as a
reference rather than a path. **Categories are still derived from posts**, not
modelled — `allCategories()` reads them off the archive and `categoryLabel()`'s
map is the seed data for a `category` type.

**`/contact-us/` reads everything factual from `firmDetails`** — phone, email,
address, hours, the map embed and link, the service areas in its JSON-LD.
Nothing on the page is a hardcoded NAP, so it needs no work in the sweep.

---

## Known dangling routes

| Link | Lives in | Lands with |
|---|---|---|
| `/faq/` | Resources flyout | an FAQ page |
| `/video-center/` | Resources flyout | a video page |
| `/harris-county-family-law-attorney/child-custody/` | PA in-body links | service areas |
| `/harris-county-family-law-attorney/child-support/` | PA in-body links | service areas |

`/testimonials/` has left this table — it is built.

`/faq/` and `/video-center/` are both real sections of the live site we have
not rebuilt; Resources needed children once Blog moved up to top level. The
comp's nav also lists "Free Guides"; it was left out because it exists neither
here nor on the live site.

Both scrapers print their own dangling list on every run.

---

## Things that would surprise you

- **The testimonials page has no pagination and no scroll behaviour**, despite
  the comp's "Load More" button. 14 reviews, all rendered, no JS. See Decisions.
- **`/testimonials/` carries only 9 reviews on the live site, not 14.** The
  other 5 live on other pages. Don't read that as a discrepancy.
- **The testimonials video is the homepage's About video.** Same Wistia id,
  standing in until a real client video exists.
- **`Layout` has an `after-contact` slot.** If a section needs to sit below the
  consultation prompt, that's how — the default slot is above it.
- **The map is keyed on a Business Profile CID, not the address.** Don't
  "simplify" it back to an address query; the branded card is the point. In
  `AGENTS.md`.
- **`/family-law/` is a content page and `/practice-areas/` is the index.** The
  reverse is the intuitive guess and it is wrong.
- **The section root is the one page whose file path is not its route.** Its id
  is `family-law`; `areaHref` and `getStaticPaths` both special-case it, the
  latter with `slug: undefined`, which a rest param renders at the parent path.
- **The header collapse point is measured, not chosen.** A longer nav label
  moves it. It has moved three times.
- **The content box gets narrower as the viewport crosses 1440** —
  `--container-pad` jumps 40→100px. Test 1440 and 1441 separately.
- **A practice-area page's body lives in two containers**, one behind a "read
  more". Both in `AGENTS.md`.
- **`npm run shot` and `npm run probe` force lazy images to load**, so a probe
  will report every image as `loading="eager"`. Check `dist/` for the truth.
- **`npm run probe` cannot see the Blog index's arrival scroll** — `settle()`
  ends in `window.scrollTo(0, 0)`. Drive `launch()` directly.
- **The headless lib drops CDP events**, so there is no console-error check in
  `scripts/checks/`. To catch them, `send("Page.addScriptToEvaluateOnNewDocument", …)`
  a collector before `goto` and read it back after `settle`.
- **`CLAUDE.md` is a symlink to `AGENTS.md`.** Edit `AGENTS.md`.
- **Rhan runs the dev server from his IDE.** Check 4321 before starting a second.
- **`.pa-cache/` and `.blog-cache/` are gitignored fetch caches.** Both scrapers
  take `--refetch`.
