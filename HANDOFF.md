# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-20, on the `sanity_bug_fixes` branch._

---

## Start here

**Phases 0–5 of the Sanity migration are merged to `master`** (PRs #31–#38). All
14 page singletons are modelled and every word a reader sees comes from Sanity
apart from the chrome `AGENTS.md` lists.

This branch, `sanity_bug_fixes`, is **two commits ahead of `master` and not yet
pushed**. Both came out of Rhan working through the Studio page by page, which
is why they are bug fixes and editor-experience changes rather than new pages.

Build green at 95 pages. `npx sanity documents validate` — 0 errors, 20 warnings
(all pre-existing SEO meta-description lengths).

The plan is at `~/.claude/plans/the-time-has-come-linear-emerson.md`.

---

## What this branch changed

### Commit 1 — a destructive schema gap, rich text for prose runs, unreachable fields

- **`homePage.about.pullQuote` was being DELETED by the Studio.** It was a live
  reference the code read and the page rendered, and it was never declared in
  the schema — so opening and saving the Home Page pruned it and the next build
  failed. Restored, declared, and written up in `AGENTS.md`. A sweep found no
  other undeclared reference.
- **Copy that is a contiguous run of prose became one rich-text field.** Nine
  fields on the homepage About section became one `aboutBody`; five plain
  paragraph runs became `paragraphRun`. Both heroes whose headline break is a
  design decision went from an array of one-line boxes to one textarea.
- **Three things an editor could not reach** became fields: `about.video`,
  `about.pullQuote`, and `videoReels.picks` (which retired `video.reelOrder`).

### Commit 2 — testimonials, the reference picker, and the two legal-ish pages

- **A testimonial is now written OR video**, chosen by a `kind` radio. The video
  fields (`wistiaId`, `poster`, `label`, `caption`) and the written ones gate on
  it. `name` is REQUIRED for written and OPTIONAL for video — see the decision
  below, it is a rule and not a convenience.
- **The video tile is a collection document**, not markup. It was a hardcoded
  const in `ReviewWall.astro`; it is `testimonial-video-client-story`, ordered
  first, draggable like any row. The tile itself is now
  `testimonials/VideoTile.astro`, shared by the wall and the homepage band.
- **Reference fields no longer offer "Create new".** All seven carry
  `options: { disableNew: true }`. Without it the picker put "make a blank one"
  next to "pick an existing one", which is how Rhan ended up filling in a Wistia
  ID for a video that already existed — and how an untracked testimonial could
  be created outside the collection its provenance rules live on.
- **The band takes six or more, no maximum.** Was exactly six.
- **"Success Stories Band" is "Testimonials Band"** in the Studio. The band's
  heading on the page still reads "Success Stories" — that is editor copy and a
  reader-facing name, and it was left alone.
- **`/privacy-policy/` and `/about-us/choosing-a-family-law-attorney/` are each
  ONE body field**, headings included, instead of paired heading+body sections.

---

## Open questions for Rhan

1. **The About tile's photo changed** (commit 1). It used to render a local
   file, `video-poster-pearland.jpg`; it now renders the referenced video's own
   poster, `papa-storefront.jpg`. Different photographs, both of Papa. This
   follows from the picker being real — a tile whose still does not change when
   you change the video is lying. If the Pearland shot is wanted back, the
   honest fix is to make it that video's poster in the Studio, which would also
   change `/video-center/`.
2. **The hiring guide's kicker changed from a link to plain text, and its label
   changed with it** — `<a href="/about-us/">About Us</a>` became
   `Choosing an Attorney`. Removing the `kickerHref` FIELD did not do this: the
   value was already unset when the field was read, and nothing in the diff
   writes `header.kicker`. It changed in the dataset between one build and the
   next. Almost certainly Rhan's own Studio edit while he was on that page —
   **but it was not confirmed**, and it is the second time this session a field
   moved without an obvious author. Worth a glance.
3. **That stock face is now on the homepage if the video is ever added to the
   band.** The tile works there — it was tested — but the poster is a stock
   portrait of nobody connected to the firm. Consider leaving video off the band
   until a real client video exists.

---

## How the "nothing moved" rule was held on this branch

`npm run diff:baseline` is **not usable for this work**. `.baseline/` is the
PRE-migration build (`3f64a29`), so it reports 94/94 pages differing no matter
what you do. It is still right for a change made against a pre-migration
surface; it was the wrong tool here.

What was used instead:

- **Snapshot `dist/` before the change, diff the section after.** Every prose-run
  conversion came out identical once scope hashes and inter-tag whitespace were
  removed, with no entity differences. The two legal-ish pages differ by exactly
  their `<h2>` losing the page's scope hash — 16 fragments on the privacy policy,
  10 on the hiring guide — and nothing else.
  **Do not snapshot several pages into one directory with `cp`**; they are all
  `index.html` and the last one wins. That lost the `/testimonials/` before-state
  on this branch and it had to be verified structurally instead.
- **Assert computed styles against the declarations in the source.** The half a
  byte-diff is structurally blind to. It proved the two structural selectors that
  could silently have stopped matching — `.why__body p:last-child` and
  `.meet__quote + .meet__para` — still fire, and that `.vtile`'s rules survived
  being moved into their own component, media queries included.
- **A leak check.** `.fa__role` and `.community__eyebrow` are `<p>` siblings of
  body copy; a bare `:global(p)` would have restyled them.
- **`npx sanity documents validate`** — the build reads published documents only,
  so it is the ONLY thing that sees a broken draft. It is what surfaced the
  abandoned half-made testimonial. Run it before committing.
- `npm run check:page-copy` and `npm run check:md-to-pt` (80/80) pass.
- No horizontal overflow at 1920 / 1441 / 1440 / 1439 / 1000 / 768 / 430.

---

## What is in Sanity

**Twenty-nine document types** — 14 page singletons, seven collections, eight
Site Settings records — **plus five object types**: `navLink`, `seo`,
`blockContent`, `aboutBody`, `paragraphRun`.

| | |
|---|---|
| Pages | `homePage` · `aboutPage` · `practiceAreasPage` · `blogPage` · `testimonialsPage` · `contactPage` · `faqPage` · `videoCenterPage` · `hiringGuidePage` · `clientPortalPage` · `privacyPolicyPage` · `sitemapPage` · `thankYouPage` · `notFoundPage` |
| Collections | `practiceArea` 32 · `locationPage` 32 · `blogPost` 16 · `testimonial` 15 (14 written + 1 video) · `video` 9 · `faq` 9 · `award` 7 |
| Site Settings | `firmDetails` · `attorney` · `consultForm` · `caseEvaluationForm` · `whatDrivesUs` · `awardsBand` · `testimonialsBand` · `statsBand` |

Four collections are drag-ordered: `testimonial`, `award`, `faq`, `video`.

---

## Decisions made — don't relitigate

The durable rules moved to `AGENTS.md` (see "Modelling copy" and the Sanity
section). What is here is specific to the current state.

- **A video testimonial's `name` is optional; a written one's is required.** The
  tile carries a stock portrait of nobody connected to the firm, and a client
  name under it would claim the face is a client — the exact thing the
  collection's "nothing may be invented" header exists to prevent. Give a video
  a name only once a real client is behind it.
- **`contactNote` is NOT part of the privacy policy's body.** The phone number
  and postal address after that sentence are rendered from `firmDetails`. As
  rich text an editor would be typing a number the Studio could never keep
  current.
- **`headingIds={false}` is a PROP on ProseBody, not a second component.** Two
  pages pass it, because their headings are ours and the live source has none,
  so nothing anywhere links to one. A prop keeps ProseBody's own rule true —
  every rich-text field comes through it — and puts the exception at the call
  site instead of hiding it in an import.
- **Six is a FLOOR for the band, not a count.** At three-per-view it is two full
  pages, so the last page is never a lone card beside two gaps. `.unique()`
  stays: the same review twice in one carousel is always a mistake.
- **The carousel's arrows are NOT hidden when the track cannot scroll.** That
  rule existed briefly while the band's minimum was one; a floor of six makes
  the state unreachable at every breakpoint, so it was removed rather than left
  as code nothing reaches. Two lines to restore if the minimum drops below four.
- **The carousel order is not the grid order**, and is not meant to be. Four
  portrait posters cover six slides and no repeat may land twice in one view.
  `videoReels.picks` orders the carousel; `orderRank` orders the grid.
- **Reordering the videos moves their posters.** Three photographs appear twice
  across nine tiles; check the repeats still separate at 1000px and 650px.
- **Wistia is asked for the runtime at BUILD time, never for a title.**
- **The three value icons are a picker, not an upload** — inlined SVGs taking
  their colour through `currentColor`.
- **The two FAQ wordings live on ONE document.** `answer` is the client's
  published text verbatim; `shortAnswer` is ours for the homepage.
- **`/sitemap/`'s rows stay DERIVED.** Only its header is modelled.
- **Categories stay slug strings** — baked into the index's client-side filter,
  the CSS `FilterBoot` generates, and each card's `data-cats`.
- **The blog placeholder is the ABSENCE of artwork.**
- **Papa is "Founding Attorney" everywhere**, from the `attorney` record.
- **The Google rating is deliberately NOT editable** (`bd0cf9b`).
- **`attorney` is a singleton.** If the firm hires it becomes a collection, with
  the real question that raises: whose byline goes on which article.

---

## Things that would surprise you

- **A field the schema does not declare is DELETED when an editor saves that
  document.** Cost the homepage its client review this session. `AGENTS.md` has
  the full note; `grep -rn '\->' src/sanity/*.ts` lists every reference the site
  follows, and each needs a `defineField`.
- **A reference field offers "Create new" unless you turn it off.** All seven
  now carry `options: { disableNew: true }`. Without it an editor filling a
  picker gets a blank document form and no hint that the thing they wanted
  already exists.
- **`npm run build` never sees a draft.** Only `npx sanity documents validate`
  does. A half-made document can sit in a collection with a red dot forever and
  every build stays green.
- **NEVER put a dot in a Sanity document id.** A `.` makes the id a PATH and the
  public read grant covers root-level ids only, so the document is invisible to
  the build while the Studio and the CLI both show it.
- **A long-running dev server serves new markup with STALE scoped CSS**, and the
  signature is that half the rules apply: every rule you did not touch works,
  every rule you edited does nothing. Read the loaded selectors out of
  `document.styleSheets` before debugging the CSS. Cost a round trip this
  session.
- **`astro-portabletext` does NOT forward extra props** through the components
  map — component props are `{node, index, isInline}`. A paragraph that needs a
  class needs its own two-line component; that is what `ParagraphRun`'s `block`
  prop is for.
- **`npm run build` cannot catch a Studio dependency break.** Vite's
  dep-pre-bundle is dev-only. `@sanity/orderable-document-list` is pinned exactly
  (2.0.12, with an `overrides` entry holding `sanity-plugin-utils` at 2.0.10).
- **`@sanity/icons` v5 dropped the NAMED root exports, not the `icons` map.**
  `structure.ts` uses the map; schema files use the per-icon subpath.
- **The bytes on the page are not the bytes in the file.** Astro passes
  `smartPunctuation` to satteri, so `accuser's` renders `accuser’s`.
- **`scripts/import/home-page.ts` REPLACES the whole homepage document.** It is
  phase 2's and would delete every section of copy if re-run. Phase 5's is
  `home-page-copy.ts` and PATCHES with dotted paths.
- **`npm run typegen` is not `npx sanity typegen generate`.** The npm script runs
  `sanity schema extract` FIRST. It also reports seven pre-existing duplicate
  `QUERY` const names — global across the project — which are noise, not new.
- **`/admin` needs a hard reload after every schema change.**
- **The checks run against a BUILT site, not the dev server.** Serve `dist/` with
  `python3 -m http.server` — `npx serve -s dist` returns the homepage for any
  path.
- **`.cfa__body { line-height: 30px }` is dead**, and has been. `global.css:263`
  has `p { line-height: 29px }`, and a direct element rule beats inheritance.
  Pre-existing; left alone because fixing it would visibly change the page.
- **npm's PATH shimming can clobber `wc`, `tr` and `head` inside a shell loop.**
  Use `/usr/bin/python3` for anything counting or slicing.

---

## What is left

- **Phase 6** — Studio polish: icon audit, previews, field descriptions naming
  the desk path, warning-only length caps. `blockquote` is still on two rows
  (`testimonial` and the Testimonials Band); everything else is distinct.
- **Phase 7** — retire the old layer. Delete `src/content/` and
  `src/content.config.ts`, move the three scrapers to `scripts/legacy-scrapers/`,
  add the Sanity publish webhook → Vercel deploy hook. Nothing under `src/`
  imports `astro:content`, so this is a deletion and a webhook.
- Then `/new-seo-setup` for sitemap, robots, redirects and the JSON-LD builders.

---

## Waiting on Rhan

1. The three open questions above.
2. **The lead form still has no endpoint.** `lead-form.ts` cancels submission and
   confirms inline, so `/thank-you/` is unreachable. Still the only thing between
   the site and a real enquiry.
3. **`/thank-you/` says nothing about what happens next** — no response time, no
   "call us if it's urgent". The wording is a commitment on the firm's behalf.
4. **Confirm the MyCase subdomain split** — `dieylaw` vs `dieyelaw`.
5. **Should the homepage keep its `FAQPage` JSON-LD now that `/faq/` exists?**
6. **The nine FAQ questions are `<summary>` text, not headings**, so a screen
   reader navigating by heading skips all nine.
7. **`VideoObject` markup needs data only the firm has** — upload date, a
   one-line description per video, ideally a real frame as the thumbnail.
8. **The `/testimonials/` video tile is still provisional** — the video is the
   firm's own "About Us" reel and the poster is stock. Both notes now travel on
   the document rather than in a code comment.
9. **Authored strings with no comp behind them** — `/client-portal/` in full,
   `/sitemap/`'s and `/faq/`'s kickers and decks, the 404's copy. Page TITLES and
   META DESCRIPTIONS are still hardcoded, waiting on the SEO pass.
10. **26 of 32 practice areas and 26 of 32 location pages close with a "come talk
    to us" section.** Kept deliberately; six end on real content that must
    survive.
11. **FAQ answers were flattened by the scrape**, not by the migration.
12. **The source FAQ headings on the practice-area pages are more specific than
    the rendered one.** A `faqsHeading` field would fix it.
13. **`modifications-enforcement` is 290 words**, the thinnest practice area and
    the only one where the sidebar overhangs the article.
14. **The August blog post is categorised by us**, not the client, and has no
    artwork.
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
  and nothing reads any of them. Reserved for `/new-seo-setup`. After this
  branch's `pullQuote` bug it is worth restating which direction is dangerous:
  a field nothing READS is a broken promise to an editor; a field nothing
  DECLARES gets deleted.
- **`WhatDrivesUs` reflows on font swap** — a 30px shift on 8 pages.
- **The office map is a bare Google embed on 92 pages**, loading at parse time
  and setting third-party cookies sitewide.
- **`og:image` is on 16 of 95 pages.** Better solved by the SEO pass.
- **10 pages skip a heading level** (h1 → h3): 8 practice areas, one location
  page, and `/contact-us/`. `/contact-us/` is ours and is the one to fix by hand.
- **No location page carries an image.**
- **The `/practice-areas/` hero is 1247×741**, so it upscales ~1.5× at 1920.
