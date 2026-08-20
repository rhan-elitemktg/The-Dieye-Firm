# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-20, on the `seo_layer` branch._

---

## Start here

**The Sanity migration is done (phases 0–7) and the SEO layer is built.**
Phases 0–6 are merged to `master` — PRs #31–#39, plus #40 (`studio_polish`)
as `20f66ed`. **Phase 7 is on `phase_7_retire_content_layer`**, pushed,
awaiting a PR. **The SEO layer is THIS branch**, `seo_layer`, branched off
phase 7. Merge phase 7 first.

**The one thing phase 7 could not finish is the publish webhook** — see Manual
steps. Both halves of it are dashboard work: `vercel project` has no
deploy-hook subcommand, and `sanity hooks create` is interactive-only.

Every word a reader sees comes from Sanity apart from the chrome `AGENTS.md`
lists. Twenty-nine document types, five object types.

Build green at 95 pages. `npx sanity documents validate` — 0 errors, 20
warnings, which is the SAME count as before this branch (all of them
pre-existing SEO meta-description lengths). That number is the test that this
branch's new length caps fire on nothing real.

The plan is at `~/.claude/plans/the-time-has-come-linear-emerson.md`.

---

## What this branch changed — the SEO layer (`/new-seo-setup`)

**The headline result: 94 pages, ZERO differences** in `<title>`,
`<meta name="description">`, canonical, `og:url`, `og:title` and
`og:description` against a pre-change build. The whole layer is a no-op until an
editor fills something in, which is the one guarantee it makes.

### This site was much further along than a fresh one

Four of the thirteen steps were already partly or wholly done, and finding that
out first is what kept this pass small:

- The `seo` object already had the exact five-field shape, attached to all 17
  routed types inside Content/SEO tabs — steps 3 and 4, done in phase 5.
- The three collection queries already fetched `metaTitle`/`metaDescription`.
- `Layout` already emitted title, description, the full `og:`/`twitter:` set and
  an optional canonical.
- **14 files already emitted JSON-LD.** Step 9 was an audit, not a build.

### Two deliberate divergences from the reference build

Both are written up in `AGENTS.md`; the reasons matter more than the rules.

1. **The brand suffix applies to the editor's title, not to the fallback.** 92
   of 93 titles already arrive at `Layout` carrying " | The Dieye Firm".
   Appending unconditionally, as the reference does, would have shipped the
   brand twice on 92 pages.
2. **`canonicalize()` keeps the trailing slash.** Every URL here ends in one and
   every existing canonical said so. The reference strips it, which would have
   pointed 95 canonicals at URLs that only exist as a redirect. Internal
   redirect destinations get the slash back for the same reason.

### ⚠️ The deploy break this caused, and the rule that came out of it

**`bulkRedirectsPath` is NOT set in `vercel.json`, deliberately.** Setting it
against an empty redirect list broke every deployment after the merge —
**production included** — and the failure is disguised: the build completes with
95 pages and "Build Completed", and then `Deploying outputs…` fails with
`No redirects found in the provided files: bulk-redirects.json`. Vercel treats
an empty bulk redirects file as fatal.

**The redirects are now IN SANITY — 23 documents, seeded from `vercel.json`'s
46 rules (23 sources × 2 slash forms) by `scripts/import/redirects.ts`.** That
array is gone from `vercel.json`; the Studio list is the only one. Every rule
was proved to round-trip exactly — same sources, destinations and status codes —
before the old list was deleted, and none collides with a live page.

**That is now fixed properly, not documented around.** The first instinct was a
rule — "only set the key while a redirect exists" — but that ties a config file
to the contents of a Sanity collection with nothing at either end to say so.
`bulk-redirects.json.ts` emits one inert placeholder when there are no real
rules, so the empty case cannot arise; `bulkRedirectsPath` stays set permanently
and the collection can be emptied freely. Both states are build-tested.

The one silver lining: the failure proves `bulkRedirectsPath` RESOLVES. Vercel
found and read the file; it rejected the contents. That was the open question
from the build.

### And one deviation from the command's instructions

**`vercel.json`'s 46 redirects were NOT deleted.** The command says to seed them
into Sanity and then remove them so there is one list. The seeding has not
happened yet (see below), and removing 46 known-working rules in favour of a
mechanism that **cannot be verified anywhere but a deployment** would be a bad
trade. `bulkRedirectsPath` is wired and the generator is proved; the vercel.json
rules stay as the fallback until a deploy shows bulk redirects firing, and then
they come out. Duplicates pointing the same way are harmless meanwhile.

### What is new

| File | Does |
|---|---|
| `src/lib/routePaths.ts` | the hardcoded paths, `normalizePath`, `slashForms`. **Free of `sanity:client`** — the redirect schema imports it |
| `src/lib/seo.ts` | `resolveSeo`, `resolveTitle`, `canonicalize`, `SITE_NAME` |
| `src/lib/schema.ts` | the firm `LegalService` builder, with a stable `@id` |
| `src/sanity/globalSeo.ts` | `getGlobalSeo`, `getSeo`, `getStaticPageSeo` |
| `src/sanity/routes.ts` | `getSiteEntries` / `getLivePaths` — the ONE copy of "what URLs exist" |
| `src/sanity/redirects.ts` | `getRedirects` |
| `src/sanity/schemaTypes/globalSeo.ts` | the Global SEO Settings singleton |
| `src/sanity/schemaTypes/redirect.ts` | the redirect document + its validators |
| `src/pages/sitemap.xml.ts` | 92 URLs, hand-rolled |
| `src/pages/robots.txt.ts` | dynamic, driven by the crawl switch |
| `src/pages/bulk-redirects.json.ts` | the edge redirect table |
| `docs/redirects-for-editors.md` | the SEO team's how-to |

Studio: **Site Settings → Global SEO Settings** is a FOLDER holding *Defaults*
and *Redirects*. A folder from the start, because adding one later moves the
singleton's URL. `redirect` is in `COLLECTIONS` but deliberately NOT in the
create-guard — editors must be able to add one.

### How it was verified

- **Byte-diff against a step-0 baseline** — 94 pages, 0 differences, six head
  fields each. This is the test that matters.
- **Override check** — a throwaway page with a filled `seo` object: meta title,
  description, canonical and robots all won. Deleted afterwards.
- **Crawl switch** — stubbed `getGlobalSeo()` to `discourageCrawling: true`:
  `robots.txt` became `Disallow: /` and 93 of 94 pages carried noindex (the 94th
  is `/admin`, which does not use Layout). **Stub reverted.**
- **Redirect guard** — stubbed `getRedirects()` with a live-page source, a
  self-loop, a case-differing duplicate and four valid rules. All four bad ones
  were dropped with a build-log line naming each, both live pages still built,
  and the four good ones came out as 8 rules (both slash forms), 301/302
  correct, external destination untouched. **Stub reverted.** Nothing was
  written to the production dataset to test this.
- Sitemap: 92 URLs, `/thank-you/`, `/404` and `/admin` correctly absent.
- Build 95 pages; `check:page-copy` passes; validate 0 errors / 20 warnings;
  typegen still exactly 7 pre-existing duplicate-`QUERY` errors.
- No horizontal overflow at 1920 / 1441 / 1440 / 1439 / 1000 / 768 / 430.

---

## What this branch changed — phase 7, retiring the old layer

**`src/content/` and `src/content.config.ts` are DELETED**, and `astro:content`
is no longer a dependency of this site. 95 pages still build, unchanged.

- The three scrapers, `add-takeaways.mjs`, `blog-redirects.json` and the
  `md-to-pt` proof moved to **`scripts/legacy-scrapers/`**, which has a README
  covering what each did and how to bring them back. Only 7 lines changed inside
  them, all relative paths — `git diff -M --stat` shows it.
- The four npm scripts that fed them (`scrape:blog`, `scrape:practice-areas`,
  `scrape:locations`, `check:md-to-pt`) are **gone from `package.json`**. Run
  them by path if ever needed.
- **`becaca2` is the restore point.** It is the last commit carrying all 80
  markdown files: `git checkout becaca2 -- src/content`. The three importers
  that read them (`import/blog.ts`, `import/locations.ts`,
  `import/practice-areas.ts`) each say so in their header now.

**`blog-redirects.json` was safe to park** because all 16 of its redirects are
already live in `vercel.json` — that was checked, not assumed. The file is only
ever read by `scrape-practice-areas.mjs` to rewrite links.

**Stale paths were swept, including two that would have misled at BUILD FAILURE
time.** `src/pages/[...slug].astro` threw errors naming
`src/content/locations/…md`; they now name the `locationPage` slug and tell you
to change it in the Studio. `AGENTS.md`, `Blog.astro`, `ProseBody.astro` and
`lib/html.mjs` were updated too. A stale path in a comment is a wrong answer to
the next person who greps for it.

**What did NOT move:** `lib/html.mjs` and `lib/md-to-pt.mjs` stay in
`scripts/lib/` — the latter is still used in production by the three importers.
`scripts/import/` stayed put; most of those never touched `src/content/`.

---

## What phase 6 changed (merged in #40 — kept here because it is recent)

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
- **`npm run check:page-copy`** passes. `check:md-to-pt` retired with the
  content it read (its 80/80 proof stands in git history).
- **`npm run check:prose-styles` must be given a `--url`.** Run bare it probes
  `/`, where the practice-area FAQ selectors do not exist, and reports
  `notApplicable` with `passed: 0` — which reads like a failure and is not.
  Against `/family-law/mediation-vs-litigation/` and
  `/harris-county-family-law-attorney/` it is 6/6, which is the run that
  exercises the FAQ prose path phase 6's `pageFaq` migration touched.
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

- **The publish webhook** — the only part of phase 7 still open. See Manual
  steps below; it is dashboard work on both halves.
- **Wildcards, if any are ever needed.** Bulk redirects support neither
  wildcards nor header matching, so those go back in a `redirects` array in
  `vercel.json` and stay developer-owned. The redirect schema blocks `*` in the
  Old URL field with a message pointing the editor at a developer.
- **Give the other business-schema emitters the same `@id`** as `lib/schema.ts`
  builds. Seven pages besides the homepage still carry no firm entity, and the
  `@id` is what would let one be emitted sitewide without describing the firm
  twice on the 65 pages that already do.
- ~~`/new-seo-setup`~~ for sitemap, robots, redirects and the JSON-LD
  builders. This is also what makes the SEO tab live — the fields and their tabs
  already exist on all 17 routed types and nothing reads any of them.

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

1. **Sanity → Vercel publish webhook — the last piece of phase 7.** None exists
   (`sanity hooks list` is empty). **Both halves are dashboard work**, which is
   why phase 7 could not close it: `vercel project` has no deploy-hook
   subcommand, and `sanity hooks create` takes no url/dataset/trigger flags —
   it is interactive only.

   - **Vercel** → Project Settings → Git → Deploy Hooks → create one on
     `master`. Copy the URL. (The Vercel CLI is authenticated here as
     `rhan-1746`, but the project is not linked locally — no
     `.vercel/project.json` — so `vercel link` comes first if you want to drive
     it from the terminal.)
   - **Sanity** → `npx sanity hooks create`, or the sanity.io dashboard.
     Dataset `production`, URL as above, and the **drafts toggle OFF** — every
     keystroke in the Studio writes a draft, so leaving it on would rebuild the
     site continuously.

   Until this exists, publishing changes nothing on the live site, and a dataset
   migration does not trigger a rebuild — which is what made phase 6's
   `pageFaq` migration a safe thing to run, and will not be true next time.
2. **CORS for the production domain.** `http://localhost:4321` and
   `https://the-dieye-firm.vercel.app` are allowed; `www.dieyelaw.com` at launch.
3. **Upload a default social share image** (1200 × 630) — Studio → Site
   Settings → Global SEO Settings → Defaults. Without it, a shared link renders
   with no card image. Nothing else in the SEO layer is waiting on content.
4. **Turn the crawl switch ON now, OFF at launch.** Same document. While the
   site is on `the-dieye-firm.vercel.app` it should be hidden; the moment DNS
   cuts over it must be turned off, or the real site never appears in search.
   This is the single setting that can silently cost every ranking, which is why
   the Studio row says so and the field description shouts it.
5. **Submit `https://www.dieyelaw.com/sitemap.xml`** in Google Search Console,
   after the switch is off.
6. **Confirm `www` is the PRIMARY host in Vercel**, with the apex redirecting to
   it. Every canonical says `www`; if Vercel serves the apex as primary instead,
   all 92 canonicals point at a redirect.
7. **Confirm the Vercel plan includes Bulk Redirects** (Pro includes 1,000).
   Without it `bulkRedirectsPath` is simply never read and editor-managed
   redirects silently do nothing — the 46 rules in `vercel.json` keep working,
   so the failure is quiet.
8. **Seed the old site's redirects into the Studio**, then delete the
   equivalents from `vercel.json` — but only AFTER a deploy proves bulk
   redirects fire. See the deviation note above.

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
