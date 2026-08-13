# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-13, end of session._

---

## Start here

**Next task: the Blog index (`/blog/`)** — starting in a fresh session, by
Rhan's call. It is the only thing standing between the blog and being
finished, and two links already point at routes it owns (see "Known dangling
routes"). Its comp uses a `bx-*` prefix with no overlap against the post's
`bp-*`, so the two templates are independent. `WhatDrivesUs` and the new
`src/components/blog/` cards are there to be reused.

**Before starting it:** `blog_post` needs to be merged, or branch from it
rather than from `master` — the Blog index depends on the content collection
and the sidebar card components that live on it.

---

## Where we are

Branch `blog_post`, **committed and pushed** (2 commits, tree clean), tracking
`origin/blog_post`. **No PR yet — Rhan is reviewing the diff first** and will
open it. `papa_dieye` merged to `master` as PR #16.

`/blog/[slug]/` is built and verified, and the whole 16-post archive is
ingested. Build passes, no broken images, no horizontal overflow at
1920 / 1440 / 1000 / 768 / 430, and the two-form behaviour check passes 19/19.

The homepage `Blog` section is no longer a placeholder — it reads the
collection and links to real posts.

---

## What landed this session

**The blog archive, ingested from the live site.** `npm run scrape:blog`
(`scripts/scrape-blog.mjs`) enumerates posts from `dieyelaw.com/sitemap.xml`,
caches fetches to the gitignored `.blog-cache/`, and writes 16 Markdown files
plus a redirect map. Re-runnable; delete the cache to force a refresh.

**The interior main+sidebar template**, documented in `AGENTS.md` and never
used until now. Three equal columns, article spans two, sidebar in flow (not
sticky), on a white page. This is what the 8 practice-area pages and the
service-area pages need.

**Reusable pieces the next templates get for free:** `SidebarCard`,
`CaseEvaluationCard`, `AuthorCard`, `PostSidebar`, `.prose` (finally
exercised), dynamic routing, and `src/scripts/lead-form.ts`.

**SEO on `Layout`:** optional `canonical` / `ogType` / `ogImage` props and a
`<slot name="head">`. `astro.config.mjs` now sets `site`. This is the minimum
a shareable page needs — the full editable layer is still a later
`/new-seo-setup` pass.

---

## Waiting on Rhan

1. **The Key Takeaways need attorney review before launch.** Every post has a
   four-bullet box, drafted extractively — each bullet restates something the
   post already says, and none introduces a legal claim the article doesn't
   make. They still summarise legal content. Wording lives in one place,
   `scripts/add-takeaways.mjs`, so review is a single file.
2. **The newest post has no artwork.** "How the 2025 Texas Fit Parent
   Presumption Affects Your Custody Rights" (2026-08-06) was published with no
   featured image — its JSON-LD points at the bare origin. It falls back to the
   firm's generic `blog-img.jpg`, which is only 436x235 and looks soft in the
   homepage featured slot. Needs real art.
3. **Confirm `site: "https://www.dieyelaw.com"`** in `astro.config.mjs`. It
   drives every canonical and `og:url`.
4. **Two near-duplicate posts** — `understanding-child-custody-laws` (2025-01)
   and `understanding-child-custody-laws-in-pearland-texas` (2026-07) cover the
   same ground. Worth a consolidation decision at some point; not urgent.
5. **The undesigned pages still need direction** — About Us index, Choosing a
   Family Law Attorney, The Difference, all 8 practice-area detail pages, the
   service-area pages. Unchanged from last session.
6. **Branch granularity** — one branch per page, or one per template group?
   Still unanswered.

---

## Carry into the Sanity pass

Deferred on purpose, and easy to lose if it isn't written down:

**"Updated on" instead of "Posted on".** The attribution card should switch its
label once a post has actually been revised. It stays "Posted on" today because
the ingested archive carries only a publish date, and labelling that as an
update date would assert something untrue.

What it needs, in order:

1. An `updated` field on the `post` document (optional), alongside `date`.
2. The card picks the label: `updated` present **and** later than `date` →
   "Updated on" + `updated`; otherwise "Posted on" + `date`. Both still need
   `timeZone: "UTC"` (see the date gotcha in `AGENTS.md`).
3. `BlogPosting` JSON-LD in `src/pages/blog/[slug].astro` gains `dateModified`
   — that is the half search engines actually read.

Worth knowing: the source pages already carry a `dateModified` in their
JSON-LD. `scripts/scrape-blog.mjs` doesn't capture it (it reads `datePublished`
only), so if the historical revision dates are wanted, that is a one-line
change plus a re-scrape — do it as part of the migration rather than now, so
the field arrives with the schema that uses it.

---

## Known dangling routes

Building interior pages hardest-first means some links point at routes that
don't exist yet. These are deliberate, not oversights:

| Link | Lives in | Lands with |
|---|---|---|
| `/blog/` | nav, homepage "View All" | Blog index — **next** |
| `/blog/categories/<slug>/` | sidebar Categories card, post kicker | Blog index |
| `/family-law/child-custody/relocation-case/` | in-body links | practice areas |
| `/family-law/child-custody/visitation-possession/` | in-body links | practice areas |
| `/family-law/grandparent-rights/` | in-body links | practice areas |
| `/family-law/mediation-vs-litigation/` | in-body links | practice areas |
| `/harris-county-family-law-attorney/` | in-body link | service areas |

The last five come from the scraped posts' own internal links, rewritten from
the old site's URLs onto our route map. **Worth a link audit once the interior
build is done** — the scraper prints this list on every run.

---

## Decisions made — don't relitigate

- **Blog URLs are flat** — `/blog/<slug>/`, re-slugged from each post's `h1`.
  The old Scorpion CMS hard-cut every slug at 48 characters *mid-word*
  (`...might-be-a-b`, `...work-in-tex`, `...adapting-to-life-c`), so preserving
  them would have made the truncation permanent. 16 generated 301s in
  `vercel.json` cover the old paths; all 16 verified against built routes.
- **Scrape the live site, not the mirror.** The mirror is a 2026-07-20 snapshot
  and was already missing the August post when we ingested.
- **Posts are bylined "The Dieye Firm"**, matching 13 of the 16 originals and
  the existing homepage constant. The sidebar card is therefore an *attorney*
  card introducing Papa, not an author card claiming he wrote the post.
- **Markdown now, Sanity later.** The collection schema is the shape a `post`
  document will return. Modelling stays deferred per `AGENTS.md`.
- **In-article CTA blocks were stripped** (10 trailing, 3 inline, 3 centered),
  because they hardcoded a phone number into 16 files. The number renders from
  `firmDetails` instead. The sidebar form and the site-wide `Contact` section
  carry the CTA intent.
- **Heading levels were normalised** to h2/h3. The archive used six different
  conventions; one post had no headings at all and used bold paragraphs as
  section titles, which were promoted to real `h2`s.
- **Dates display in en-GB** (`01 April 2026`), matching the built homepage
  rather than the comp's US format — comp conventions get translated the same
  way its colour tokens do.
- **The related grid gains a 2-up tier** at ≤1000px. The comp jumps 3-up
  straight to 1-up, which balloons the cards on tablets.
- **The deferred in-article components stay deferred** — navy callouts,
  get-in-touch bar, in-article attorney card, fact-checked bar, pull quote.
  Rhan's call this session: Key Takeaways only.
- **The post page is white**, so the light sidebar cards and the Key Takeaways
  box are `--bone-50` cream. A white card on a white page has only its hairline
  to stand on.
- **The sidebar is not sticky**, and its order is fixed: attribution → form →
  categories → related.
- **The byline row under the `h1` is gone.** Author, date and read time live in
  the sidebar's attribution card; showing them twice read as duplication.
- **The attribution card says "Posted on", and flips to "Updated on" in the
  Sanity pass** — not before. The ingested archive only has a publish date, so
  the label would be a claim we can't support. Deferred deliberately; the work
  is listed under "Carry into the Sanity pass" below.
- **The Categories card lists every category in the archive**, not just this
  post's, with the current one marked by weight, colour *and* a longer rule —
  never colour alone. It is a browse control, so it has to offer the others.
- **`Layout` owns lead-form behaviour**, bound once for the document. Form
  components emit no script of their own — a hoisted module tag rendered as a
  stray element between the sidebar cards.

---

## Things that would surprise you

- **The comp's phone number is a typo** — `tel:+18322997990` vs the real
  `(832) 299-1990`. Now recorded in `AGENTS.md`.
- **`_export-practice-areas.dc.html` is not a detail template.** It is the
  Practice Areas *index* comp with an asset-resolver wrapper. The 8
  practice-area pages remain undesigned.
- **`CLAUDE.md` is a symlink to `AGENTS.md`.** Edit `AGENTS.md`.
- **The Blog Post comp has no hero, no breadcrumb and no featured image** — the
  article opens directly under the header on white. Don't add one.
- **The comps live at** `~/Downloads/The Dieye Firm/The Dieye Firm Claude Project/`
  and have moved once already.
- **Reuse already banked:** `ByTheNumbers` and `WhatDrivesUs` are still waiting
  to be reused by Practice Areas index, Blog index and Testimonials. Check
  `src/components/about/` and now `src/components/blog/` before building
  anything that sounds familiar.
