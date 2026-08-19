# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-19, on the `sanity_setup` branch._

---

## Start here

**The Sanity content-modelling pass is underway.** Phases 0–4b of eight are
committed on `sanity_setup`, 14 commits, working tree clean, build green at 95
pages. Every one of the 80 pages of ingested client prose now renders from
Sanity, plus the reviews, the consultation section, the sidebar enquiry card and
the attorney.

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

**And a third thing neither covers:** a scoped CSS rule that stops matching when
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

---

## What is in Sanity

**Nine document types, 95 documents.**

| | |
|---|---|
| Pages | `homePage` (grown one phase at a time — currently the About pull-quote and the six Success Stories picks) |
| Collections | `practiceArea` 32 · `locationPage` 32 · `blogPost` 16 · `testimonial` 14 |
| Site Settings | `firmDetails` · `attorney` · `consultForm` · `caseEvaluationForm` |

The Studio desk is three folders — **Pages**, **Collections**, **Site Settings**
— with a catch-all so a new type is never silently orphaned, and singletons
filtered out of the global ＋Create menu.

---

## Where we are — phases 0–4b done

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

## What is left

- **Phase 4 remainder** — `whatDrivesUs` (8 pages), the `award` collection and
  its band (3 pages), the `faq` collection (9), the `video` collection (9).
- **Phase 5** — the 14 page singletons. The most tedious phase and the least
  risky; this is where the 22 accent headings land.
- **Phase 6** — Studio polish: icon audit, previews, field descriptions naming
  the desk path an editor sees, warning-only length caps.
- **Phase 7** — retire the old layer. Delete `src/content/` and
  `src/content.config.ts`, move the three scrapers to `scripts/legacy-scrapers/`,
  add the Sanity publish webhook → Vercel deploy hook.

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
- **The line between editable and chrome.** Editable is what a reader perceives
  as the firm's voice — headings, leads, body copy, pull-quotes, CTA labels,
  stat figures, alt text carrying factual claims. Chrome stays in code: `Read
  More`, `Load More Posts`, form labels and placeholders, `aria-label`s, the
  lead-form validation strings. The consultation section was built with all
  fourteen labels modelled and they were removed for exactly this reason.
- **Accent headings are `{lead, accent}` strings, never rich text.** 22 headings
  carry an inline `<em>` styled by a *scoped* rule. Rendered through Portable
  Text the `<em>` loses its scope hash and the gold italic silently turns black —
  on 92 pages for the consultation section alone.
- **`slug` is the full path; `parent` is nav-only.** Eight practice areas are
  deliberately re-parented for the sidebar while keeping flat URLs. Deriving the
  path from the parent would move eight pages that carry live equity.
- **Query layers mimic the Astro content-entry shape** (`{ id, data: {…} }`).
  That is why `TreeNav`, both sidebars and the ten helpers in `blog.ts` needed
  no edits across 33 routes — which is what made "the menu is identical"
  provable rather than argued.
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
4. **Should the homepage keep its `FAQPage` JSON-LD now that `/faq/` exists?**
5. **The nine FAQ questions are `<summary>` text, not headings**, so a screen
   reader navigating by heading skips all nine.
6. **`VideoObject` markup needs data only the firm has** — upload date, a
   one-line description per video, and ideally a real frame as the thumbnail.
7. **The `/testimonials/` video tile is still a placeholder** — stock-photo
   poster, generic label. The poster question was closed 2026-08-18; the label
   was not.
8. **Authored strings with no comp behind them** — `/client-portal/` in full,
   `/sitemap/`'s and `/faq/`'s kickers and decks, the 404's copy, and the titles
   and meta descriptions on `/thank-you/`, `/testimonials/`, `/contact-us/` and
   `/about-us/choosing-a-family-law-attorney/`.
9. **26 of 32 practice areas and 26 of 32 location pages close with a "come talk
   to us" section.** Kept deliberately — six end on real content that must
   survive. Trivial to strip later, impossible to recover if dropped.
10. **FAQ answers were flattened by the scrape, not by this migration.** Their
    paragraph structure is not recoverable from the markdown. Modelling `answer`
    as Portable Text does not fix it — but it turns the fix from a component
    change on 64 routes into a re-import of 140 field values.
11. **The source FAQ headings on the practice-area pages are more specific than
    the rendered one.** A `faqsHeading` field would fix it.
12. **`modifications-enforcement` is 290 words**, the thinnest practice area and
    the only one where the sidebar overhangs the article.
13. **The August blog post is categorised by us, not the client**, and still has
    no artwork.
14. **Two near-duplicate blog posts** — `understanding-child-custody-laws`
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
- **`og:image` is on 16 of 95 pages.** Better solved by the SEO pass, where a
  per-page image field and a sitewide default supply it.
- **10 pages skip a heading level** (h1 → h3): 8 practice areas, one location
  page, and `/contact-us/`. The practice-area ones come from the client's own
  scraped headings; `/contact-us/` is ours and is the one to fix by hand.
- **No location page carries an image.** The 32 are text and chrome only.
- **The `/practice-areas/` hero is 1247×741**, so it upscales ~1.5× at 1920.
  Rhan chose the image knowing this.
