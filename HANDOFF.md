# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-17, end of session._

---

## Start here

**The practice-area section is complete.** 32 detail pages under `/family-law/`
plus the index at `/practice-areas/`. No 404s left inside the section.

**Next up: `/contact-us/`.** It has always 404ed, and it is the destination of
the gold header button on all 53 pages plus five in-page CTAs — the worst dead
link on the site. It has a comp, so it needs no direction and no new copy.

After that: the About Us group (About Us index, Choosing a Family Law Attorney,
The Difference), which has **no comp** and needs direction before it can start,
then the service areas, then `/faq/` and `/video-center/` to fill the Resources
flyout.

---

## Where we are

Branch `pa_index`, one commit ahead of `master` at `8bc8be2`. The practice-area
section's earlier work is already on `master` — PRs #19 and #20 are merged.

Build passes at **53 pages**. No horizontal overflow at 1920 / 1441 / 1440 /
1260 / 1259 / 1000 / 768 / 430 on the new pages, the homepage, the blog, a
detail page, or Papa's page.

---

## What landed this session

**`/practice-areas/`** — the section index, built from the comp: hero, six
featured cards, an A–Z grid of all 32, then `ByTheNumbers` and `WhatDrivesUs`
(both reused unchanged). New components in `src/components/practice-areas/`:
`PracticeAreasHero`, `FeaturedAreas`, `AllAreas`.

**`/family-law/` is now a real page**, not a 404 — a scraped practice-area page
("Pearland Family Lawyer", 565 words) rendering on the existing detail template.

**Nav and wayfinding re-pointed** at the new index: the top-level item is
"Practice Areas" → `/practice-areas/`, the sidebar card on all 32 detail pages
is titled "Practice Areas" and links there, and a top-level page's kicker does
too. Family Law joined the nav flyout as an ordinary item.

---

## Decisions made — don't relitigate

- **The index is `/practice-areas/`; `/family-law/` is a practice-area page.**
  They are different things. Everything that means "show me the section" points
  at the index; `/family-law/` is a peer of Divorce and Child Custody.
- **The featured six are the comp's six** — Divorce, Child Custody, Family Law,
  Child Support, Property Division, Modifications. An earlier list swapped in
  Domestic Violence and Parental Rights, but the comp supplies a photo and an
  icon only for its own six and there is no art for those two. Reverting to the
  comp's six removed the asset gap entirely rather than papering over it.
- **Cards keep the comp's photo + icon treatment.** Rhan's call. Dropping the
  icon tile was considered and rejected.
- **The A–Z grid uses `column-count`, not `display: grid`.** An alphabetical
  index has to read *down* each column; grid flows row-major and would put B
  beside L beside R.
- **The card photo uses `aspect-ratio`, not the comp's fixed 230px height.** The
  sources are 760px squares, so a fixed height re-crops them at every card
  width — 2.0:1 on desktop, 1.5:1 on a phone — which is how a face gets clipped
  at one breakpoint and not another.
- **"Modifications" on the card, not "Modifications & Enforcement."** The full
  navLabel wraps to two lines and leaves that card out of step with the two
  beside it. Same override mechanism the nav uses for "Protective Orders".
- **`CollectionPage` + `ItemList` on the index, not another `LegalService`.**
  All 32 detail pages already nest one as their `Service` provider; a 33rd copy
  of the same NAP block adds nothing. What the index can offer is the map of
  the section.
- **The header collapse point is a measurement, not a constant.** It has moved
  three times this session — 1200 → 1260 → 1160 — every time because a *label*
  changed, never because anything was added to or removed from the layout. It
  now sits ~80px above the measured need so the next label change costs a
  re-measure rather than an overflow bug. See `AGENTS.md`.
- **The header nav is About · Practice Areas · Service Areas · Testimonials ·
  Resources · Blog**, with a gold "Contact Us" button. There is no "Contact Us"
  nav item — the button is the contact link, and carries `aria-current` when
  you are on that page. Blog sits at top level *and* Resources keeps a dropdown
  (FAQs, Videos) for the sections still to be built.

---

## Waiting on Rhan

1. **Two authored strings on the index** — the A–Z section head ("Full Index" /
   "Every practice area, *A to Z.*") and the page title ("Texas Family Law
   Practice Areas | The Dieye Firm"). Neither has a comp.
2. **~24 of the 32 detail pages close with a "come talk to us" section.** The
   template already has a sidebar form and the sitewide Contact section, so
   these are a third ask. Kept deliberately — several pages' final h2 is real
   content, so it needs an editorial eye, and it is trivial to strip later and
   impossible to recover if dropped now.
3. **`modifications-enforcement` is 290 words**, the thinnest page and the only
   one where the sidebar overhangs the article.
4. **Key Takeaways still need attorney review before launch** —
   `scripts/add-takeaways.mjs`.
5. **The August blog post is categorised by us, not the client**
   (`child-custody` via `CATEGORY_OVERRIDES`) and still has no artwork.
6. **Two near-duplicate blog posts** — `understanding-child-custody-laws`
   (2025-01) and `understanding-child-custody-laws-in-pearland-texas` (2026-07).
7. **Branch granularity** — one branch per page, or per template group? Still
   unanswered; this branch now carries the whole section.

---

## Known issues

- **`WhatDrivesUs` reflows on font swap.** "Direct, Personal Attention" goes
  from one line to two when the real face loads, a 30px shift. **Pre-existing,
  not from this session** — it does the same on `/about-us/papa-dieye/`. Worth
  fixing before launch since it is a CLS hit on two pages now.
- **The index hero is 1247×741**, so it upscales about 1.5× across a full-bleed
  band at 1920. Rhan chose the image knowing this. It is a *different* photo
  from the one `WhatDrivesUs` uses lower on the same page — grey suit at the
  brick storefronts vs blue suit on the Old Town street — so there is no repeat.

---

## Carry into the Sanity pass

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

---

## Known dangling routes

| Link | Lives in | Lands with |
|---|---|---|
| `/contact-us/` | the header CTA on every page, plus 6 in-page CTAs | **a Contact page — has a comp** |
| `/faq/` | Resources flyout | an FAQ page |
| `/video-center/` | Resources flyout | a video page |
| `/harris-county-family-law-attorney/child-custody/` | PA in-body links | service areas |
| `/harris-county-family-law-attorney/child-support/` | PA in-body links | service areas |

**`/contact-us/` is the urgent one.** It is the destination of the gold header
button on all 53 pages and of five more in-page CTAs, and it has always 404ed —
it predates this session's nav work. There is a comp ("Contact.dc.html"), so it
is a small, unblocked build. A law firm's contact button going nowhere is the
worst dead link on the site.

`/faq/` and `/video-center/` are new here, added knowingly: Resources needed
children once Blog moved up to top level, and both are real sections of the
live site we have not rebuilt. The comp's nav also lists "Free Guides"; it was
left out because it exists neither here nor on the live site.

Both scrapers print their own dangling list on every run.

---

## Things that would surprise you

- **`/family-law/` is a content page and `/practice-areas/` is the index.** The
  reverse is the intuitive guess and it is wrong.
- **The section root is the one page whose file path is not its route.** Its id
  is `family-law`; `areaHref` and `getStaticPaths` both special-case it, the
  latter with `slug: undefined`, which a rest param renders at the parent path.
- **The header collapse point is measured, not chosen.** A longer nav label
  moves it. It has moved twice.
- **The content box gets narrower as the viewport crosses 1440** —
  `--container-pad` jumps 40→100px. Test 1440 and 1441 separately.
- **A practice-area page's body lives in two containers**, one behind a "read
  more". Both in `AGENTS.md`.
- **`npm run shot` and `npm run probe` force lazy images to load**, so a probe
  will report every image as `loading="eager"`. Check `dist/` for the truth.
- **`npm run probe` cannot see the Blog index's arrival scroll** — `settle()`
  ends in `window.scrollTo(0, 0)`. Drive `launch()` directly.
- **`CLAUDE.md` is a symlink to `AGENTS.md`.** Edit `AGENTS.md`.
- **Rhan runs the dev server from his IDE.** Check 4321 before starting a second.
- **`.pa-cache/` and `.blog-cache/` are gitignored fetch caches.** Both scrapers
  take `--refetch`.
