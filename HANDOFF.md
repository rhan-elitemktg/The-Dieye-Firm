# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-19, on the `sanity_last_pages` branch._

---

## Start here

**PHASE 5 IS COMPLETE — all 14 page singletons.** Phases 0–4 and the first
eight pages are **merged to `master`** (PRs #31–#36). The last six are committed
and pushed on `sanity_last_pages` (`f8b5a5b`) and **not yet merged**.

Every word a reader sees on this site now comes from Sanity, apart from the
chrome the decisions below keep in code deliberately. What is left is phase 6
(Studio polish), phase 7 (retire the old layer, wire the publish webhook), and
then `/new-seo-setup`.

Build green at 95 pages. Every one of the 80 pages of ingested client prose
renders from Sanity, plus the reviews, the consultation section, the sidebar
enquiry card, the attorney, the What Drives Us band, the awards strip, the nine
FAQs, the nine videos — and all fourteen pages' own copy.

The plan is at `~/.claude/plans/the-time-has-come-linear-emerson.md`. Read it
before continuing — it holds the phase order, the reasoning behind the model,
and the deliberate departures from the Cogdell reference.

**The governing rule of this pass: the rendered page must not change.** Sixty-
four of the 95 pages are the client's own published prose and carry the site's
SEO equity. Every phase is proved against a frozen pre-migration build.

---

## The two proof tools — read this before trusting a green result

**`npm run diff:baseline`** compares `dist/` against `.baseline/`, a frozen copy
of the pre-migration build. `.baseline/` is **gitignored**, so a fresh clone has
to rebuild it — and it must be rebuilt from a commit with no migration work in
it, or the test silently starts comparing the new world against itself and
passes for the wrong reason. The commit it came from is in
`.baseline/.BASELINE_COMMIT` (`3f64a29`).

**`npm run check:md-to-pt`** converts all 80 markdown files to Portable Text,
renders them back to HTML with an INDEPENDENT renderer, and diffs against the
baseline's article bodies. 80/80.

**Neither is sufficient alone, and that is not theoretical.** The converter check
proves the *conversion* is lossless; it cannot see how `astro-portabletext`
actually renders. A span carrying both bold and a link emits `<strong><a>` from
markdown and `<a><strong>` from the real renderer — same data, same appearance,
inverted nesting. `diff:baseline` caught that; the converter check never could.

**`npm run check:page-copy`** is the third tool, and it guards a rule rather
than the bytes: page copy must render on exactly one page. It walks
`import … from "*.astro"` from every page in `src/pages/`, so it sees a shared
section that the page you are working on gives no sign of. One exemption is
hardcoded with its reason — `home/Faq.astro`, where `/faq/` passes
`head={false}` and supplies its own items, so the fields modelled on `homePage`
really do render once. **Run it before modelling any page**; the rule was
written down and then broken twice in two days.

**And a third thing the byte tools do not cover:** a scoped CSS rule that stops matching when
markup moves into a renderer. The markup stays correct, the build stays green,
and the type silently reverts to browser defaults. `scripts/checks/prose-styles.js`
exists for exactly that — it asserts computed styles, so run it on a page that
has the markup in question.

---

## Known differences from the baseline — four, all understood

Anything beyond these four is a regression.

1. **`/blog/`** — the featured post differs, because the flag was changed in the
   Studio. Data, not code.
2. **`/blog/how-the-2025-…/`** — now has an `og:image`. Deliberate: a post with
   no artwork used to emit none, so sharing it produced a blank card.
3. **`/harris-county-family-law-attorney/`** — the `<strong><a>` nesting above.
   Three occurrences, one page, no CSS depends on the order.
4. **`/about-us/`** — `Testimonials.css` moved from inlined to a `<link>` when
   MeetPapa gained an import. Verified as delivery, not content: 511 CSS rules
   before, 511 after, none missing.

Plus these classes, which are expected everywhere they occur: inter-block
whitespace, `data-astro-cid` attributes, content-hashed asset filenames, Sanity
CDN image URLs, `&#39;` escaping of editor-supplied apostrophes, the
`.pfaq__a :global(p)` selector, and two blog posts whose reading time went 6 min
→ 5 (a bug fix — it used to count `##` and `-` as words).

Phase 4c added two more of the same kind, on `/`, `/about-us/`, `/thank-you/`
and `/video-center/`. Both were checked rather than assumed:

- **`alt` → `alt=""`.** Astro emits a bare `alt` for an empty one; a plain
  `<img>` emits `alt=""`. Identical to HTML and to a screen reader.
- **`&quot;` joins `&#39;`.** Static markup keeps a literal `"` and `'`; the
  same text through an expression is escaped. Phase 5 moves copy into
  expressions, so both appear — 11 of them on the homepage, which is its ENTIRE
  diff. The test that this is only escaping is `html.unescape(before) ==
  html.unescape(after)`, hunk by hunk, not eyeballing.
- **Poster `width`/`height` now describe the largest REQUESTED size, not the
  source file** (1500×835 → 920×512, the same ratio to a rounding error). Every
  one of those images is `position: absolute; inset: 0; object-fit: cover`, so
  the attributes carry an aspect ratio and nothing else. Nothing moved.

---

## What is in Sanity

**Twenty-nine document types, 141 documents.**

| | |
|---|---|
| Pages | 14 singletons, one per page of the site — see the list below |
| Collections | `practiceArea` 32 · `locationPage` 32 · `blogPost` 16 · `testimonial` 14 · `video` 9 · `faq` 9 · `award` 7 |
| Site Settings | `firmDetails` · `attorney` · `consultForm` · `caseEvaluationForm` · `whatDrivesUs` · `awardsBand` · `testimonialsBand` · `statsBand` |

Pages, all 14: `homePage` · `aboutPage` · `practiceAreasPage` · `blogPage` ·
`testimonialsPage` · `contactPage` · `faqPage` · `videoCenterPage` ·
`hiringGuidePage` · `clientPortalPage` · `privacyPolicyPage` · `sitemapPage` ·
`thankYouPage` · `notFoundPage`.

Four collections are drag-ordered in the Studio — `testimonial`, `award`, `faq`
and `video`. Nothing about those documents would reproduce their order, and for
the videos the order is load-bearing twice over (below).

The Studio desk is three folders — **Pages**, **Collections**, **Site Settings**
— with a catch-all so a new type is never silently orphaned, and singletons
filtered out of the global ＋Create menu.

---

## Where we are — phases 0–5 done

- **0 Foundations.** Baseline frozen, both proof tools built, TypeGen wired,
  `blockContent` and `seo` object types, `getFirmDetails()` cache made
  PROD-only. Zero pages changed.
- **1 `testimonial`.** The pilot. Byte-identical.
- **2 `practiceArea` + `locationPage`.** The big one — 64 pages, all the equity.
- **3 `blogPost`.** 16 posts, artwork uploaded to Sanity.
- **4a `consultForm`.** The consultation section, on 93 of 95 pages.
- **4b `caseEvaluationForm` + `attorney`.** The sidebar card on 85 pages, and
  Papa's record. His **Title** ("Founding Attorney") drives all five components
  that show it — the article byline plus the four marketing spots on the
  homepage and `/about-us/` — so retitling him in the Studio moves every one.
  His **name** is still literal in three of those four, deliberately: the
  question was asked and scoped to the title.
- **4c `whatDrivesUs`, `awardsBand` + `award`, `faq`, `video`.** The band on 8
  pages (byte-identical), the strip on 3, the nine questions on 2, the nine
  videos on 2. Four surfaces gained images in Sanity — 7 badges and 13 posters —
  so those four pages differ from the frozen baseline only by CDN image URLs.
- **5 The 14 page singletons.** Every page's own eyebrows, headings, leads,
  CTA labels, stat figures and card copy. Almost all of it landed
  byte-identical; the differences are entity escaping and inline-`<style>`
  boundaries, both listed above.

  Two things came out of this phase that outlive it. The **record-versus-page**
  rule below was broken twice — Success Stories inside `homePage`, By the
  Numbers inside `aboutPage` — so it is now `npm run check:page-copy` rather
  than a paragraph. And two pages are **Portable Text** while twelve are plain
  strings, which is a deliberate split, not an inconsistency.

## What is left

- **Phase 6** — Studio polish: icon audit, previews, field descriptions naming
  the desk path an editor sees, warning-only length caps. One known starting
  point: `blockquote` is on two rows, the `testimonial` collection and the
  Success Stories band. Everything else is distinct — 31 glyphs across
  32 rows — and `@sanity/icons` has 236, so there is room.
- **Phase 7** — retire the old layer. Delete `src/content/` and
  `src/content.config.ts`, move the three scrapers to `scripts/legacy-scrapers/`,
  add the Sanity publish webhook → Vercel deploy hook. **The old layer is
  already unused**: nothing under `src/` imports `astro:content`, and the only
  mentions of `getCollection` are three comments explaining why the query layers
  mimic its shape. So this is a deletion and a webhook, not a migration.

Then `/new-seo-setup` for sitemap, robots, redirects and the JSON-LD builders.

---

## Decisions made — don't relitigate

- **A field that nothing reads must not exist — and a field that exists must
  reach every surface that shows it.** The `attorney` type shipped with a `photo`
  and a `rating` that no component consumed: an editor could upload a headshot,
  publish, and watch the site not change. That looks like a broken CMS and the
  only way to learn otherwise is to read the code. The second half of the rule
  is the one that bit later: `role` was modelled and wired to the byline while
  four marketing spots kept their own hardcoded copy, so a retitle would have
  moved 85 pages and left the homepage and `/about-us/` disagreeing — the exact
  drift the field was added to end, rebuilt with a CMS behind half of it. The
  type's header lists every field against its consumers so both halves stay
  checkable.
- **Reordering the videos now moves their posters, and it did not before.**
  The nine grid tiles are cut from six shoots, so three photographs appear
  twice, and the old arrays kept posters POSITIONAL while ordering the videos
  editorially — the two were allowed to disagree, and when "About The Dieye
  Firm" moved to the front the videos swapped and the posters stayed put. A
  poster travelling on its video document is the only model an editor can add
  a tenth video to, so that trick is gone. A reorder is now a design decision:
  check the repeated pairs still separate at 1000px and 650px. The working is
  in `VideoGrid.astro` and the schema header.
- **The homepage carousel has its own order, not a filter of the grid's.**
  `reelOrder` numbers it; `orderRank` orders the grid. They genuinely differ
  (the carousel's first video is the grid's fifth), because four portrait
  posters cover six slides and no repeat may land twice in one view.
- **Wistia is asked for the runtime, never for a title, and never at runtime.**
  Durations come from oEmbed at build time and are not fields — a typed-in
  runtime goes stale the first time a video is re-cut and looks right while it
  does. The API's own titles carry em dashes, emoji and hashtags, so titles are
  ours. `src/sanity/videos.ts` asks once per video per build; the two
  components used to ask about the six shorts twice.
- **The three value icons are a picker, not an upload.** They are inlined SVGs
  taking their colour from the card through `currentColor`; an uploaded file
  arrives as an `<img>` and loses it. Adding a fourth glyph is a code change,
  which is honest — someone has to draw it.
- **Record or page copy: count the pages the FIELDS reach, not the pages the
  component does.** More than one, it is a record in Site Settings; exactly one,
  it belongs to that page's document. The refinement is not academic — it is
  what separates the two components that render on two pages each. Success
  Stories renders identically on the homepage and `/about-us/`, so it is a
  record. The FAQ section renders on the homepage and `/faq/`, but `/faq/`
  passes `head={false}` and its own nine questions, so the eyebrow and heading
  modelled on `homePage` really do appear once.
  This is why the homepage document has no awards heading (3 pages), no
  consultation copy (93), no What Drives Us (8), and no attorney name or phone
  number (facts about the firm, not the page). Two documents describing one line
  disagree eventually and the page picks one. The rule is written into the
  `homePage` header, which is the file every other page document was copied
  from, and enforced by `npm run check:page-copy`.
- **Portable Text only where a sentence carries markup.** Thirteen of the
  fourteen page documents hold plain strings, because their copy is plain. The
  privacy policy and the hiring guide hold `blockContent`, because bold and
  links sit INSIDE their sentences and a string field would mean an editor
  hand-typing `<strong>` and `<a href>` on a legal page and on the one page
  whose job is cross-linking. Do not convert the other twelve to rich text to
  be consistent; a rich-text box for a button label is worse than a string.
- **Headings stay OUT of the rich text on those two pages.** A Portable Text
  heading renders through `ProseHeading`, which stamps an id on every one —
  right for an article body an anchor might point into, wrong for eight
  headings that never had ids. Each section keeps its heading as a plain string
  beside its body.
- **The line between editable and chrome.** Editable is what a reader perceives
  as the firm's voice — headings, leads, body copy, pull-quotes, CTA labels,
  stat figures, alt text carrying factual claims. Chrome stays in code: `Read
  More`, `Load More Posts`, form labels and placeholders, `aria-label`s, the
  lead-form validation strings. The consultation section was built with all
  fourteen labels modelled and they were removed for exactly this reason.
- **Accent headings are `{lead, accent}` strings, never rich text.** All 22 of
  them carry an inline `<em>` styled by a *scoped* rule, and every one is
  modelled this way. Rendered through Portable Text the `<em>` would lose its
  scope hash and the gold italic would silently turn black — on 92 pages for the
  consultation section alone. Some also carry a `tail`, for an italic that sits
  mid-sentence; `tail()` in `src/sanity/aboutPage.ts` decides the spacing so the
  Studio field can be trimmed safely.
- **`slug` is the full path; `parent` is nav-only.** Eight practice areas are
  deliberately re-parented for the sidebar while keeping flat URLs. Deriving the
  path from the parent would move eight pages that carry live equity.
- **Query layers mimic the Astro content-entry shape** (`{ id, data: {…} }`).
  That is why `TreeNav`, both sidebars and the ten helpers in `blog.ts` needed
  no edits across 33 routes — which is what made "the menu is identical"
  provable rather than argued.
- **The two FAQ wordings live on ONE document.** `answer` is the client's
  published answer, verbatim; `shortAnswer` is ours, condensed, for the
  homepage, which cannot hold 136 words. `showOnHomepage` picks the six. Two
  collections would have let someone edit one wording believing they had edited
  both; one document with two fields makes the pairing visible. AGENTS.md
  forbids unifying them and the schema header says why.
- **`/sitemap/`'s rows stay DERIVED.** Only its header is modelled. Every row
  comes from the collections and from `firmDetails`, so the list maintains
  itself; modelling it would replace something always right with something that
  goes stale the first time a page is added. Its standfirst carries a `{count}`
  token for the same reason — a number an editor can type is a number that can
  disagree with the list beneath it.
- **Categories stay slug strings.** Their slugs are baked into the index's
  client-side filter, into CSS `FilterBoot` generates per slug, and into each
  card's `data-cats`. Documents would ripple through eight components to make
  four labels editable that derive cleanly from their slugs. The schema
  constrains the four; `categoryLabel` title-cases anything new.
- **The blog placeholder is the *absence* of artwork.** Six posts named the
  firm's generic graphic as their image; those import with no image at all, so
  the field means what it says. Its alt is `""` — it is decorative and the card's
  link text is already the headline.
- **Papa is "Founding Attorney" everywhere.** The site said that on 2 pages and
  "Principal & Founder" on 85. Resolved at Rhan's direction 2026-08-18; the
  byline changed on 85 pages, and the four marketing spots were wired to the
  same field on 2026-08-19.
- **The Google rating is deliberately NOT editable.** "5.0" and "Over 150
  five-star Google reviews" render on one page and are hardcoded in `MeetPapa`.
  They were modelled as fields for one commit and removed at Rhan's direction:
  a collapsed object holding two strings was more Studio furniture than it was
  worth. The reasoning lives in commit `bd0cf9b` and nowhere else — the schema
  header is a record of fields, and this is not one — so someone modelling that
  page may well propose adding it back.
- **`attorney` is a singleton.** Built as a collection first, which gave an
  editor a one-row list and a ＋ that could spawn a second Papa nobody would see.
  If the firm hires, it becomes a collection again — with the real question that
  raises, which is whose byline goes on which article.

---

## Things that would surprise you

- **NEVER put a dot in a Sanity document id.** A `.` makes the id a PATH, and
  the public read grant covers root-level ids only — the same mechanism that
  hides `drafts.*`. `testimonial.01-kim` wrote fine, showed in the Studio,
  returned from the CLI, and was **invisible to the build**, which reads
  anonymously. Every diagnostic pointed at the write having worked, because it
  had. Hyphens throughout. `scripts/import/lib/wait-for-public.ts` now ends every
  import by polling the *unauthenticated* endpoint.
- **`npm run build` cannot catch a Studio dependency break.** Vite's
  dep-pre-bundle is a dev-only step. `@sanity/orderable-document-list` is pinned
  **exactly** (2.0.12, with an `overrides` entry holding `sanity-plugin-utils` at
  2.0.10) because a caret let it float to a version needing `@sanity/ui` 4 while
  this repo is on 3.3.6 — `astro dev` failed and `/admin` went blank while every
  build stayed green. Those pins are wrong for a project on `sanity` ≥ 6.10.
- **`@sanity/icons` v5 dropped the NAMED root exports, not the `icons` map.**
  `import { HomeIcon } from "@sanity/icons"` is `undefined`; `icons["master-detail"]`
  works. `structure.ts` uses the map (25 glyphs, one import), schema files use
  the per-icon subpath (`@sanity/icons/Home`). Both correct; don't unify them.
- **The bytes on the page are not the bytes in the file.** Astro passes
  `smartPunctuation` to satteri, so `accuser's` renders `accuser’s`, `"x"` renders
  `“x”` and `--` renders `–`. `markdownToHast` applies none of it on its own.
  Importing raw text would have put straight quotes into Sanity and visibly
  changed hundreds of paragraphs with the build green.
- **Astro 7 has no remark or rehype** — markdown goes through `satteri`, via
  `@astrojs/markdown-satteri`. Heading ids come from `github-slugger`, one
  Slugger per document. `src/components/prose/headingIds.ts` reproduces it.
- **`ProseBody.astro` emits no wrapper `<div>`, deliberately.** The caller keeps
  its own `<div class="prose pa__body">`. Moving it inside would strip the page's
  scope hash and take the 18px type size with it, silently, on 32 pages.
- **A running dev server never sees a Sanity content edit — unless the helper
  skips its cache.** Every fetch helper takes the `if (import.meta.env.PROD)`
  form for this reason. `getFirmDetails()` was converted in phase 0.
- **An import that asserts with the SAME regex it parses with cannot fail.**
  The privacy policy's list items were dropped silently because the multi-line
  `ul:` block did not match a one-line regex; the count check used that same
  regex, so it agreed with itself. The fixed check counts the source's own
  markers independently, and the real proof is still the byte-diff after the
  build.
- **`scripts/import/home-page.ts` REPLACES the whole homepage document.** It is
  phase 2's, it sets the two reference fields, and since phase 5 it would delete
  eleven sections of copy if anyone re-ran it. Phase 5's is a separate file —
  `home-page-copy.ts` — and it PATCHES with dotted paths so the references
  survive. Both scripts now say so at the top. This was found the hard way: the
  phase-5 script was written to the phase-2 filename and overwrote it.
- **Moving prose into `ProseBody` takes the page's scope hash off its `<p>`
  tags.** That is fine when the page's scoped rule targets the WRAPPER — both
  prose pages set `.pp__body`/`.cfa__body { font-size: 18px }` on the div, which
  is still in the page's own template, and the paragraphs inherit. It would NOT
  be fine for a rule like `.pp__body p { … }`, which would silently stop
  matching. The byte-diff cannot tell those two apart, so check computed styles
  on the page — that is what `scripts/checks/prose-styles.js` is for.
- **A DEFAULT PROP hides page copy from the check.** `/blog/`'s kicker lived as
  `eyebrow = "News & Insights"` in `BlogHeader`, which /faq/ and /video-center/
  also render. `check:page-copy` reads imports, not defaults, so it saw nothing.
  When a shared component carries a default that only one caller uses, that
  default is that caller's copy — make the prop required.
- **A section that renders on several pages is NOT page copy**, and the miss is
  easy — it happened twice. Success Stories sat in `homePage` until `/about-us/`
  surfaced it; By the Numbers sat in `aboutPage` until `/practice-areas/` did.
  Both times the page being migrated looked self-contained, because the
  component that gave it away was imported by a page nobody was reading. That is
  not something a person reliably remembers to check, so it is
  `npm run check:page-copy` now. Run it BEFORE modelling, not after.
- **`npm run typegen` is not `npx sanity typegen generate`.** The npm script
  runs `sanity schema extract` FIRST. Running the generate step alone
  regenerates the file from a stale schema snapshot and silently omits every new
  type while printing a success line — five types were missing from
  `sanity.types.ts` that way and the build stayed green, because nothing in the
  build reads it.
- **`@sanity/icons` has no trophy.** There are 236 glyphs in the map and the
  obvious name for an awards band is not among them; `sanity.icons` also drops
  named root exports, so a wrong guess is `undefined` rather than an error.
  Check with `node -e "import('@sanity/icons').then(m => console.log(m.icons))"`
  before using one. The awards band uses `diamond`.
- **`/admin` needs a hard reload after every schema change.** Vite re-optimises
  deps and the browser holds a stale module. The server is fine; the tab isn't.
- **`sanity documents get` can show a document mid-write.** It reported the
  attorney with no photo seconds after a patch; a GROQ query on both read paths
  showed the photo present. Trust the query.
- **The checks run against a BUILT site, not the dev server**, each with its own
  `--url`. Serve `dist/` with `python3 -m http.server` — `npx serve -s dist`
  silently returns the homepage for any path.
- **npm's PATH shimming can clobber `wc`, `tr` and `head` inside a shell loop.**
  Use `/usr/bin/python3` for anything counting or slicing.

---

## Waiting on Rhan

1. **The lead form still has no endpoint.** `lead-form.ts` cancels submission and
   confirms inline, so `/thank-you/` is unreachable. Unchanged for weeks and
   still the only thing between the site and a real enquiry.
2. **`/thank-you/` says nothing about what happens next** — no response time, no
   "call us if it's urgent". The wording is a commitment on the firm's behalf.
3. **Confirm the MyCase subdomain split** — `dieylaw` vs `dieyelaw`. Both work;
   flagging because one looks like a typo and it controls an OAuth callback.
   Both links are now fields on `clientPortalPage`, one under the other, which
   is what makes them comparable at a glance.
4. **Should the homepage keep its `FAQPage` JSON-LD now that `/faq/` exists?**
5. **The nine FAQ questions are `<summary>` text, not headings**, so a screen
   reader navigating by heading skips all nine.
6. **`VideoObject` markup needs data only the firm has** — upload date, a
   one-line description per video, and ideally a real frame as the thumbnail.
7. **The videos and awards can now be reordered in the Studio, with a catch.**
   Dragging a video moves its poster with it, and the grid's order exists to
   keep three repeated photographs apart at three column counts. It is worth
   knowing before the first reorder; the schema field descriptions say so where
   an editor will see them.
8. **The `/testimonials/` video tile is still a placeholder** — stock-photo
   poster, generic label. The poster question was closed 2026-08-18; the label
   was not.
9. **Authored strings with no comp behind them**, now editable rather than
   buried: `/client-portal/` in full, `/sitemap/`'s and `/faq/`'s kickers and
   decks, and the 404's copy. Phase 5 moved them into the Studio; whether the
   wording is what the firm wants is still an open question. The page TITLES and
   META DESCRIPTIONS in that list are the exception — they are still hardcoded
   in the page files, because the SEO tab that should hold them is not wired.
10. **26 of 32 practice areas and 26 of 32 location pages close with a "come talk
   to us" section.** Kept deliberately — six end on real content that must
   survive. Trivial to strip later, impossible to recover if dropped.
11. **FAQ answers were flattened by the scrape, not by this migration.** Their
    paragraph structure is not recoverable from the markdown. Modelling `answer`
    as Portable Text does not fix it — but it turns the fix from a component
    change on 64 routes into a re-import of 140 field values.
12. **The source FAQ headings on the practice-area pages are more specific than
    the rendered one.** A `faqsHeading` field would fix it.
13. **`modifications-enforcement` is 290 words**, the thinnest practice area and
    the only one where the sidebar overhangs the article.
14. **The August blog post is categorised by us, not the client**, and still has
    no artwork.
15. **Two near-duplicate blog posts** — `understanding-child-custody-laws`
    (2025-01) and `understanding-child-custody-laws-in-pearland-texas` (2026-07).

---

## Manual steps before launch

1. **Sanity → Vercel publish webhook.** None exists (`sanity hook list` is
   empty). Needs a Vercel Deploy Hook, then a Sanity webhook pointed at it with
   the drafts toggle **off** so only publishes rebuild.
2. **CORS for the production domain.** `http://localhost:4321` and
   `https://the-dieye-firm.vercel.app` are allowed; `www.dieyelaw.com` gets
   added at launch.
3. **`robots.txt` and `sitemap.xml` still do not exist.** Deferred to
   `/new-seo-setup`, which builds them properly alongside editor-managed
   redirects. It must not ship without them.

---

## Known issues

- **`WhatDrivesUs` reflows on font swap** — "Direct, Personal Attention" goes
  from one line to two when the real face loads, a 30px shift, on 8 pages. A CLS
  hit worth fixing before launch. The interior `h1` reflow is the same class of
  problem and is sitewide.
- **The office map is a bare Google embed on 92 pages**, loading at parse time
  and setting third-party cookies sitewide. The last holdout of the
  click-to-load rule.
- **The SEO tab is dead on all 14 page singletons.** Every page document has
  one and nothing reads any of them — an editor can fill in a meta title and
  watch the page not change, which is the exact failure the attorney's `photo`
  and `rating` were removed for. They are reserved for `/new-seo-setup`, which
  wires them alongside sitemap, robots and the JSON-LD builders. Either bring
  that pass forward or drop the tabs until it lands; leaving them is the one
  place this migration knowingly breaks its own rule, and it is now 14 places
  rather than 2.
- **`og:image` is on 16 of 95 pages.** Better solved by the SEO pass, where a
  per-page image field and a sitewide default supply it.
- **10 pages skip a heading level** (h1 → h3): 8 practice areas, one location
  page, and `/contact-us/`. The practice-area ones come from the client's own
  scraped headings; `/contact-us/` is ours and is the one to fix by hand.
- **No location page carries an image.** The 32 are text and chrome only.
- **The `/practice-areas/` hero is 1247×741**, so it upscales ~1.5× at 1920.
  Rhan chose the image knowing this.
