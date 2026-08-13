# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-13, end of session._

---

## Start here

**The blog is finished.** `/blog/` and `/blog/[slug]/` are both built and
verified, and no route in the blog dangles any more.

**Next task: the 8 practice-area detail pages** — the largest undesigned block
left, and the next-hardest template after the interior main+sidebar shell that
the blog post already banked. **They have no comp.** Nothing can start until
Rhan supplies direction or design; see "Waiting on Rhan".

The Practice Areas *index* and Testimonials both have comps and could be built
today if the practice-area detail pages stay blocked. Both reuse `ByTheNumbers`
and `WhatDrivesUs`, which are still waiting to be picked up.

---

## Where we are

Branch `blog_index`, branched from the `blog_post` merge (`a28e32b`).
**Uncommitted — nothing pushed, no upstream set.** `blog_post` merged to
`master` as PR #17.

Build passes. The Blog index behaviour check is 46/46 on every entry path
(unfiltered, each category, and a bogus `?category=` value). No horizontal
overflow at 1920 / 1440 / 1000 / 768 / 430, no broken images, and the blog
post's two-form check still passes 19/19.

---

## What landed this session

**The Blog index (`/blog/`)** — header, featured panel, category filter, card
grid with Load More, then `WhatDrivesUs`. Six changes Rhan asked for, all in:

1. The featured post is pinned and never filtered.
2. The chips sit **below** the featured panel, so the order shows the panel is
   outside their scope rather than ignoring them.
3. The chip row scrolls horizontally rather than wrapping.
4. Grid cards are `--bone-50` cream on the white page.
5. Filtered cards animate in — 10px rise and fade, staggered 45ms and capped.
6. Load More hides the moment nothing is left, per filter.
7. Arriving from a category link opens on the chip row rather than the top of
   the page. Clicking a chip in place does not move the page.

**`PostCard.astro`** — the article card, extracted from `RelatedPosts` and now
shared by the navy band and the white index grid. `tone="navy"` fills white,
`tone="light"` fills cream. `RelatedPosts` renders identically to before.

**`scripts/checks/blog-index.js`** — behaviour check in the repo's existing
style. Also tests FilterBoot's pre-paint CSS **on its own**, by putting the
page back into the state those rules were written for; that failure would
otherwise be invisible after the module boots.

**A `featured` flag** on the collection schema, optional, falling back to the
newest post. Currently set on **"Preparing Emotionally for Mediation"** — the
post the comp itself features, and one with real artwork. One line to move.

**Editorial overrides in the scraper.** `scrape-blog.mjs` rewrites every post
file on each run, so anything hand-edited into frontmatter is lost on the next
scrape. Two things now live in the script instead, keyed by slug:
`CATEGORY_OVERRIDES` and `FEATURED_SLUG`. The August post is categorised
`child-custody` there — it had none at all, so it could only ever appear under
"All Posts". Drop the override once the category is set on the live site.

---

## Waiting on Rhan

1. **The 8 practice-area pages need design or direction.** Blocking the next
   task. `_export-practice-areas.dc.html` is *not* a detail template.
2. **The August post is categorised by us, not by the client.** "How the 2025
   Texas Fit Parent Presumption Affects Your Custody Rights" (2026-08-06) was
   published with no category at all, so it is assigned `child-custody` via
   `CATEGORY_OVERRIDES` in the scraper. Worth setting on the live site so the
   override can go away — and worth a glance in case a different category was
   intended.
3. **That same post still has no artwork**, which is why it isn't the featured
   post. It falls back to the generic `blog-img.jpg` at 436x235; in the grid it
   is visibly softer and greyer than its neighbours.
4. **The Key Takeaways need attorney review before launch.** Unchanged. Wording
   lives in one file, `scripts/add-takeaways.mjs`.
5. **Confirm `site: "https://www.dieyelaw.com"`** in `astro.config.mjs`. It
   drives every canonical and `og:url`.
6. **Two near-duplicate posts** — `understanding-child-custody-laws` (2025-01)
   and `understanding-child-custody-laws-in-pearland-texas` (2026-07). Not
   urgent.
7. **The other undesigned pages** — About Us index, Choosing a Family Law
   Attorney, The Difference, the service-area pages.
8. **Branch granularity** — one branch per page, or one per template group?
   Still unanswered.

---

## Carry into the Sanity pass

Deferred on purpose, and easy to lose if it isn't written down:

**"Updated on" instead of "Posted on".** The attribution card should switch its
label once a post has actually been revised. It stays "Posted on" today because
the ingested archive carries only a publish date, and labelling that as an
update date would assert something untrue.

1. An `updated` field on the `post` document (optional), alongside `date`.
2. The card picks the label: `updated` present **and** later than `date` →
   "Updated on" + `updated`; otherwise "Posted on" + `date`. Both still need
   `timeZone: "UTC"` (see the date gotcha in `AGENTS.md`).
3. `BlogPosting` JSON-LD in `src/pages/blog/[slug].astro` gains `dateModified`
   — that is the half search engines actually read.

The source pages already carry a `dateModified` in their JSON-LD;
`scripts/scrape-blog.mjs` reads `datePublished` only. One-line change plus a
re-scrape, done as part of the migration so the field arrives with the schema
that uses it.

**`featured` is already the shape Sanity needs** — a boolean on the post
document, with the index falling back to newest when nothing is flagged.

**Categories are still derived from posts**, not modelled. `allCategories()`
reads them off the archive, so a `category` document type in the Sanity pass
replaces that function and nothing else. `categoryLabel()`'s map is the seed
data for it.

---

## Known dangling routes

| Link | Lives in | Lands with |
|---|---|---|
| `/family-law/child-custody/relocation-case/` | in-body links | practice areas |
| `/family-law/child-custody/visitation-possession/` | in-body links | practice areas |
| `/family-law/grandparent-rights/` | in-body links | practice areas |
| `/family-law/mediation-vs-litigation/` | in-body links | practice areas |
| `/harris-county-family-law-attorney/` | in-body link | service areas |

All five come from the scraped posts' own internal links, rewritten from the
old site's URLs onto our route map. The scraper prints this list on every run.
**Worth a link audit once the interior build is done.**

`/blog/` and `/blog/categories/<slug>/` are both gone from this table — the
first because it exists, the second because it no longer does. See below.

---

## Decisions made — don't relitigate

**Blog index**

- **There are no category archive routes.** A category link goes to
  `/blog/?category=<slug>` and the index applies the filter before first paint.
  Rhan's call: clicking a category in a post's sidebar should land on the blog
  and auto-filter. It also avoids four thin archive pages duplicating the same
  16 posts — one of which would have held a single article.
- **`categoryHref()` was repointed** at that query URL, which silently updated
  both consumers (`PostHeader`'s kicker, `PostSidebar`'s Categories card).
- **The featured post is pinned above the filter**, never filtered, and never
  repeated in the grid — `splitFeatured()` returns both halves from one split
  so the two can't disagree.
- **Which post is featured is editorial, not date-driven.** The `featured` flag
  wins over recency because the newest post is sometimes the one without
  artwork, and the panel renders its image half-width and ~560px tall.
- **The chip row scrolls; it does not wrap.** The track is `width: max-content`
  centred by auto margins, so it centres while it fits and scrolls once it
  doesn't — `justify-content: center` on a scroller clips the first chip out of
  reach. On mobile the scroller runs full-bleed and **the gutter lives on the
  track, not on the scroller**: a scroll container's trailing padding is not
  part of its scrollable width, so putting it there gives a margin on the way
  in and none on the way out — the last chip ends up flush against the screen.
- **The scroller's bottom padding is a scrollbar lane, and its negative bottom
  margin gives that space back to the layout.** Overlay scrollbars take no
  layout space and paint over whatever sits at the bottom of the scroller,
  which was the chips' lower border. The pair buys the bar 14px of clearance
  while leaving the gap down to the cards at exactly 68px / 52px. Deleting
  either half breaks something: drop the padding and the bar covers the chips
  again, drop the margin and the section grows.
- **Filtering is client-side over markup that is already in the document.**
  All 15 grid posts render once; filtering and paging are visibility passes.
  With 16 posts that beats a round trip and makes a pre-filtered arrival free.
- **`FilterBoot` exists to stop the flash.** Arriving pre-filtered is a primary
  path now, so a blocking head script stamps the filter onto `<html>` and
  generated CSS hides the non-matching cards in the same pass. Both are keyed
  on `data-blog-boot`, which the module removes the instant it has applied the
  real state — after that the rules are inert. Without it the browser paints
  all 15 posts and collapses them a moment later, which reads as a bug.
- **Batches are 9 then 6** — multiples of three, so the 3-up desktop grid never
  ends on a short row. The module reads the initial batch off the markup rather
  than repeating the number.
- **Chips are links, not buttons**, so a filter is a shareable address and
  cmd-click still opens a new tab. They push real history entries, so Back
  restores the previous filter instead of leaving the page.
- **The chip row is hidden without JS**, like Load More. Both would otherwise
  claim to do something they can't; the grid shows the whole archive in that
  case, which is a complete answer on its own.
- **`.pg__more[hidden]` is declared explicitly.** `.btn` sets
  `display: inline-flex`, which outranks the UA stylesheet's `[hidden]` rule —
  without it Load More stays on screen with nothing left to load.
- **Cards animate on a wrapper, not on themselves.** `PostCard` already owns a
  `translateY` on hover; a second transform on the same element would fight it.
- **The comp's six categories are placeholder.** The archive uses four, derived
  from the posts. Property Division and Modifications don't exist here.
- **A filtered arrival scrolls to the chip row; an in-place chip click does
  not.** Someone landing from a category link asked for a category, and the
  chips are what show which one they got — but if you are already looking at
  the row you clicked, moving the page under you is just disorienting. The
  scroll waits for `load`: the module is deferred, and a scroll issued before
  the browser has settled a fresh navigation is silently undone.

**Blog post — still standing**

- **Blog URLs are flat** — `/blog/<slug>/`, re-slugged from each post's `h1`,
  because the old Scorpion CMS cut every slug at 48 characters mid-word. 16
  generated 301s in `vercel.json` cover the old paths.
- **Scrape the live site, not the mirror.** The mirror is a 2026-07-20 snapshot.
- **Posts are bylined "The Dieye Firm"**, so the sidebar card is an *attorney*
  card introducing Papa, not an author card claiming he wrote the post.
- **Markdown now, Sanity later.** The collection schema is the shape a `post`
  document will return.
- **In-article CTA blocks were stripped** — they hardcoded a phone number into
  16 files. The number renders from `firmDetails` instead.
- **Heading levels were normalised** to h2/h3.
- **Dates display in en-GB** (`01 April 2026`), matching the built homepage.
- **The related grid gains a 2-up tier** at ≤1000px; the comp jumps 3-up to 1-up.
- **The deferred in-article components stay deferred** — navy callouts,
  get-in-touch bar, in-article attorney card, fact-checked bar, pull quote.
- **The post page is white**, so light cards are `--bone-50` cream. The index
  grid follows the same rule for the same reason.
- **The sidebar is not sticky**, and its order is fixed.
- **The byline row under the `h1` is gone** — it lives in the sidebar.
- **`Layout` owns lead-form behaviour**, bound once for the document. Form
  components emit no script of their own.

---

## Things that would surprise you

- **The comp's phone number is a typo** — `tel:+18322997990` vs the real
  `(832) 299-1990`. Recorded in `AGENTS.md`.
- **`_export-practice-areas.dc.html` is not a detail template.** It is the
  Practice Areas *index* comp with an asset-resolver wrapper.
- **`CLAUDE.md` is a symlink to `AGENTS.md`.** Edit `AGENTS.md`.
- **Neither blog template has a hero.** Both open directly under a solid
  `<Header />` on white. Don't add one.
- **The comps live at** `~/Downloads/The Dieye Firm/The Dieye Firm Claude Project/`
  and have moved once already.
- **Reuse already banked:** `ByTheNumbers` and `WhatDrivesUs` are still waiting
  on Practice Areas index and Testimonials. `PostCard` now covers any article
  card on either surface. Check `src/components/about/` and
  `src/components/blog/` before building anything that sounds familiar.
- **Rhan runs the dev server from his IDE.** Check for one on 4321 and use it
  rather than starting a second.
- **`npm run probe` cannot see the Blog index's arrival scroll.** `probe` calls
  `browser.settle()`, whose lazy-iframe sweep ends in `window.scrollTo(0, 0)`,
  and this page has an iframe (the video modal). Any scroll the page sets for
  itself is wiped before the check runs, so the feature reads as dead when it
  isn't. Drive `launch()` directly and skip `settle()` to test it. This cost a
  round of false debugging — the note is in `scripts/checks/blog-index.js` too.
- **`scrape-blog.mjs` rewrites every post file on every run.** Hand edits to
  frontmatter do not survive. Editorial decisions go in the script.
