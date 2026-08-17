# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-17, at the `about_choosing_differince` commit._

---

## Start here

**The About Us group is finished, and it is two pages rather than four.**
`/about-us/` (Papa's bio and the firm's story) and
`/about-us/choosing-a-family-law-attorney/`. The other two folded into the
first and are 301s.

**What's left, in order:**

- **The service areas.** Four are already in the nav, from `firmDetails`, and
  all four 404. This is now the largest unbuilt thing and the last group with
  dangling nav links.
- **`/faq/` and `/video-center/`**, to fill the Resources flyout. Both are real
  sections of the live site.
- **Wire the lead form to an endpoint.** `/thank-you/` has been built and
  unreachable for two sessions.

---

## Where we are

Branch `about_choosing_differince`, cut from `master` at `ed87cae` (PR #25
merged). Four commits, nothing uncommitted. **Not pushed; no PR open.**

Build passes at **57 pages** (was 56).

---

## What landed this session

### 1. Papa's bio moved up to `/about-us/`

The live `/about-us/` was a stub with no useful content, so the section index
and the attorney bio are one page now. `git mv` of `papa-dieye.astro` →
`index.astro`; the page itself is unchanged apart from its title and
description, which had to answer both "about this firm" and "who is Papa
Dieye". It leads on his name because `About The Dieye Firm` would only repeat
the suffix the whole site carries.

**A quiet win:** the scraped practice-area and blog copy contains 22 links to
`/about-us/` and none to `/about-us/papa-dieye/`. Every one of those was
pointing at the empty stub and now lands on a real page.

### 2. The Dieye Difference folded in

Removed from the nav and 301'd to `/about-us/`. The one non-obvious link was a
gold **"The Dieye Difference"** CTA in `home/Community.astro` on the homepage —
repointed at the canonical rather than left riding the redirect.

**The About flyout is down to a single child.** If that one ever moves too,
drop `items` from the nav entry so "About" renders as a plain link rather than
a one-row dropdown. Noted in `MainNav.astro` and `AGENTS.md`.

### 3. The interior shell was extracted

`src/components/interior/InteriorShell.astro` — the main+sidebar grid, which
had been hand-copied identically into the practice-area and blog-post routes.
This page would have been the third copy. Takes no props: the sidebar is a
named slot, the background is always white, and the prose size stays in each
page's own scoped `<style>`.

`PracticeAreaHeader` became `InteriorHeader` in the same folder, with plain
string props instead of a `CollectionEntry`.

**Both migrations were proven no-ops before the new page existed** — see
Verified below. That proof is the reason to trust the 48 routes they touch.

### 4. `/about-us/choosing-a-family-law-attorney/`

Built from the live page's own 738 words. Interior shell, four-card sidebar,
`WhatDrivesUs` closing it. Turns a nav item that had been 404ing into a real
page.

### 5. Practice-area kickers now name the branch

All 32 routes. A top-level page names itself with **no link**; a child names
its parent and links to it. So `/family-law/child-custody/` and
`/family-law/child-custody/out-of-state-custody/` both read "Child Custody",
and the kicker stops changing shape as you move up and down a branch.

---

## Decisions made — don't relitigate

- **`/about-us/` absorbed both other About pages.** Rhan's call, on the basis
  that the live `/about-us/` had no useful content. Both old paths are 301s in
  `vercel.json`, **each in both slash forms** — Vercel applies `redirects`
  before its own trailing-slash normalisation, so a single form can silently
  never fire, which is the worst outcome available: it looks done.
- **The old paths are NOT in either scraper's known-routes set**, deliberately.
  Client copy still pointing at them should be *reported* so it gets rewritten,
  not left riding a redirect for the life of the site.
- **The shell takes no props.** Sidebar is a slot because the three sidebars
  have different prop shapes and the grid has no business knowing which it
  holds. No `tone` prop: all three consumers are white, and `Awards` gained one
  only when `/thank-you/` actually needed it.
- **Prose size stayed in the pages.** 18px/30px on a practice area, 17px/29px
  on a post. It works because **Astro assigns a scope hash at the authoring
  site, not the render site** — markup written in the page keeps the page's
  hash even when it renders inside the shell's slot. No `:global()` needed.
- **A top-level kicker has no href.** The only honest destination is the page
  you are already on. The cost is that nothing in the main column links to
  `/practice-areas/` any more; the sidebar card's title still does.
- **`FamilyLawNav`'s `current` is optional now**, so it can render on an About
  page. Nothing highlighted, every branch collapsed — right for a menu pointing
  away from the current page rather than locating you within it.
- **The new page's copy is the client's, the headings are ours.** Four
  deviations, all listed at the top of the page file: the "Lawyer" → "lawyers"
  typo fixed twice, five authored `h2`s, the self-referential link dropped, the
  `/family-law/divorce/` link kept.
- **`Article` JSON-LD with no dates.** The source page carries neither a
  published nor a modified date, and inventing one is the error `AuthorCard`
  refuses to make with its footer line. Not `FAQPage` — that block is sitewide
  boilerplate and isn't on our page.

---

## Verified

**The shell and header migrations are no-ops.** Baseline captured from the
working tree before any edit; both sides measured against static servers of the
two `dist/` snapshots rather than the dev server, which can serve stale scoped
CSS after an edit.

- HTML, 32 practice-area routes: **0 of 32 differ** after normalising scope
  hashes and the intended class rename.
- CSS declarations, all 49 interior routes: **49/49 identical**.
- Computed styles, 6 representative routes × 8 widths: **48/48 identical** —
  grid tracks, gaps, box geometry, prose size, header typography, child order.
- Sidebar menu behaviour tested live on both a practice-area page (1 branch
  open, current row highlighted) and the new page (0 open, nothing
  highlighted); toggles bound, click expands, `aria-expanded` flips.

**The new page:** build clean · one `h1` · five `h2`s in order · six paragraphs,
738 words · `links: ["/family-law/divorce/"]`, no self-link, no typo · no
horizontal overflow, duplicate ids or orphaned labels at 1920 / 1441 / 1440 /
1000 / 768 / 650 / 430 · zero console errors at 1440 and 430 ·
`blog-forms.js` **19/19** with both forms binding independently.

**The kickers:** all 32 audited — 11 top-level naming themselves with no href,
21 children naming and linking to their parent, including the 8 re-parented
pages whose path and parent deliberately disagree. Linked and hrefless variants
both compute `rgb(169,134,58)` (`--gold-600`).

**No regressions elsewhere:** no overflow on the homepage, a parent page, a
childless top-level page, both About pages or a blog post. Zero
`the-difference` links in the built output. Nav row still 694px at 1600, so the
1160px collapse measurement is untouched.

---

## Things that would surprise you

- **Two build-output changes look like regressions in a `dist` diff and aren't.**
  Shrinking each page's scoped CSS pushed the 16 blog posts under Astro's
  inline-stylesheet threshold, so a `<link>` became a `<style>`; and once two
  entry points imported `pa-nav.ts`, Vite hoisted it from per-page inline into a
  shared external chunk. Both are Vite decisions, both net improvements. **This
  is why the migration was proved with CSS-declaration and computed-style
  comparisons plus a live behaviour test, not an HTML diff alone.**
- **`sed -E` on macOS does not support `\b`.** A normalisation using it fails
  silently and every route "differs". Cost half an hour; don't repeat it.
- **`zsh` does not word-split unquoted variables.** `cmd $routes` passes one
  giant argument. Use an array.
- **The About Us pages split their body across `#MainContent` +
  `#ContentS3RightContent`**, a different container from the practice areas'
  `#ColumnContentExpandExpanded`. On the page we just built that second block
  held 414 of 738 words. **Enumerate the `data-content` blocks before
  extracting anything** — the rule is now in `AGENTS.md`.
- **The FAQ block at the foot of an old About page is sitewide boilerplate**,
  byte-identical across those pages. Not page content.
- **The live page had no `h1` at all** — its visible heading is a styled `<p>`,
  and it says "Texas" where the `<title>` and nav label don't. We kept that
  disagreement; it is the same `title` ≠ `navLabel` split every practice-area
  page carries.
- **`/family-law/` is a content page and `/practice-areas/` is the index.** The
  reverse is the intuitive guess and it is wrong.
- **The section root is the one page whose file path is not its route.**
  `getStaticPaths` gives it `slug: undefined`, which a rest param renders at the
  parent path.
- **The content box gets narrower as the viewport crosses 1440** —
  `--container-pad` jumps 40→100px. Test 1440 and 1441 separately.
- **`npm run shot` and `npm run probe` force lazy images to load**, so a probe
  reports every image as `loading="eager"`. Check `dist/` for the truth.
- **`npm run shot` names its file by selector and width**, so two shots of the
  same selector overwrite each other. Read between them.
- **The headless lib drops CDP events**, so there is no console-error check in
  `scripts/checks/`. Inject a collector via
  `Page.addScriptToEvaluateOnNewDocument` before `goto`.
- **`scripts/checks/video-modal.js` only runs against `/`**, and
  `blog-forms.js` is page-specific in the same way (though it works on any page
  with forms).
- **`CLAUDE.md` is a symlink to `AGENTS.md`.** Edit `AGENTS.md`.
- **Rhan runs the dev server from his IDE.** Check 4321 before starting a second.

---

## Waiting on Rhan

1. **The service areas need direction.** Four are in the nav and all 404. No
   comp, and the live site's versions have not been assessed yet.
2. **The lead form still has no endpoint.** `lead-form.ts` cancels submission
   and confirms inline, so `/thank-you/` is unreachable. When it lands, the
   form action points there.
3. **`/thank-you/` says nothing about what happens next** — no response time,
   no "call us if it's urgent". The wording is a commitment on the firm's
   behalf.
4. **Authored strings with no comp behind them** — page title and meta
   description on `/thank-you/`, `/testimonials/`, `/contact-us/`, the new
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
7. **The "Lawyer" typo is still live on dieyelaw.com** — "a few Lawyer you
   like", "Many Lawyer will offer". We fixed it on our page. Worth telling the
   firm so their current site gets corrected too.
8. **26 of the 32 practice-area detail pages close with a "come talk to us"
   section**, on top of the sidebar form and the sitewide Contact section. Kept
   deliberately, because it is **not** a blanket strip — six end on real content
   that must survive: Commonly Asked Questions · Frequently Asked Questions ·
   How Mediation Can Save Time and Reduce Costs · How a Divorce Modification Is
   Filed in Texas · Parental Rights Cases in Harris County Family Court ·
   Visitation Rights for Unmarried Parents in Pearland. Trivial to strip later,
   impossible to recover if dropped now.
9. **`modifications-enforcement` is 290 words**, the thinnest page and the only
   one where the sidebar overhangs the article.
10. **Key Takeaways still need attorney review before launch** —
    `scripts/add-takeaways.mjs`.
11. **The August blog post is categorised by us, not the client**
    (`child-custody` via `CATEGORY_OVERRIDES`) and still has no artwork.
12. **Two near-duplicate blog posts** — `understanding-child-custody-laws`
    (2025-01) and `understanding-child-custody-laws-in-pearland-texas`
    (2026-07).
13. **Branch granularity** — one branch per page, or per template group? This
    branch carries a page, a shared-infrastructure extraction and two
    restructures, which is more than the convention describes.

---

## Known issues

- **`WhatDrivesUs` reflows on font swap.** "Direct, Personal Attention" goes
  from one line to two when the real face loads, a 30px shift. It now does this
  on **five** pages — `/about-us/`, `/practice-areas/`, `/testimonials/`,
  `/blog/` and the new page — so it is a CLS hit worth fixing before launch.
  Confirmed identical on the new page and on `/about-us/` as a control, so the
  new page adds nothing; it just inherits it.
- **`/about-us/` passes no `canonical`.** It and `/` are the only two built
  pages that don't. One-line fix, not done here because it was outside the
  branch's scope.
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

---

## Carry into the Sanity pass

**`InteriorShell` and `InteriorHeader` are the interior template.** Anything
modelled later that renders long-form copy with a rail should use them rather
than growing a third grid.

**The 14 reviews want a `testimonial` document type** — `lead`, `body`, `name`,
`matter`, and an optional video reference so the tile stops being a hardcoded
constant. Already a flat array of plain objects in `ReviewWall.astro`, so the
migration is a query and a map. `matter` is our categorisation, not the
client's, and should become a reference to the practice-area document.

**The new page's copy is already Sanity-shaped** — a named `sections` array of
`{heading, paragraphs[]}`. It wants to become a Portable Text body with the
headings as real blocks; the four deviations at the top of the file are the
editorial record that should travel with it.

**The Google Maps CID is a constant in `firmDetails.ts`**, not a field on the
singleton. It should become one, so a second office or a re-verified listing
doesn't need a deploy.

**"Updated on" instead of "Posted on"** for blog posts, once editors can revise
one: an optional `updated` field, the card picking its label from it, and
`dateModified` in the `BlogPosting` JSON-LD. `AuthorCard` already takes an
optional date, so that switch is half-built. Both dates need `timeZone: "UTC"`.

**Both collections are already the shape Sanity needs.** `practiceArea` wants
`title` / `navLabel` / `subtitle` / `parent` / `faqs`, with parent/child as a
reference rather than a path. **Categories are still derived from posts**, not
modelled — `allCategories()` reads them off the archive and `categoryLabel()`'s
map is the seed data for a `category` type.

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

Practice areas need none — their URLs match the live site exactly.

---

## Known dangling routes

| Link | Lives in | Lands with |
|---|---|---|
| `/harris-county-family-law-attorney/` | Service Areas flyout (×4) | the service areas |
| `/league-city-family-law-attorney/` | Service Areas flyout | the service areas |
| `/sugar-land-family-law-attorney/` | Service Areas flyout | the service areas |
| `/pasadena-family-law-attorney/` | Service Areas flyout | the service areas |
| `/faq/` | Resources flyout | an FAQ page |
| `/video-center/` | Resources flyout | a video page |
| `/client-portal` | Info bar | a third-party portal, or removal |

The Service Areas parent points at the first area rather than an index, so it
dangles too. `/family-law/` in-body links to
`/harris-county-family-law-attorney/child-custody/` and `/child-support/` are
covered by the same group.

Nothing links to `/thank-you/` yet, and that is correct — it is a form
destination, not a nav item.

Both scrapers print their own dangling list on every run.
