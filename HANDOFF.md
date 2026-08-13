# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-13, end of session._

---

## Start here

**The practice-area section is built.** 31 pages under `/family-law/`, ingested
from the live site and rendered by one template with the new sidebar.

**Next task: the practice-area index at `/family-law/`.** It 404s today, and it
is now by some distance the most-linked missing page on the site — the nav item,
the "View All +", the "View All +" inside each branch sidebar, plus a kicker and
a card title on every one of the 31 pages. It has a comp
("Practice Areas index.dc.html"), so it needs no new copy and nothing is
blocking it.

After that: the About Us group and the service-area pages, both still
undesigned.

---

## Where we are

Branch `pa_single`, branched from `master` at `19fcf05`. Pushed with an upstream
set; open a PR when you're happy with it.

Build passes at **51 pages** (20 + 31). No horizontal overflow at
1920 / 1440 / 1000 / 768 / 430 on the homepage, blog index, a blog post,
`/about-us/papa-dieye/` or any of the three practice-area sidebar states. The
two-form check passes 19/19 on a practice-area page and still 19/19 on a blog
post.

---

## What landed this session

**`scripts/scrape-practice-areas.mjs`** — sibling of the blog scraper.
31 pages, ~34,000 words, into `src/content/practice-areas/`. Parse coverage
82–98%; the 82% is `mediation-vs-litigation`, and that gap is its five Q&A pairs
moving into frontmatter rather than anything lost.

**The template** — `src/pages/family-law/[...slug].astro` plus
`src/components/practice-areas/`: `PracticeAreaHeader`, `PracticeAreaSidebar`,
`FamilyLawNav`, `AreasWeServe`, `PracticeAreaFaqs`, `practiceAreas.ts`.

**The sidebar**, modelled on a reference screenshot Rhan supplied: attorney
card, enquiry form, the Family Law menu, Areas We Serve.

**Nav changes** — the Family Law flyout is now a curated five (Divorce, Child
Custody, Child Support, Domestic Violence, Protective Orders) plus "View All +",
keyed on collection id rather than hardcoded hrefs. "Blog" became **"Resources"**
with Blog beneath it.

**Reuse banked:** `SidebarCard` and `AuthorCard` gained optional props rather
than forks, so the blog sidebar is untouched. `CaseEvaluationCard`, `.prose` and
the interior grid came across unchanged.

---

## Decisions made — don't relitigate

**Sourcing**

- **The live site is the source, not the SiteSucker mirror.** Rhan initially
  asked for the mirror; it turned out to be missing `/family-law/parental-rights/`
  entirely — a 1,545-word page published after the 20 July capture. The mirror is
  still cross-checked on every run so a *removed* page gets reported.
- **URLs are preserved exactly**, so this section needs no redirects. The blog
  needed 16 because Scorpion cut its slugs mid-word; these are clean.
- **The `/family-law/` index is not in the collection.** It has a comp, and a
  comp outranks a scrape wherever one exists.
- **CTAs were stripped** — 61 centred, 6 inline plugs. Zero phone numbers remain
  in any of the 31 files. Four meta descriptions ended "Call (832) 299-1990" and
  were trimmed for the same reason: frontmatter can't reach `getFirmDetails()`.
- **Five links to old Scorpion blog URLs were resolved** through
  `blog-redirects.json` to their final routes, so no internal link relies on a
  301 hop.

**Structure**

- **The sidebar has two states.** A page with children lists only its children;
  everything else lists all 18 top-level areas. Rhan's rule, and it is why the
  children-in-a-grid idea was dropped — the expanding branch already makes
  children reachable, and from every page in the branch rather than only the
  parent.
- **A child page gets the full index with its parent pre-opened**, not its
  siblings alone. Rhan's rule covered "has children" and "doesn't"; a child page
  is the third case, and landing with your position visible beats landing behind
  a `+` you have to find.
- **A branch page gets a "View All +" footer link.** Not in the reference
  screenshot. Without it the Divorce card is a dead end — 10 children and no way
  back to the other 16.
- **Order is alphabetical with the `+` rows first.** Grouping the two expandable
  rows reads as structure; scattered down an 18-row list they read as
  inconsistency.
- **Sort on `navLabel`, never `title`.** Every title is SEO-shaped ("Pearland
  Divorce Lawyer"), so sorting on it files two thirds of the section under P.
- **"Resources" has no page of its own**, so it renders as a `<button>` — the
  flyout opens on `:focus-within` and a `<span>` would be unreachable by
  keyboard. On mobile the label toggles the group and both toggles keep
  `aria-expanded` in sync.
- **Related Blog Posts was removed** from the bottom of practice-area pages;
  something else goes there later. The now-unused `relatedByCategory` and
  `blogCategoryFor` helpers were deleted rather than left as dead code — git has
  them.

**Naming**

- **"Family Law", not "Practice Areas", in the nav** — and the URL stays
  `/family-law/`, because all 31 detail pages live under it and the nav's
  active-state helpers match on path prefix.
- Two nav labels are deliberately shorter than the collection's: **"Protective
  Orders"** for Protective & Restraining Orders, and the sidebar still says the
  long form. Same page, different room.

---

## Waiting on Rhan

1. **~24 of the 31 pages close with a "come talk to us" section** — "Contact Our
   Firm for Sound Legal Counsel", "Ready to Take the Next Step?". The template
   already has a sidebar form and the sitewide Contact section, so these are a
   third ask. Kept deliberately: several pages' final h2 is genuine content
   ("How a Divorce Modification Is Filed in Texas"), so it needs an editorial
   eye, and it is trivial to strip later but impossible to recover if dropped
   now.
2. **`modifications-enforcement` is 290 words**, the thinnest of the 31. It is
   also the only page where the sidebar visibly overhangs the article (~780px).
   More copy fixes it better than a layout change would.
3. **The Key Takeaways still need attorney review before launch.** Unchanged.
   Wording lives in `scripts/add-takeaways.mjs`.
4. **The August blog post is still categorised by us, not the client** —
   `child-custody` via `CATEGORY_OVERRIDES`, and still without artwork. Note it
   is about the 2025 Texas Fit Parent Presumption, the same subject as the new
   `/family-law/parental-rights/` page, so the client is actively building that
   cluster.
5. **Two near-duplicate blog posts** — `understanding-child-custody-laws` (2025-01)
   and `understanding-child-custody-laws-in-pearland-texas` (2026-07).
6. **Branch granularity** — one branch per page, or one per template group?
   Still unanswered; this session used one branch for the whole section.

---

## Carry into the Sanity pass

Deferred on purpose, and easy to lose if it isn't written down:

**"Updated on" instead of "Posted on".** The blog attribution card should switch
its label once a post has actually been revised. It stays "Posted on" today
because the ingested archive carries only a publish date.

1. An `updated` field on the `post` document (optional), alongside `date`.
2. The card picks the label: `updated` present **and** later than `date` →
   "Updated on"; otherwise "Posted on". Both need `timeZone: "UTC"`.
3. `BlogPosting` JSON-LD gains `dateModified` — the half search engines read.

The source pages already carry `dateModified` in their JSON-LD;
`scrape-blog.mjs` reads `datePublished` only.

**`AuthorCard` already takes an optional date** — practice-area pages render it
without one. That is the same switch the above needs.

**Both collections are already the shape Sanity needs.** `practiceArea` wants
`title` / `navLabel` / `subtitle` / `parent` / `faqs`; the parent/child relation
is a reference, not a path. **Categories are still derived from posts**, not
modelled — `allCategories()` reads them off the archive, and `categoryLabel()`'s
map is the seed data for a `category` document type.

---

## Known dangling routes

| Link | Lives in | Lands with |
|---|---|---|
| `/family-law/` | nav, "View All +", every PA page's kicker and card title | the practice-area index |
| `/harris-county-family-law-attorney/child-custody/` | PA in-body links | service areas |
| `/harris-county-family-law-attorney/child-support/` | PA in-body links | service areas |

The four family-law routes that were dangling last session —
`relocation-case`, `visitation-possession`, `grandparent-rights`,
`mediation-vs-litigation` — **all resolve now**. Both scrapers print their own
dangling list on every run.

---

## Things that would surprise you

- **The content box gets narrower as the viewport crosses 1440.** Documented in
  `AGENTS.md`; it broke the header sitewide the moment a nav label got longer,
  and it fixed itself again by 1458, so a sweep that skipped 1440 would have
  missed it. The header's compact tier now runs to 1520px.
- **A practice-area page's body lives in two containers**, and one of them is
  behind a "read more". Also in `AGENTS.md` — it is the single easiest way to
  silently lose half the section.
- **`npm run probe` cannot see the Blog index's arrival scroll.** `settle()`
  ends in `window.scrollTo(0, 0)`. Drive `launch()` directly to test it. The
  note is in `scripts/checks/blog-index.js` too.
- **`_export-practice-areas.dc.html` is still not a detail template.** It is the
  index comp with an asset-resolver wrapper — and the index is the next build,
  so this one finally matters.
- **`CLAUDE.md` is a symlink to `AGENTS.md`.** Edit `AGENTS.md`.
- **No practice-area page has a hero**, same as both blog templates. They open
  directly under a solid `<Header />` on white. Don't add one.
- **Rhan runs the dev server from his IDE.** Check 4321 before starting a second.
- **`.pa-cache/` and `.blog-cache/` are gitignored fetch caches.** Delete either
  to force a refresh; both scrapers take `--refetch`.
- **Only one page in the section has FAQs** — `mediation-vs-litigation`, five of
  them, lifted from schema.org microdata. The extractor is generic, so more will
  appear on their own if the client adds them.
