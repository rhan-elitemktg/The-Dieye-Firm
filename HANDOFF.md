# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-17, on the `location_pages` branch._

---

## Start here

**The service areas are built.** 32 location pages across four areas, ingested
from the live site. That was the largest unbuilt thing and the last group with
dangling nav links — every Service Areas link now resolves, and so do the four
in-copy links to `/harris-county-family-law-attorney/…` that had been 404ing
inside shipped practice-area and blog content.

**What's left, in order:**

- **Wire the lead form to an endpoint.** `/thank-you/` has been built and
  unreachable for three sessions. This is now the only thing between the site
  and taking a real enquiry.
- **`/faq/` and `/video-center/`**, to fill the Resources flyout. Both are real
  sections of the live site, and both are still in the nav pointing at 404s.

---

## Where we are

Branch `location_pages`, cut from `master` at `e71bff2` (PR #26 merged). Four
commits, nothing uncommitted. **Not pushed; no PR open.**

Build passes at **89 pages** (was 57).

The four commits are individually revertable and each carries its own proof:

1. `Extract the sidebar tree menu out of FamilyLawNav`
2. `Lift the shared scraper machinery into scripts/lib/html.mjs`
3. `Ingest the 32 location pages` — content only, build still 57
4. `Render the 32 location pages` — build 57 → 89

Commits 1 and 2 are shared infrastructure with no content in them and both are
proven no-ops. **They would make a clean separate PR against `master`**, with
`location_pages` rebased on top — which is a better answer to the
branch-granularity question than carrying them here.

---

## What landed this session

### 1. The location pages — 32 of them, ~41,400 source words

Four service areas: Harris County (5), League City (5), Pasadena (7), Sugar
Land (15). One route at `src/pages/[...slug].astro`, the same interior template
as the practice areas, and a `locations` collection whose file path is the
route.

**The sidebar menu is scoped to one location** — the thing Rhan asked for. A
Sugar Land page lists Sugar Land's 14 pages and zero `/family-law/` links.

### 2. Two extractions, both proved before anything used them

`TreeNav` (the expand/collapse menu) and `scripts/lib/html.mjs` (the shared
parsing kit). Each would otherwise have been hand-copied a second and third
time. See **Verified** below.

### 3. `AreasWeServe` marks the current location

Optional `current` prop; that row renders as text rather than a link. Additive,
so the 33 routes that pass nothing are unchanged.

### 4. The nav learned about the two Pasadena orphans

`activeUnder` takes a list now, and the extra prefixes are **derived from the
collection** rather than typed out, so a future stray page needs no nav edit.

---

## Decisions made — don't relitigate

- **No `/service-areas/` index.** Rhan's call. The flyout parent pointed at the
  first area as a workaround for a 404; that workaround is simply correct now.
  An index would be a brand-new URL with no equity, no comp and copy that would
  have to be written. **The location root's hrefless kicker is the one line
  that changes** if it is ever built.
- **The sidebar card stays titled "Practice Areas"**, scoped silently, linking
  to the location root. Rhan's call over naming it after the city. Two cards on
  the site therefore share a title and mean different scopes; safe only because
  they never appear on the same page.
- **The FAQs were lifted into `faqs` frontmatter**, heading-based, so they
  render as real markup with real `FAQPage` JSON-LD. 29 of 32 pages, 135
  questions, 100% ending in "?". Every question is printed in the run for audit.
- **No redirect for `/sugar-land-family-law/`**, and this is a change from the
  plan. It is **not in the sitemap**, which is `AGENTS.md`'s test for equity —
  the live host happening to 301 it is not the same thing. The scraper rewrites
  those links to canonical and reports them. Two lines to add later if Search
  Console shows real external inbound links.
- **`/pasadena-family-law-attorney/pasadena-divorce-attorney/` keeps its
  redundant path.** It *is* in the sitemap, so it is an asset; normalising it
  would be a 301 for no gain. Only the label is shortened, to "Divorce".
- **`location` is a real frontmatter field, not derived from the URL.** Same
  rule and same reason as `parent` on the practice areas: deriving works for 30
  and needs a special case for the 2 Pasadena orphans, which puts the truth in
  two places.
- **The root catch-all route is safe because the build is static.** Astro emits
  only what `getStaticPaths` declares, so shadowing is not the failure mode
  available. A silent path *collision* is, and `RESERVED` turns it into a build
  error. `/admin` is in that list and is not a file in `src/pages/`.
- **`TreeNav` keeps the `fl__` class names and the `pa-` hooks.** They read
  "family law" / "practice area" and the machinery is section-neutral now, but
  keeping them made the extraction emit byte-identical HTML, so it could be
  proved rather than argued. Renaming is a separate provable change.
- **`normaliseHeadings`, `stripCtas`, `rewriteLinks` and the page extractors
  stayed OUT of the shared lib.** They look shared and have all diverged for
  real reasons — the blog promotes bold paragraphs to headings because one 2022
  post has no outline; these pages walk six trailing paragraphs, not three.
  Folding them behind flags would hide the differences.
- **13 editorial deviations**, keyed by slug in `scrape-locations.mjs` and
  listed in its header: "Pasadena, CA" on a Texas page, one phone number
  mid-sentence in an FAQ answer, and eleven places where "Lawyer" carries a
  plural verb or stands with no article. The test is narrow and deliberate —
  grammatical breakage, never voice. Plenty that merely reads oddly was left
  alone. The run **throws if a declared fix stops matching**, so a client edit
  surfaces rather than the deviation lapsing.
- **The "come talk to us" closers were kept**, on 26 of the 32. They are `h2`
  sections rather than CTA paragraphs, which is the same call already made for
  the practice areas.

---

## Verified

**The `TreeNav` extraction is a no-op**, measured against a `dist/` snapshot
taken before the edit — wider than the 33 routes that render the menu:

- HTML, **all 57 built pages: 0 differ** after normalising scope hashes.
- CSS declarations, whole build: **2105 / 2105 identical**, none added or lost.

**The `scripts/lib/html.mjs` extraction is a byte-level no-op**: both existing
scrapers re-run off their caches, `git diff src/content/` **empty**. (After
re-running `add-takeaways.mjs` — a blog re-scrape wipes `keyTakeaways`, which
is pre-existing and now called out in `AGENTS.md`.)

**The location pages**, all measured against a static server of `dist/` rather
than the dev server:

- Build **89 pages**. The 57 pre-existing differ only by the intended
  `class="aws__row"`; CSS loses exactly the 3 renamed selectors and gains their
  replacements plus `.is-current`, `.loc__body`, `.ls`.
- **Every internal href in all 89 pages resolves to a built file**, leaving only
  the pre-existing danglers listed below.
- **Menu scope: 0 `/family-law/` links** on a location page; the practice-area
  menu still 32 links headed by `/practice-areas/`.
- Sidebar state: root 12 rows / 0 open / 0 active · grandchild 12 / 1 / 1 ·
  Pasadena orphan 4 / 0 / 1. Toggles all bound, `data-pa-boot` present.
- **No overflow, no duplicate ids, no orphaned labels** on 6 routes ×
  1920 / 1441 / 1440 / 1000 / 768 / 650 / 430.
- `blog-forms.js` **19/19** on a location page and on the practice-area control.
- JSON-LD correct and branching: `LegalService` on a root, `Service` on a child,
  `areaServed` naming that one place. Canonicals and titles correct.
- Zero console errors, zero broken images.
- **Nav row still 694px at 1600**, so the 1160px collapse measurement is
  untouched. All 32 location pages light up "Service Areas", including the two
  orphans; no regression on About / Practice Areas / Blog.

**Scraper run:** coverage 83–98% on all 32 · phone numbers remaining: none ·
Scorpion template tokens: none · link targets outside the route map: none ·
container shapes `ContentZone` ×30, `ContentS4` ×2 · root-level `-attorney`
paths no location claimed: none · all 13 copy fixes matched.

---

## Things that would surprise you

- **`ColumnContentExpand_1..8` on a location page is not a container.** Those
  ids sit on `<a>` and `<span>` elements inside the CTA phone links, carrying
  Scorpion's `{F:P:Cookie:…}` replacement tokens. They read exactly like the
  practice areas' second container and are nothing of the kind — a guard
  written against them is inert. `scrape-locations.mjs` measures the content
  wrapper against `#MainContent` instead, which catches a shape nobody has seen.
- **Alignment is not the CTA signature; `txt-hlt` is.** 62 of the 65 phone-plug
  paragraphs are centred, one is `text-align:right` — and matching on alignment
  left that one mid-body complete with a raw template token in its href. But a
  rule keyed on the `tel:` link alone is too broad: it also takes two real FAQ
  answers. `class="txt-hlt"` OR centred takes exactly the 63 that are chrome.
- **Coverage that excludes the FAQ reads like data loss.** Lifting ~24 FAQs into
  frontmatter dropped the first run's numbers to 39–68% while nothing was
  actually lost. The FAQ words come out of the same `#MainContent` the source
  total is measured on, so they belong in the numerator.
- **`RESERVED` at module scope fails.** Astro builds `getStaticPaths` into its
  own prerender chunk, where a module-level const is not defined — it throws
  "RESERVED is not defined" at build time. Declare it inside the function.
- **`#ContentS4` is a `<section>`, not a `<div>`.** A wrapper check that assumes
  `<div>` finds nothing on the two Harris County pages that use it.
- **A dev server started before `content.config.ts` changed cannot serve a new
  collection** — every new route 404s until it restarts. Serving `dist/` on
  another port is the better move anyway, and is what `AGENTS.md` already
  recommends for scoped-CSS staleness.
- **The interior `h1` reflows on font swap**, ~58px at 1440. It is **not new** —
  `/family-law/divorce/` and `/about-us/choosing-a-family-law-attorney/` do the
  same. Same class as the `WhatDrivesUs` issue below; the location pages inherit
  it rather than introduce it.
- **`sed -E` on macOS does not support `\b`.** A normalisation using it fails
  silently and every route "differs". Cost half an hour once; don't repeat it.
- **`zsh` does not word-split unquoted variables.** `cmd $routes` passes one
  giant argument. Use an array.
- **`/family-law/` is a content page and `/practice-areas/` is the index.** The
  reverse is the intuitive guess and it is wrong. `locations` versus
  `firmDetails.serviceAreas` is the same trap: 32 pages versus 4 nav entries.
- **`npm run shot` and `npm run probe` force lazy images to load**, so a probe
  reports every image as `loading="eager"`. Check `dist/` for the truth.
- **`npm run shot` names its file by selector and width**, so two shots of the
  same selector overwrite each other. Pass `--out`.
- **The headless lib drops CDP events**, so there is no console-error check in
  `scripts/checks/`. Inject a collector via
  `Page.addScriptToEvaluateOnNewDocument` before `goto`.
- **`CLAUDE.md` is a symlink to `AGENTS.md`.** Edit `AGENTS.md`.
- **Rhan runs the dev server from his IDE.** Check 4321 before starting a second.

---

## Waiting on Rhan

1. **The lead form still has no endpoint.** `lead-form.ts` cancels submission
   and confirms inline, so `/thank-you/` is unreachable. When it lands, the
   form action points there.
2. **`/thank-you/` says nothing about what happens next** — no response time,
   no "call us if it's urgent". The wording is a commitment on the firm's
   behalf.
3. **Three errors are still live on dieyelaw.com** and worth telling the firm
   so their current site gets fixed too: the "Lawyer" singular-for-plural typo
   (eleven places across the location pages, plus the two on
   `/about-us/choosing-a-family-law-attorney/`), **"Pasadena, CA" on a Texas
   page**, and a raw Scorpion `{F:P:Cookie:PPCP1/…}` template token rendering
   inside the League City mediation page's CTA.
4. **Authored strings with no comp behind them** — page title and meta
   description on `/thank-you/`, `/testimonials/`, `/contact-us/`,
   `/about-us/choosing-a-family-law-attorney/`, and the A–Z section head on
   `/practice-areas/`.
5. **A real client video testimonial.** The `/testimonials/` tile is wired to
   `z79lx3x00o` — the firm's own "About Us" reel, the same id `home/About.astro`
   plays — as a stand-in. Its poster is a stock portrait of nobody connected to
   the firm, so the tile is deliberately **un-attributed**. Swap the id, the
   poster and add a name together.
6. **The two CMS-truncated reviews.** Larry's and the "Honest, Sincere" review
   end mid-word in the firm's own CMS. Each is cut back to its last complete
   sentence in `ReviewWall.astro`. **The tails are not recoverable from the live
   site; ask the firm for the originals.**
7. **26 of the 32 practice-area pages and 26 of the 32 location pages close with
   a "come talk to us" section**, on top of the sidebar form and the sitewide
   Contact section. Kept deliberately, because on the practice areas it is
   **not** a blanket strip — six end on real content that must survive:
   Commonly Asked Questions · Frequently Asked Questions · How Mediation Can
   Save Time and Reduce Costs · How a Divorce Modification Is Filed in Texas ·
   Parental Rights Cases in Harris County Family Court · Visitation Rights for
   Unmarried Parents in Pearland. Trivial to strip later, impossible to recover
   if dropped now.
8. **FAQ answers flatten to one paragraph.** `PracticeAreaFaqs` renders
   `<p>{answer}</p>`, so a multi-paragraph source answer joins with a space —
   14 pages, ~37 answers, all listed in the scraper run. Fixable, but it means
   changing a component 64 routes render, so it was kept out of this branch.
9. **The source FAQ headings are more specific than the rendered one.** Five
   pages say "Frequently Asked Questions About Divorce in Harris County" and
   render the component's generic title. A `faqsHeading` field would fix it.
10. **`modifications-enforcement` is 290 words**, the thinnest practice area and
    the only one where the sidebar overhangs the article.
11. **Key Takeaways still need attorney review before launch** —
    `scripts/add-takeaways.mjs`.
12. **The August blog post is categorised by us, not the client**
    (`child-custody` via `CATEGORY_OVERRIDES`) and still has no artwork.
13. **Two near-duplicate blog posts** — `understanding-child-custody-laws`
    (2025-01) and `understanding-child-custody-laws-in-pearland-texas`
    (2026-07).
14. **Should commits 1–2 be their own PR?** They are shared infrastructure,
    proven no-ops, with no content in them. See *Where we are*.

---

## Known issues

- **`WhatDrivesUs` reflows on font swap.** "Direct, Personal Attention" goes
  from one line to two when the real face loads, a 30px shift, on five pages.
  A CLS hit worth fixing before launch. The interior `h1` reflow noted above is
  the same class of problem and is sitewide, not specific to any one page.
- **`/about-us/` passes no `canonical`.** It and `/` are the only two built
  pages that don't. One-line fix.
- **`/about-us/` and `/blog/` carry no JSON-LD at all.** Only `/thank-you/`'s
  absence was deliberate. `/about-us/` is now the canonical entity page for
  Papa Dieye and has no `Person`/`Attorney` markup — worth adding.
- **`MeetPapa` advertises "500+ Families Helped" and "5.0 Stars"**, and
  `ByTheNumbers` "17+ Years". Those are claims on the firm's behalf, sitting on
  the page search traffic now lands on. If they came from the comp rather than
  from Papa, confirm before launch.
- **The `/practice-areas/` hero is 1247×741**, so it upscales about 1.5× across
  a full-bleed band at 1920. Rhan chose the image knowing this.
- **The office map is a bare Google embed**, on `/contact-us/` and on every
  content page via the shared section. It sets third-party cookies everywhere.
  `AGENTS.md` wants embeds behind a click-to-load facade; this one predates that
  rule and is the last holdout.
- **The testimonials video poster is a stock face.** Item 5 above, but it is on
  the one page whose job is credibility, so it should not reach launch.
- **No location page carries an image.** The 32 are text and chrome only. Fine
  for now — no comp exists and no artwork was supplied — but a location landing
  page with a photo of the courthouse or the city would not go amiss.

---

## Carry into the Sanity pass

**`InteriorShell`, `InteriorHeader` and `TreeNav` are the interior template.**
Anything modelled later that renders long-form copy with a rail should use them
rather than growing a third grid or a third menu.

**The `locations` collection wants a `locationPage` document type.** `location`
and `parent` both become references — each already stores the target's id
rather than a path, so the migration is a query and a map. The four
`firmDetails.serviceAreas` entries should become references to the four root
documents rather than free-text hrefs, which would also remove the
trailing-slash fragility that `AreasWeServe` and the route's `areaServed`
lookup both normalise around today.

**The 14 reviews want a `testimonial` document type** — `lead`, `body`, `name`,
`matter`, and an optional video reference so the tile stops being a hardcoded
constant. Already a flat array of plain objects in `ReviewWall.astro`. `matter`
is our categorisation, not the client's, and should become a reference to the
practice-area document.

**`/about-us/choosing-a-family-law-attorney/`'s copy is already Sanity-shaped**
— a named `sections` array of `{heading, paragraphs[]}`. It wants to become a
Portable Text body with the headings as real blocks; the four deviations at the
top of the file are the editorial record that should travel with it. The 13
deviations in `scrape-locations.mjs` are the same kind of record.

**The Google Maps CID is a constant in `firmDetails.ts`**, not a field on the
singleton. It should become one, so a second office or a re-verified listing
doesn't need a deploy.

**"Updated on" instead of "Posted on"** for blog posts, once editors can revise
one: an optional `updated` field, the card picking its label from it, and
`dateModified` in the `BlogPosting` JSON-LD. `AuthorCard` already takes an
optional date, so that switch is half-built. Both dates need `timeZone: "UTC"`.

**All three collections are already the shape Sanity needs.** `practiceArea`
wants `title` / `navLabel` / `subtitle` / `parent` / `faqs`, with parent/child
as a reference rather than a path. **Categories are still derived from posts**,
not modelled — `allCategories()` reads them off the archive and
`categoryLabel()`'s map is the seed data for a `category` type.

**`/contact-us/` reads everything factual from `firmDetails`** — phone, email,
address, hours, the map embed and link, the service areas in its JSON-LD. No
hardcoded NAP, so it needs no work in the sweep.

---

## Redirects in place

| From | To | Why |
|---|---|---|
| `/about-us/papa-dieye` + `/` | `/about-us/` | Bio moved up; live stub had no content |
| `/about-us/the-difference` + `/` | `/about-us/` | Folded into the bio page |
| 16 × `/blog/<year>/<month>/<truncated-slug>` | `/blog/<full-slug>/` | Scorpion cut slugs mid-word |

**Practice areas and location pages need none** — both sections' URLs match the
live site exactly. `/sugar-land-family-law/*` is deliberately absent; see
*Decisions*.

---

## Known dangling routes

| Link | Lives in | Lands with |
|---|---|---|
| `/faq/` | Resources flyout + footer | an FAQ page |
| `/video-center/` | Resources flyout + footer | a video page |
| `/client-portal` | Info bar | a third-party portal, or removal |
| `/privacy-policy/` | Footer | a privacy page |
| `/disclaimer/` | Footer | a disclaimer page |
| `/sitemap/` | Footer | an HTML sitemap, or point it at `/sitemap.xml` |
| `/videos/` | Homepage | almost certainly meant to be `/video-center/` |

The last four were always there and were not in this table before; a
whole-build sweep of every internal href found them. **Nothing else in the
build dangles** — all 32 Service Areas links and the four in-copy
`/harris-county-family-law-attorney/…` links now resolve.

Nothing links to `/thank-you/` yet, and that is correct — it is a form
destination, not a nav item.

All three scrapers print their own dangling list on every run.
