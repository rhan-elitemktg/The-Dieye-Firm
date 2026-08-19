# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-19, on the `sanity_bug_fixes` branch._

---

## Start here

**Phases 0–5 of the Sanity migration are merged to `master`** (PRs #31–#38).
All 14 page singletons are modelled and every word a reader sees comes from
Sanity apart from the chrome `AGENTS.md` lists.

This branch, `sanity_bug_fixes`, is **one commit ahead of `master` and not yet
pushed**. It came out of Rhan working through the Studio page by page, and it
is three things: a data-loss bug found and fixed, a copy-modelling change he
asked for, and three fields an editor could not reach.

Build green at 95 pages.

The plan is at `~/.claude/plans/the-time-has-come-linear-emerson.md`.

---

## What this branch changed

### 1. A live field was being deleted by the Studio — fixed

`homePage.about.pullQuote` — the client review beside the homepage video — was
set by the phase-2 import, read by `src/sanity/testimonials.ts`, rendered on the
page, and **never declared in the schema**. The Studio builds its form from the
schema and writes that form back, so opening and saving the Home Page pruned it.
It was present in one build and gone from the next, which then failed with
"pullQuote is not set".

Restored (→ `testimonial-01-kim`), declared as a real reference field, and
written up in `AGENTS.md` under Gotchas. **A sweep found no others** —
`grep -rn '\->' src/sanity/*.ts` lists every reference the site follows and the
rest are all declared.

### 2. Multi-field copy became rich text, where the copy is a run of prose

Rhan's call, after a test on one section. Two shapes now exist beside the
existing `blockContent`:

- **`aboutBody`** — the homepage About section's whole right-hand column as ONE
  field: lead paragraph, sub-heads, the gold-tick checklist and the pull-quote.
  Nine fields became one. The checklist is the `bullet` list re-rendered; the
  pull-quote is a block object. **Its quotation was hardcoded in the template
  before this** and is in Sanity for the first time.
- **`paragraphRun`** — a run of plain paragraphs, toolbar narrowed to bold,
  italic and link. Five sections: `whoWeAre`, `meetPapa`, `whyFamilyLaw` on
  `/about-us/`, `featuredAttorney` and `community` on the homepage.

Both heroes whose headline break is a design decision (`homePage`,
`thankYouPage`) went from an array of one-line boxes to a single textarea split
on newlines by `headingLines()` in `src/sanity/aboutPage.ts`.

The reasoning is in `AGENTS.md` under "Modelling copy"; the short version is
**flatten a contiguous run of prose, keep structured data structured**. MeetPapa's
chips, stats and milestones stayed fields in the same pass for that reason.

### 3. Three things an editor could not reach

- **`about.video`** — the homepage video tile was a hardcoded Wistia id. It is
  now a reference to a `video`, and the Wistia id, the modal title AND the
  poster all travel with it.
- **`about.pullQuote`** — see above.
- **`videoReels.picks`** — the carousel's selection used to be `reelOrder`, a
  number on each *video* document, so an editor on the Home Page had no way to
  find it. It is now an ordered array of references on `homePage`, matching how
  `testimonialsBand.picks` already worked. **`reelOrder` is gone** rather than
  left as a second source of truth.

---

## Open question for Rhan — answer before merge

**The About tile's photo changed.** It used to render a local file,
`video-poster-pearland.jpg`; it now renders the referenced video's own poster,
`papa-storefront.jpg`. Different photographs, both of Papa.

This follows from the picker being real — a tile whose still does not change
when you change the video is lying. If the Pearland shot is wanted back, the
honest fix is to make it that video's poster in the Studio, which would also
change `/video-center/`. Nothing else is blocked on this.

---

## How the "nothing moved" rule was held on this branch

`npm run diff:baseline` is **not usable for this work**. `.baseline/` is the
PRE-migration build (`3f64a29`), so it reports 94/94 pages differing no matter
what you do. It is still the right tool for a change made against a
pre-migration surface; it was the wrong one here.

What was used instead, and what each proves:

- **Snapshot `dist/` before the change, diff the section after.** All five
  paragraph runs and the whole About body came out identical once scope hashes
  and inter-tag whitespace were removed — with no entity differences at all.
- **Assert computed styles against the declarations in the source.** This is the
  half a byte-diff is structurally blind to. 40 assertions on the About body, and
  on `/about-us/` the two structural selectors that could quietly have stopped
  matching: `.why__body p:last-child` still zeroes the last margin (`18, 18, 0`)
  and `.meet__quote + .meet__para` still sets the first one's top margin
  (`28, 18`).
- **A leak check.** `.fa__role` and `.community__eyebrow` are `<p>` siblings of
  the body copy, so a bare `:global(p)` would have restyled them. Both keep their
  own styling — verified, not assumed.
- `npm run check:page-copy` and `npm run check:md-to-pt` (80/80) pass.
- No horizontal overflow at 1920 / 1441 / 1440 / 1439 / 1000 / 768 / 430.

---

## What is left

- **Phase 6** — Studio polish: icon audit, previews, field descriptions naming
  the desk path, warning-only length caps. `blockquote` is still on two rows
  (`testimonial` and the Success Stories band); everything else is distinct.
- **Phase 7** — retire the old layer. Delete `src/content/` and
  `src/content.config.ts`, move the three scrapers to `scripts/legacy-scrapers/`,
  add the Sanity publish webhook → Vercel deploy hook. Nothing under `src/`
  imports `astro:content`, so this is a deletion and a webhook, not a migration.
- Then `/new-seo-setup` for sitemap, robots, redirects and the JSON-LD builders.

---

## What is in Sanity

**Twenty-nine document types** — 14 page singletons, seven collections, eight
Site Settings records — **plus five object types**: `navLink`, `seo`,
`blockContent`, and the two added on this branch, `aboutBody` and
`paragraphRun`.

| | |
|---|---|
| Pages | `homePage` · `aboutPage` · `practiceAreasPage` · `blogPage` · `testimonialsPage` · `contactPage` · `faqPage` · `videoCenterPage` · `hiringGuidePage` · `clientPortalPage` · `privacyPolicyPage` · `sitemapPage` · `thankYouPage` · `notFoundPage` |
| Collections | `practiceArea` 32 · `locationPage` 32 · `blogPost` 16 · `testimonial` 14 · `video` 9 · `faq` 9 · `award` 7 |
| Site Settings | `firmDetails` · `attorney` · `consultForm` · `caseEvaluationForm` · `whatDrivesUs` · `awardsBand` · `testimonialsBand` · `statsBand` |

Four collections are drag-ordered: `testimonial`, `award`, `faq`, `video`.

---

## Decisions made — don't relitigate

Most of these now live in `AGENTS.md` under "Modelling copy" and the Sanity
section, which is where durable rules belong. What is here is what is specific
to the current state.

- **Reordering the videos moves their posters.** The nine grid tiles are cut
  from six shoots, so three photographs appear twice. A reorder is a design
  decision: check the repeats still separate at 1000px and 650px.
- **The carousel order is not the grid order**, and is not meant to be. Four
  portrait posters cover six slides and no repeat may land twice in one view.
  `videoReels.picks` orders the carousel; `orderRank` orders the grid.
- **Wistia is asked for the runtime at BUILD time, never for a title.** The
  API's titles carry em dashes, emoji and hashtags, so titles are ours.
- **The three value icons are a picker, not an upload.** They are inlined SVGs
  taking their colour through `currentColor`; an upload arrives as `<img>` and
  loses it.
- **The two FAQ wordings live on ONE document.** `answer` is the client's
  published text verbatim; `shortAnswer` is ours for the homepage.
  `showOnHomepage` picks the six.
- **`/sitemap/`'s rows stay DERIVED.** Only its header is modelled.
- **Categories stay slug strings.** Their slugs are baked into the index's
  client-side filter, the CSS `FilterBoot` generates, and each card's
  `data-cats`.
- **The blog placeholder is the ABSENCE of artwork.** Six posts named the firm's
  generic graphic; they import with no image at all.
- **Papa is "Founding Attorney" everywhere**, from the `attorney` record. His
  name is still literal in three marketing spots, deliberately — the question
  was asked and scoped to the title.
- **The Google rating is deliberately NOT editable.** Modelled for one commit and
  removed at Rhan's direction (`bd0cf9b`); a collapsed object holding two
  strings was more Studio furniture than it was worth.
- **`attorney` is a singleton.** If the firm hires, it becomes a collection —
  with the real question that raises, which is whose byline goes on which
  article.

---

## Things that would surprise you

- **NEVER put a dot in a Sanity document id.** A `.` makes the id a PATH and the
  public read grant covers root-level ids only, so the document is invisible to
  the build while the Studio and the CLI both show it.
- **A long-running dev server serves new markup with STALE scoped CSS**, and the
  signature is that half the rules apply: every rule you did not touch works,
  every rule you edited does nothing. Read the loaded selectors out of
  `document.styleSheets` before debugging the CSS. Cost a round trip this
  session.
- **`npm run build` cannot catch a Studio dependency break.** Vite's
  dep-pre-bundle is dev-only. `@sanity/orderable-document-list` is pinned exactly
  (2.0.12, with an `overrides` entry holding `sanity-plugin-utils` at 2.0.10).
- **`@sanity/icons` v5 dropped the NAMED root exports, not the `icons` map.**
  `structure.ts` uses the map; schema files use the per-icon subpath. Both
  correct; don't unify them.
- **The bytes on the page are not the bytes in the file.** Astro passes
  `smartPunctuation` to satteri, so `accuser's` renders `accuser’s`.
- **`astro-portabletext` does NOT forward extra props** through the components
  map — component props are `{node, index, isInline}`. A paragraph that needs a
  class needs its own two-line component; that is what `ParagraphRun`'s `block`
  prop is for.
- **`scripts/import/home-page.ts` REPLACES the whole homepage document.** It is
  phase 2's and would delete every section of copy if re-run. Phase 5's is
  `home-page-copy.ts` and PATCHES with dotted paths.
- **`npm run typegen` is not `npx sanity typegen generate`.** The npm script runs
  `sanity schema extract` FIRST; the generate step alone regenerates from a stale
  snapshot and silently omits new types while printing success.
- **`/admin` needs a hard reload after every schema change.**
- **The checks run against a BUILT site, not the dev server.** Serve `dist/` with
  `python3 -m http.server` — `npx serve -s dist` returns the homepage for any
  path.
- **npm's PATH shimming can clobber `wc`, `tr` and `head` inside a shell loop.**
  Use `/usr/bin/python3` for anything counting or slicing.

---

## Waiting on Rhan

1. **The About tile's photo changed** — see the open question above.
2. **The lead form still has no endpoint.** `lead-form.ts` cancels submission and
   confirms inline, so `/thank-you/` is unreachable. Still the only thing between
   the site and a real enquiry.
3. **`/thank-you/` says nothing about what happens next** — no response time, no
   "call us if it's urgent". The wording is a commitment on the firm's behalf.
4. **Confirm the MyCase subdomain split** — `dieylaw` vs `dieyelaw`. Both work;
   one looks like a typo and it controls an OAuth callback.
5. **Should the homepage keep its `FAQPage` JSON-LD now that `/faq/` exists?**
6. **The nine FAQ questions are `<summary>` text, not headings**, so a screen
   reader navigating by heading skips all nine.
7. **`VideoObject` markup needs data only the firm has** — upload date, a
   one-line description per video, ideally a real frame as the thumbnail.
8. **The `/testimonials/` video tile is still a placeholder** — stock poster,
   generic label. The poster question was closed 2026-08-18; the label was not.
9. **Authored strings with no comp behind them** — `/client-portal/` in full,
   `/sitemap/`'s and `/faq/`'s kickers and decks, the 404's copy. Editable now;
   whether the wording is what the firm wants is still open. Page TITLES and META
   DESCRIPTIONS are the exception — still hardcoded, waiting on the SEO pass.
10. **26 of 32 practice areas and 26 of 32 location pages close with a "come talk
    to us" section.** Kept deliberately; six end on real content that must
    survive.
11. **FAQ answers were flattened by the scrape**, not by the migration. Their
    paragraph structure is not recoverable from the markdown.
12. **The source FAQ headings on the practice-area pages are more specific than
    the rendered one.** A `faqsHeading` field would fix it.
13. **`modifications-enforcement` is 290 words**, the thinnest practice area and
    the only one where the sidebar overhangs the article.
14. **The August blog post is categorised by us**, not the client, and still has
    no artwork.
15. **Two near-duplicate blog posts** — `understanding-child-custody-laws`
    (2025-01) and `understanding-child-custody-laws-in-pearland-texas` (2026-07).

---

## Manual steps before launch

1. **Sanity → Vercel publish webhook.** None exists (`sanity hook list` is
   empty). Needs a Vercel Deploy Hook, then a Sanity webhook pointed at it with
   the drafts toggle **off**.
2. **CORS for the production domain.** `http://localhost:4321` and
   `https://the-dieye-firm.vercel.app` are allowed; `www.dieyelaw.com` at launch.
3. **`robots.txt` and `sitemap.xml` still do not exist.** Deferred to
   `/new-seo-setup`. It must not ship without them.

---

## Known issues

- **The SEO tab is dead on all 14 page singletons.** Every page document has one
  and nothing reads any of them. Reserved for `/new-seo-setup`. This is the one
  place the migration knowingly breaks its own "no field an editor can't see
  work" rule — and after this branch's `pullQuote` bug, it is worth noting the
  inverse failure is the destructive one.
- **`WhatDrivesUs` reflows on font swap** — "Direct, Personal Attention" goes
  from one line to two when the real face loads, a 30px shift on 8 pages.
- **The office map is a bare Google embed on 92 pages**, loading at parse time
  and setting third-party cookies sitewide. The last holdout of the
  click-to-load rule.
- **`og:image` is on 16 of 95 pages.** Better solved by the SEO pass.
- **10 pages skip a heading level** (h1 → h3): 8 practice areas, one location
  page, and `/contact-us/`. The practice-area ones come from the client's own
  scraped headings; `/contact-us/` is ours and is the one to fix by hand.
- **No location page carries an image.**
- **The `/practice-areas/` hero is 1247×741**, so it upscales ~1.5× at 1920.
  Rhan chose the image knowing this.
