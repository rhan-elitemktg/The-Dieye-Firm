# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-20, on the `studio_polish` branch._

---

## Start here

**Phases 0–6 of the Sanity migration are done.** Phases 0–5 are merged to
`master` (PRs #31–#39); **phase 6 — Studio polish — is this branch**,
`studio_polish`, one commit, pushed and open as a PR.

Every word a reader sees comes from Sanity apart from the chrome `AGENTS.md`
lists. Twenty-nine document types, five object types.

Build green at 95 pages. `npx sanity documents validate` — 0 errors, 20
warnings, which is the SAME count as before this branch (all of them
pre-existing SEO meta-description lengths). That number is the test that this
branch's new length caps fire on nothing real.

The plan is at `~/.claude/plans/the-time-has-come-linear-emerson.md`.

---

## What this branch changed

Run as `/studio-polish all`. The brand half was already applied at scaffold, so
this is almost entirely the editor-UX half.

### Two duplicate document-type icons

- **`firmDetails` shared `Home` with `homePage`** — not previously known. It
  also disagreed with its own desk row, which already used `cog`. The desk row
  won, because that is the one an editor sees. Now `CogIcon`.
- **`testimonialsBand` shared `blockquote` with `testimonial`** — known, and now
  `comment`. The quote mark belongs to the individual review in Collections;
  this row is the homepage section that shows a carousel of them.

All 30 icons across the schema and the desk are now distinct.

### Length caps: six were secretly blocking, and all of them moved into one file

**A bare `.max(N)` is an ERROR, not a warning** — it needs `.warning()` to not
be one, and that is easy to miss when the surrounding lines look identical. Six
fields were error-level and would have blocked publishing (and so the deploy
hook) over a cosmetic overrun: `attorney.role`, `firmDetails.firmName`, two
nested `firmDetails` labels, `navLink.label`, and `caseEvaluationForm.privacyNote`.

The last one was the worst of them: it capped the reassurance line at 40 while
**the identical line on the consultation form holds 49 characters and had no cap
at all**. Pasting one into the other would have hit a hard stop on a difference
that does not matter. Both now share `capReassurance` at 60.

`src/sanity/schemaTypes/limits.ts` is new and holds all of it — seven helpers,
one per kind of short string, replacing (among others) the eyebrow rule that had
been copy-pasted 28 times. **The numbers are measured, not guessed**: the 17
singletons were queried for the longest real value per field kind (button 23,
split heading 38, figure 9, card title 26) and each cap set at roughly double.
`AGENTS.md` now carries the rule; `limits.ts` carries the measurements, the date
and the query to redo them.

`homePage.headingLines` is deliberately left UNCAPPED — it is the textarea where
the editor's own line breaks are the design, so a character count is the wrong
instrument. Don't "finish the job" by capping it.

### One uniqueness gap

Nothing stopped two of the three What Drives Us cards picking the same glyph.
Added a per-key check modelled on the socials one in `firmDetails.ts`, at
**warning** level — a repeated glyph looks like a mistake but breaks nothing.

### The `faq` name collision — a schema rename AND a dataset migration

The Studio was reporting two configuration warnings: `practiceArea.faqs[]` and
`locationPage.faqs[]` each declared an inline object named **`faq`**, which is
also the name of the global `faq` DOCUMENT type behind `/faq/`. Two different
shapes competing for one name — the inline one is `{question, answer}`, the
document adds `shortAnswer`, `showOnHomepage`, `orderRank`.

**It could not be fixed by a rename alone**, and this is the part worth
remembering: the 140 existing array items stored `_type: "faq"` in the dataset,
so renaming only the schema would have left the Studio unable to match them and
it would have rendered all 140 as **"Unknown type"** — strictly worse than the
warning. Schema and data have to move together.

- The member is now `pageFaq` in both schema files, each with a comment saying
  why and pointing at the migration.
- `scripts/import/practice-areas.ts` and `scripts/import/locations.ts` now emit
  `pageFaq`, so a re-scrape cannot reintroduce the collision.
  **`scripts/import/faqs.ts` still writes `_type: "faq"` and must keep doing
  so** — that one really is the global document.
- `scripts/import/rename-page-faq-type.ts` retyped 140 items across 30
  documents in one transaction. It is idempotent; re-running reports "Nothing
  to do". **This mutated the production dataset**, with Rhan's go-ahead, at a
  moment when no publish webhook exists so nothing redeployed.

---

## Open questions for Rhan

Unchanged from the last branch — none of the three has been answered.

1. **The About tile's photo changed.** It used to render
   `video-poster-pearland.jpg`; it now renders the referenced video's own
   poster, `papa-storefront.jpg`. Different photographs, both of Papa. This
   follows from the picker being real — a tile whose still does not change when
   you change the video is lying. If the Pearland shot is wanted back, the
   honest fix is to make it that video's poster in the Studio, which would also
   change `/video-center/`.
2. **The hiring guide's kicker changed from a link to plain text, and its label
   changed with it.** Removing the `kickerHref` FIELD did not do this: the value
   was already unset when the field was read, and nothing in that diff wrote
   `header.kicker`. It changed in the dataset between one build and the next.
   Almost certainly Rhan's own Studio edit — **but it was not confirmed**, and
   it was the second time a field moved without an obvious author.
3. **The stock face is on the homepage if the video is ever added to the band.**
   The tile works there — it was tested — but the poster is a stock portrait of
   nobody connected to the firm. Consider leaving video off the band until a
   real client video exists.

---

## How this branch was verified

- **`npm run typegen`** — schema extract + TypeGen. It still reports errors in
  **seven** files for duplicate `QUERY` const names; those are pre-existing and
  global to the project, not new. Confirm the count is seven, not eight.
- **`npx sanity documents validate`** — 0 errors, 20 warnings, the same 20 as
  before. This is the check that proves a new cap is honest: a cap that fires on
  real copy would show up here as a new warning, and none did. It is also the
  ONLY thing that sees a draft; the build never does.
- **`npm run build`** — 95 pages, unchanged count.
- **`npm run check:page-copy`** and **`npm run check:md-to-pt`** both pass.
- **The `/admin` login card, screenshotted pre-auth.** The whole brand layer —
  theme, workspace icon, title, login-card layout — renders before sign-in, so
  it is verifiable without ever logging in or publishing test content. Emblem
  centred above "Elite Legal Marketing", light-locked.
- **The FAQ sections in `dist/`** after the migration — 5 questions on
  `/harris-county-family-law-attorney/`, 5 on `/family-law/mediation-vs-litigation/`,
  32 pages carrying an FAQ section. This is the check that data and schema moved
  together.

**A GROQ counting trap, met on this branch.** `count(*[...].faqs[])` returned
174 where the real figure is 140: the 34 practice-area and location pages with
no `faqs` field each contribute a `null` to the flattened array, and `count()`
includes them. Sum per-document counts instead, or filter.

**`npm run diff:baseline` is still not usable.** `.baseline/` is the
PRE-migration build (`3f64a29`), so it reports every page differing no matter
what you do. It is still right for a change made against a pre-migration
surface.

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

Every SEO-carrying type declares **Content + SEO** field groups with no
ungrouped fields, so the SEO box already has its own tab everywhere. Nothing to
do there in the SEO pass beyond making the fields actually read.

---

## Decisions made — don't relitigate

The durable rules moved to `AGENTS.md` (see "Modelling copy", the length-cap
rule, and the Sanity section). What is here is specific to the current state.

- **A video testimonial's `name` is optional; a written one's is required.** The
  tile carries a stock portrait of nobody connected to the firm, and a client
  name under it would claim the face is a client.
- **`contactNote` is NOT part of the privacy policy's body.**
- **`headingIds={false}` is a PROP on ProseBody, not a second component.**
- **Six is a FLOOR for the testimonials band, not a count.** `.unique()` stays.
- **The carousel's arrows are NOT hidden when the track cannot scroll.**
- **The carousel order is not the grid order**, and is not meant to be.
- **Reordering the videos moves their posters.** Three photographs appear twice
  across nine tiles; check the repeats still separate at 1000px and 650px.
- **Wistia is asked for the runtime at BUILD time, never for a title.**
- **The three value icons are a picker, not an upload.**
- **The two FAQ wordings live on ONE document.** `answer` is the client's
  published text verbatim; `shortAnswer` is ours for the homepage.
- **`/sitemap/`'s rows stay DERIVED.** Only its header is modelled.
- **Categories stay slug strings.**
- **The blog placeholder is the ABSENCE of artwork.**
- **Papa is "Founding Attorney" everywhere**, from the `attorney` record.
- **The Google rating is deliberately NOT editable** (`bd0cf9b`).
- **`attorney` is a singleton.** If the firm hires it becomes a collection, with
  the real question that raises: whose byline goes on which article.
- **No tabs on top of the collapsed-accordion page singletons.** SEO already has
  its own tab; the accordion list stays inside Content so an editor never has to
  tab AND expand to reach page copy.

---

## Things that would surprise you

- **A bare `.max(N)` is an ERROR.** Six fields were silently blocking publishing
  until this branch. Caps live in `limits.ts` now; use the helpers.
- **A field the schema does not declare is DELETED when an editor saves that
  document.** Cost the homepage its client review. `grep -rn '\->' src/sanity/*.ts`
  lists every reference the site follows; each needs a `defineField`.
- **An inline array member must not share a name with a document type**, and
  fixing one after the fact is a dataset migration, not a rename — the stored
  `_type` has to move with the schema or every existing item reads "Unknown
  type". See the `pageFaq` note above.
- **A reference field offers "Create new" unless you turn it off.** All seven
  carry `options: { disableNew: true }`.
- **`npm run build` never sees a draft.** Only `npx sanity documents validate` does.
- **NEVER put a dot in a Sanity document id.** A `.` makes the id a PATH and the
  public read grant covers root-level ids only, so the document is invisible to
  the build while the Studio and the CLI both show it.
- **A long-running dev server serves new markup with STALE scoped CSS.** Read
  the loaded selectors out of `document.styleSheets` before debugging the CSS.
- **`astro-portabletext` does NOT forward extra props** through the components
  map — component props are `{node, index, isInline}`.
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
  `sanity schema extract` FIRST, and reports seven pre-existing duplicate
  `QUERY` const names, which are noise.
- **`/admin` needs a hard reload after every schema change.**
- **The checks run against a BUILT site, not the dev server.** Serve `dist/` with
  `python3 -m http.server` — `npx serve -s dist` returns the homepage for any path.
- **`.cfa__body { line-height: 30px }` is dead**, and has been. Pre-existing.
- **npm's PATH shimming can clobber `wc`, `tr` and `head` inside a shell loop.**
  Use `/usr/bin/python3` for anything counting or slicing.
- **The login card's layout hooks into Sanity's internal DOM**
  (`[data-ui="Container"]`, in `EliteMark.tsx`). Cosmetic only, and it fails
  gracefully to the default inline header. Worth a glance after a major Sanity
  upgrade.

---

## What is left

- **Phase 7** — retire the old layer. Delete `src/content/` and
  `src/content.config.ts`, move the three scrapers to `scripts/legacy-scrapers/`,
  add the Sanity publish webhook → Vercel deploy hook. Nothing under `src/`
  imports `astro:content`, so this is a deletion and a webhook.
- Then **`/new-seo-setup`** for sitemap, robots, redirects and the JSON-LD
  builders. This is also what makes the SEO tab live — the fields and their tabs
  already exist on all 17 routed types and nothing reads any of them.
- **`/sitemap/`** — the last footer link that still 404s.

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
   firm's own "About Us" reel and the poster is stock.
9. **Authored strings with no comp behind them** — `/client-portal/` in full,
   `/sitemap/`'s and `/faq/`'s kickers and decks, the 404's copy. Page TITLES and
   META DESCRIPTIONS are still hardcoded, waiting on the SEO pass.
10. **26 of 32 practice areas and 26 of 32 location pages close with a "come talk
    to us" section.** Kept deliberately; six end on real content that must survive.
11. **FAQ answers were flattened by the scrape**, not by the migration.
12. **The source FAQ headings on the practice-area pages are more specific than
    the rendered one.** A `faqsHeading` field would fix it.
13. **`modifications-enforcement` is 290 words**, the thinnest practice area and
    the only one where the sidebar overhangs the article.
14. **The August blog post is categorised by us**, not the client, and has no artwork.
15. **Two near-duplicate blog posts** — `understanding-child-custody-laws`
    (2025-01) and `understanding-child-custody-laws-in-pearland-texas` (2026-07).

---

## Manual steps before launch

1. **Sanity → Vercel publish webhook.** None exists (`sanity hook list` is
   empty). Needs a Vercel Deploy Hook, then a Sanity webhook pointed at it with
   the drafts toggle **off**. Note that until this exists, a dataset migration
   like this branch's does not trigger a rebuild — which made it a safe moment
   to run one, and will not be next time.
2. **CORS for the production domain.** `http://localhost:4321` and
   `https://the-dieye-firm.vercel.app` are allowed; `www.dieyelaw.com` at launch.
3. **`robots.txt` and `sitemap.xml` still do not exist.** Deferred to
   `/new-seo-setup`. It must not ship without them.

---

## Known issues

- **The SEO tab is inert on all 17 routed types.** Every field and every tab
  exists and nothing reads any of them. Reserved for `/new-seo-setup`. Which
  direction is dangerous is worth restating: a field nothing READS is a broken
  promise to an editor; a field nothing DECLARES gets deleted.
- **`WhatDrivesUs` reflows on font swap** — a 30px shift on 8 pages.
- **The office map is a bare Google embed on 92 pages**, loading at parse time
  and setting third-party cookies sitewide.
- **`og:image` is on 16 of 95 pages.** Better solved by the SEO pass.
- **10 pages skip a heading level** (h1 → h3): 8 practice areas, one location
  page, and `/contact-us/`. `/contact-us/` is ours and is the one to fix by hand.
- **No location page carries an image.**
- **The `/practice-areas/` hero is 1247×741**, so it upscales ~1.5× at 1920.
