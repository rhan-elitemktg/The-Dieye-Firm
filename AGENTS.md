# The Dieye Firm

Marketing site for a Pearland / Houston family law firm. Astro 7 + Sanity
(embedded Studio at `/admin`) + React islands, deployed on Vercel.

The homepage, the blog, the 32 practice-area pages and the 32 location pages
are built, along with `/video-center/`, `/faq/` and `/privacy-policy/`. What's
left is `/sitemap/`, the last footer link that still 404s, plus wiring the lead
form to an endpoint.

**`/disclaimer/` is not a page we owe.** It never existed on dieyelaw.com — the
live footer links only `/privacy-policy/` — so the link was ours, pointing at
nothing. It was dropped from `firmDetails.legalLinks` on 2026-08-18 at Rhan's
direction rather than filled with invented legal text. If the firm ever supplies
real disclaimer copy, the link comes back with the page, not before it.

**The nav array at the top of `src/components/header/MainNav.astro` is not the
page map.** Both its flyouts are curated shortlists — five practice areas of
32, four service areas of 32 — and the full sections live in the
`practiceAreas` and `locations` collections. Read all three.

> **Read `HANDOFF.md` first** — it holds the current state: what's in flight,
> what's decided, and what's waiting on the user. This file holds the durable
> rules, which change rarely.
>
> `CLAUDE.md` is a symlink to this file. Edit this one.

---

## Where designs come from

**The `.dc.html` design comps are the source of truth for layout *and* copy.**

    ~/Downloads/The Dieye Firm/The Dieye Firm Claude Project/

Comps exist for: About Papa Dieye · Practice Areas index · Blog index ·
Blog Post · Testimonials · Contact · Thank You · Homepage_v1. Their images are
in that folder's `assets/`.

⚠️ **`_export-practice-areas.dc.html` is not a practice-area detail template**,
despite the name. It is the Practice Areas *index* comp with an asset-resolver
wrapper added — the content is otherwise identical. Don't reach for it
expecting a detail page.

**Do not take *page* copy from the live site or the SiteSucker mirror** at
`~/Downloads/The Dieye Firm/sitesucker/`. Hero headlines, section copy and
practice-area body text come from the comps, which exist to replace the old
site's voice. Fine to look at the mirror for structure or URL patterns.

**Three bodies of content were ingested from the live site instead**, and all
three now live in SANITY. They are the client's own writing: they carry SEO
equity, and no comp will ever supply them.

- **Blog posts** — 16, `blogPost`.
- **Practice areas** — 32, ~34,900 words, `practiceArea`.
- **Location pages** — 32, ~41,400 source words, `locationPage`.

**The markdown layer they landed in is GONE.** `src/content/`,
`src/content.config.ts` and the four npm scripts that fed them were retired in
phase 7; the scrapers are parked in `scripts/legacy-scrapers/`, which has a
README saying how to resurrect them and which commit still carries the 80
markdown files. The ingest rules below still describe how that content got
here — read them before any re-ingest — but nothing in `src/` reads markdown
any more, and **`astro:content` is no longer a dependency of this site.**

**Client reviews are a fourth body**, and the exception that isn't in a
collection. The 14 on `/testimonials/` are the clients' own words, taken from
the live site rather than from "Testimonials.dc.html" — the comp's versions are
copy-edited, and these are attributed to named people. They live in a named
array in `testimonials/ReviewWall.astro` rather than in a collection or behind a
scraper, because 14 short quotes are not 47 long documents. **14 is the complete
corpus**: a sweep of all 121 sitemap URLs finds no fifteenth, and
`/testimonials/` itself carries only 9 of them (its "1 / 2" pager splits those 9
across two views — it is not hiding a second batch). Every deviation from
verbatim is listed at the top of that file; add to that list rather than editing
a quote silently.

**The nine FAQ answers are a fifth body, and the two sets are meant to
disagree.** `/faq/` carries the client's own published answers verbatim; the
homepage's `Faq.astro` carries six of the same nine **condensed by us**,
because the full answers run to 136 words and a homepage section cannot hold
them. Both are named arrays — the homepage's in the component, `/faq/`'s in the
page — and `<Faq items head>` renders both. **Do not "fix" the divergence by
unifying them**: it is what keeps the two pages from being duplicates of each
other, and the long versions are the ones with the equity. One answer departs
from the live page and says so on the item itself; log any further departure in
`docs/live-site-corrections.md` the same way, rather than editing a client
sentence silently.

Rules that govern all five:

- **Scrape the live site, never the mirror.** The mirror was captured
  2026-07-20; it was already one post behind on the blog, and it is missing
  `/family-law/parental-rights/` entirely — a 1,545-word page. Enumeration
  comes from `dieyelaw.com/sitemap.xml`. The practice-area scraper still
  cross-checks the mirror, so a page the client *removes* is reported rather
  than silently vanishing.
- **Leave the client's published prose alone**, em dashes included. The
  spaced-hyphen rule below governs copy *we* write when translating a comp,
  not the firm's own published pages. Our authored chrome (Key Takeaways,
  UI strings) follows the repo rule.
- **All three scrapers rewrite every file on every run.** Hand edits to
  frontmatter do not survive. Editorial decisions go in the script, keyed by
  slug. **After any blog re-scrape, run
  `node scripts/legacy-scrapers/add-takeaways.mjs`** — `keyTakeaways` is written
  afterwards and the scrape wipes it.
- **Every override table in a scraper is keyed by SLUG, and in the location
  scraper it must be the FULL slug, not the leaf.** `scrape-practice-areas.mjs`
  keys `LABEL_FIXES` on the leaf, which is safe there because that section is
  flat and every leaf is unique. In `scrape-locations.mjs` "child-custody" is a
  leaf under all four locations and "divorce" under three, so a leaf-keyed
  Pasadena repair lands on Sugar Land silently. This is the easiest way to get
  that ingest quietly wrong.
- **A live page's body may or may not be in one container — check, don't
  assume.** Practice areas split across `#MainContent` plus
  `#ColumnContentExpandExpanded`, a "read more" block Scorpion collapses: 16 of
  the 32 have one, and on `/family-law/child-custody/` it holds 1,442 of the
  page's 1,832 words. The About Us pages split differently again, `#MainContent`
  plus `#ContentS3RightContent`, which on
  `/about-us/choosing-a-family-law-attorney/` holds 414 of 738 words. Blog posts
  and the location pages really are single-container.
  **Always enumerate the `data-content` blocks before extracting** —
  `grep -o 'id="[A-Za-z0-9_]*"[^>]*data-content' page.html` — because taking
  only the first halves the page while looking like it worked.
  **And do not trust an id for what it looks like.** The location pages carry
  `ColumnContentExpand_1..8` ids that read exactly like the practice areas'
  second container and are nothing of the kind: they are `<a>` and `<span>`
  elements on the CTA phone links, holding Scorpion's `{F:P:Cookie:…}`
  replacement tokens. Better than checking for a container you know about is
  what `scrape-locations.mjs` does — measure the content wrapper
  (`#ContentZone`, or `#ContentS4` on two pages) against `#MainContent` and
  throw if words are sitting outside, which catches a shape nobody has seen.
- **The FAQ block at the foot of an About Us page is sitewide boilerplate**, not
  page content. It is byte-identical across those pages (spousal support,
  custody) and belongs to the old site's chrome. Exclude it.

**These have no comp**, and both were built from the live site's own published
prose, which is the rule where it exists: it is the client's writing and it
carries SEO equity. Where it doesn't exist, a page needs direction — inventing
copy is not an option.

- ~~Choosing a Family Law Attorney~~ — built from the live page's 738 words.
- ~~The service-area pages~~ — 32 of them, ingested; see below.

**The About Us group is now one page.** `/about-us/` is Papa's bio and the
firm's story; `/about-us/papa-dieye/` and `/about-us/the-difference/` both fold
into it and are 301s in `vercel.json`. Neither is in the nav, and the About
flyout is down to a single child. If that child ever goes, drop `items` from
the nav entry so it renders as a plain link rather than a one-row dropdown.

These paths sit outside the repo and have moved once already. Check they exist
before assuming.

### Reconciling a comp to this repo

The comps carry their own ad-hoc token overrides. Translate, don't copy:

| Comp | Use instead |
|---|---|
| `--accent` / gold `#cd8e00` | `--gold-500` `#c4a24c` |
| navy `#05172c` | `--navy-900` `#0f2438` |
| `--text-muted` `#475260` | `--ink-500` (same value) |
| `--border` | `--bone-300` |
| `--text-strong` | `--navy-700` |
| Em dashes in copy | Spaced hyphen, or recast the sentence |
| Section `h2` at 56px | The repo ramp, below |

Rationale: interior pages sit next to the built homepage, which uses the
repo's tokens. The comps' overrides were a later experiment in the design tool
and were never applied to the homepage.

---

## Design system

Tokens live in `src/styles/global.css` and are commented — read it before
inventing a value. The parts worth stating up front:

- **Breakpoints** (desktop-first, max-width). Use these exact values, and don't
  invent one-offs: base ≥1440 · `max-width: 1439px` · `max-width: 1000px` ·
  `max-width: 650px`.
  *Approved exceptions, both in the header, both because that row's width is
  driven by its contents rather than by the layout grid:* it collapses to a
  hamburger at `max-width: 1159px`, not 1000px — logo + nav + CTA + phone
  measure 998px, which needs 1078px of viewport once the gutters are paid. The
  ~80px of slack is deliberate, so the next label change costs a re-measure
  rather than an overflow bug.
  And its compact tier runs to `max-width: 1520px`, not 1439px, for the gutter
  reason in Gotchas below. Don't "fix" either back.
  **The collapse point is a measurement, not a constant.** It has moved twice,
  both times because a nav *label* got longer rather than because anything was
  added ("Blog" → "Resources", "Family Law" → "Practice Areas"). Re-measure
  after any label change — `MainNav.astro` carries the working.
- **Container**: `--container-max: 1660px`; gutter `--container-pad` is
  `clamp(20px, 4vw, 40px)`, rising to `100px` at ≥1440.
- **Section rhythm**: `.section` = 98px block padding, easing to 72px ≤1000
  and 48px ≤650.
- **Grid**: two-column `repeat(2, 1fr)` gap 80px (`--section-gap`);
  three-column `repeat(3, 1fr)` gap 80px. Ease gaps to 56px ≤1439, collapse
  ≤1000. **Long-form copy never exceeds 1080px** — two of three columns.
- **Interior page template**: main column spanning 2 of 3 columns (1080px) +
  right sidebar (500px), main first in source order. **It is a component —
  `src/components/interior/InteriorShell.astro`. Don't write the grid again.**
  It takes no props: the sidebar is a named slot (`slot="sidebar"`), the
  background is always white, and the prose size stays in each page's own
  scoped `<style>` because a practice area runs 18px/30px and a post 17px/29px.
  That per-page override works because **Astro assigns a scope hash at the
  authoring site, not the render site** — markup written in the page keeps the
  page's hash even when it renders inside the shell's slot, so a scoped rule
  still reaches it. Its partner `InteriorHeader.astro` is the kicker/h1/deck
  block, taking plain values (`title`, `kicker?: {label, href?}`, `deck?`).
- **Type**: Source Serif 4 headings, Geist everything else, Yellowtail for the
  signature only. Section `h2` uses `clamp(34px, 2.2785vw + 1.1994rem, 52px)`.
  Body is 17px/29px; interior section copy runs 18px/30px.
- **Italic emphasis in headings**: `--gold-600` on light backgrounds,
  `--gold-500` on dark. The core gold only hits ~2.3:1 on white, below the 3:1
  large-text floor.
- **Easing**: `var(--ease-out)` for anything entering. Prefer a soft shadow
  over a hard border for elevation.

---

## Building a page

**Build templates hardest first, easiest last.** The hard ones carry the shared
infrastructure — the interior main+sidebar shell, `.prose`, dynamic routes,
sidebar cards — so everything after them gets cheaper. The reverse order builds
the same things piecemeal and worse. `HANDOFF.md` tracks the current ranking.

1. One component per section under `src/components/<page-group>/`. Page files
   stay thin — imports and section order only (see `src/pages/index.astro`).
2. **Reuse homepage sections wherever the comp shows a matching one** —
   `Awards`, `Testimonials`, etc. import straight from `src/components/home/`.
   Don't rebuild an equivalent.
3. `Contact` and `Footer` are rendered by `Layout.astro`. Never add them to a
   page — **including `/contact-us/`**, where the temptation is strongest. That
   page passes `contactVariant="page"` to `Layout` instead, which forwards it
   to `Contact`; the variant drops the head, swaps the map for a photo and
   flattens the band. One component, one form, one place the markup lives.
   A section that must sit *below* the consultation prompt goes in `Layout`'s
   `after-contact` slot — the default slot renders above it.
   **`contactVariant="none"` drops the section**, and `/thank-you/` is the only
   page entitled to it: the visitor has just submitted that exact form, so
   closing with "Take the First Step" invites a duplicate enquiry and reads as
   though the first one didn't register. Suppression is still a `Layout` prop
   rather than a page quietly opting out, so the default stays "every page
   closes with the prompt".
4. Use `src/components/Eyebrow.astro` for the gold-bird kicker. The homepage
   sections predate it and each carry their own copy; new work should not.
5. Give `Layout` a real `title` and `description`.

### Moving or removing a route

**Any path that exists on the live site is an asset, and moving one is a 301,
never a delete.** Enumerate from `dieyelaw.com/sitemap.xml` — if the old path
is in there, it has equity and inbound links, and dropping it turns both into
a 404.

- The redirect goes in `vercel.json`. **Add both slash forms** — `/old/path`
  *and* `/old/path/`. Vercel applies `redirects` before its own trailing-slash
  normalisation, so a single form can silently never fire, which is the worst
  outcome available: it looks done and isn't.
- **Do not add the old path to any scraper's known-routes set.** A link in
  the client's own copy that still points at the old URL should be *reported*,
  so it gets rewritten to the canonical rather than quietly riding the
  redirect for the life of the site.
- **A path the live host 301s but the sitemap does not list earns no redirect
  from us.** The sitemap is the test for equity, not the server's behaviour.
  The client's copy links to `/sugar-land-family-law/` and three children,
  which dieyelaw.com redirects; none is in the sitemap, so
  `scrape-locations.mjs` rewrites them to the canonical and reports them, and
  `vercel.json` gains nothing. Re-open it only if Search Console shows real
  external inbound links — then it is two lines, in both slash forms.
- Sweep internal links in the same commit: `grep -rn "<old-path>" src/ scripts/`.
  Prose comments count — a stale path in a comment is a wrong answer to the
  next person who greps for it.

### The practice-area section

32 pages under `/family-law/`, built from one route and one template, plus a
separate index at `/practice-areas/`.

- **The index is `/practice-areas/`, not `/family-law/`.** The two are
  different things and mixing them up is the easiest mistake here.
  `/practice-areas/` is built from the comp ("Practice Areas index.dc.html")
  and lists the section; `/family-law/` is a scraped practice-area page in its
  own right ("Pearland Family Lawyer") and sits in the collection like any
  other. Nav, the sidebar card title and every top-level page's kicker point at
  the index.
- **The document's slug IS the route**, with exactly one exception. A slug of
  `divorce/military-divorce` → `/family-law/divorce/military-divorce/`. The slug
  is already the nested path, so `[...slug].astro` consumes it whole. (This was
  the markdown file path before phase 7; the shape survived the move to Sanity
  deliberately, so the routes never had to change.) The exception is the
  section root: its id is `family-law` but it renders at `/family-law/`,
  because stripping the section prefix leaves it with an empty slug. Both
  `areaHref` and `getStaticPaths` special-case that id — `getStaticPaths` gives
  it `slug: undefined`, which a rest param renders at the parent path.
- **URLs match the live site exactly**, so this section needs no redirects —
  unlike the blog, whose Scorpion slugs were cut mid-word. Don't renumber them.
- **The sidebar menu is the same on all 32 pages** (`FamilyLawNav.astro`): the
  11 top-level areas, a `+` on the five with children and an arrow on the rest,
  alphabetical with the `+` rows first. The branch you are in opens by default.
  It briefly had a second state — a branch page listing only its children —
  which existed because the menu was 18 rows and too tall to show everywhere;
  the nesting below removed that reason. Don't re-add it.
  **It also renders outside the section**, on the About Us pages, whose live
  versions carry the same cross-reference. There `current` is omitted: nothing
  is highlighted and every branch starts collapsed, which is right for a menu
  pointing away from the current page rather than locating you within it. Any
  page rendering it must do **both** things the practice-area route does —
  stamp `data-pa-boot` on `<html>` from a blocking head script *and* call
  `initPracticeAreaNav()` — or the branches render open and the `+` buttons are
  inert.
- **`parent` is NOT derived from the URL.** 13 pages are nested on the live
  site, and 8 more are re-parented by `PARENT_OVERRIDES` in the scraper so the
  menu is 11 rows rather than 19 — Parental Rights takes the four rights pages,
  Property Division takes Hidden Assets and QDROs, Domestic Violence takes
  Protective Orders, Divorce takes Mediation vs Litigation. Every grouping
  follows the client's own cross-linking. **Those 8 keep their flat URLs**, so
  path and parent deliberately disagree and no redirect is involved. The
  scraper prints the menu shape on every run and throws on a parent that
  doesn't resolve.
- **`title` is SEO-shaped, `navLabel` is short.** Every page has both
  ("Pearland Divorce Lawyer" vs "Divorce"). Sort and label menus on `navLabel`;
  sorting on `title` files two thirds of the section under P.

### The location pages

32 pages across four service areas, at the SITE ROOT, built from one route
(`src/pages/[...slug].astro`) and the same interior template as the practice
areas. `locationPage` documents, slug IS the route — no prefix, and no
section-root exception.

- **`locations` is the 32 pages. `firmDetails.serviceAreas` is the four nav
  entries.** Same trap as `/family-law/` versus `/practice-areas/`; keep the
  names apart and never call the collection `serviceAreas`.
- **The route is a root catch-all, and that is safe *because the build is
  static*.** `getStaticPaths` declares 32 paths and Astro emits 32 files, so a
  route that never declares `/about-us/` cannot serve it — shadowing is not the
  failure mode available. A path COLLISION is, and it is silent
  (last-write-wins on the filesystem), so the route carries a `RESERVED` set
  that throws naming the offending content file. **`/admin` is in it and is not
  a file in `src/pages/`** — `@sanity/astro` injects it, so a guard derived by
  reading that directory would miss it. `RESERVED` is declared *inside*
  `getStaticPaths`: Astro builds that function into its own prerender chunk
  where a module-scope const is not defined.
- **The sidebar menu is scoped to ONE location.** A Sugar Land page lists Sugar
  Land's pages and no `/family-law/` links at all. The card is still titled
  "Practice Areas" but links to the location root, so two cards on the site
  share a title and mean different scopes — safe only because they never appear
  on the same page.
- **`location` is NOT derived from the URL**, for the same reason `parent`
  isn't on the practice areas. `/pasadena-child-support-attorney/` and
  `/pasadena-family-law-mediation-attorney/` hang off the site root and are
  placed in the Pasadena menu by `LOCATION_OVERRIDES`. **Their URLs do not
  move** and no redirect is involved. On a location root, `location` points at
  itself, so "which location am I in" is total with no branch.
- **`parent` is set only at the third level** (`…/divorce/uncontested-divorce/`
  → `…/divorce/`). A page one segment under the location root is a top-level
  row of that menu, which is what lets `buildTree` be shared unchanged.
- **The two orphans need the nav told about them.** `isActive` prefix-matches,
  so 30 of 32 light Service Areas up for free. `activeUnder` takes a list and
  the extra prefixes are derived from the collection, so a future stray page
  needs no nav edit.
- **`areaServed` is that location only**, matched out of `firmDetails` by href
  rather than retyped, and the build fails if Sanity and the collection
  disagree. A location root emits `LegalService`; a child emits `Service`.
- **The FAQ extraction is heading-based, not microdata.** None of these pages
  carries `FAQPage` markup, unlike `/family-law/mediation-vs-litigation/`. The
  rule is in `scrape-locations.mjs`, and the run prints every lifted question
  for audit — the region ends at the **next `h2`**, not at end of document,
  because the Harris County root has a section after its FAQ.

### The one sidebar menu, and the one HTML parser

Two extractions exist so a third copy never happens. Both were proved no-ops
before anything new used them; do the same to either again.

- **`src/components/interior/TreeNav.astro`** is the expand/collapse menu, with
  `FamilyLawNav` and `LocationNav` as thin adapters and `interior/tree.ts`
  holding the sort and nest. Its classes still read `fl__` and its hooks still
  read `pa-`; that is deliberate, not leftover — keeping them let the
  extraction emit byte-identical HTML on 33 routes, so it could be *proved*
  rather than argued. Rename only as its own provable change.
- **`scripts/lib/html.mjs`** is the shared parsing kit. What is NOT in it —
  `normaliseHeadings`, `stripCtas`, `rewriteLinks`, the page extractors — has
  diverged per source for real reasons, and folding those together behind flags
  would hide the differences the next person needs to see.

### Header: overlay vs in flow

`<Header overlay />` floats the header over a full-bleed hero, transparent
until scrolled. `<Header />` puts it in flow, solid, two-tone (info bar
`--navy-700` over nav `--navy-900`).

The homepage uses `overlay`. **Interior pages often can't**, and the reason is
worth knowing before trying again: with `object-fit: cover` a hero photo's
subject lands at a fixed *percentage* of the rendered height, and that height
is driven by viewport width — so making the hero taller does not move the
subject down. When a photo puts the subject's head high in frame (the Old Town
Pearland street shot puts it at 11%), it sits under the nav's gold CTA at
every size, and the only fixes are a heavy upscale of the source or a
different photo. `/about-us/` uses `<Header />` for exactly this
reason; both files carry a comment saying so.

---

## Gotchas that have bitten us

- **A field the schema does not declare is DELETED the next time an editor opens
  and saves that document.** The Studio builds its form from the schema and
  writes that form back, so an undeclared key inside a declared object is
  pruned — silently, with no warning and nothing in the diff to see. This is not
  hypothetical: `homePage.about.pullQuote` was a live reference set by the
  phase-2 import and never declared, so the homepage's client review vanished
  mid-session and the next build failed with "pullQuote is not set". If code
  reads a path, the schema must declare it. `grep -rn '\->' src/sanity/*.ts`
  lists every reference the site follows; each one needs a `defineField`.
- **Astro scoped styles don't reach markup rendered by a CHILD component.**
  Portable Text, `set:html` content and inlined SVGs never get the scoping
  attribute, so the moment copy moves from a page's template into a renderer,
  every scoped rule targeting it stops matching. The markup stays correct, the
  build stays green, and the type silently reverts to browser defaults. Astro
  stamps the hash on BOTH halves of a descendant selector — `.hero__title em`
  compiles to `.hero__title[hash] em[hash]` — which is why the child half has to
  be `:global`. Use `.parent :global(child)`, and keep the `.parent` scoped so
  the rule stays contained. Same reason `.prose` lives unscoped in `global.css`.
  **A byte-diff is structurally blind to this**: `scripts/checks/prose-styles.js`
  asserts computed styles, which is the only thing that catches it. And when the
  container holds sibling elements of the same tag — `.fa__role` beside the
  body paragraphs — target a class rather than `:global(p)`, passing a two-line
  paragraph component through `ParagraphRun`'s `block` prop, because
  astro-portabletext builds component props as `{node, index, isInline}` and
  does NOT forward extra props through the components map.
- **A long-running dev server serves new markup with STALE scoped CSS**, and the
  signature is that half the rules apply and the rest don't: every rule you did
  not touch works, every rule you edited does nothing. Read the loaded selectors
  out of `document.styleSheets` before debugging the CSS itself — if they still
  show the pre-edit form, the file is fine and the server is not. Restart it
  (`astro dev stop && astro dev --background`) and hard-reload.
- **The Blog Post comp's phone number is wrong.** It has `tel:+18322997990`.
  The live site uses `(832) 299-1990` in 54 places and the `firmDetails`
  singleton agrees. Never hardcode a number from a comp — render it from
  `getFirmDetails()`.
- **Frontmatter dates format one day early** unless you pass
  `timeZone: "UTC"`. A bare `"2026-04-01"` parses as UTC midnight, and
  formatting that in a US local zone renders 31 March. `formatDate` in
  `src/components/blog/blog.ts` handles it; anything new that formats a
  collection date must too.
- **More than one form per page now.** `Layout` renders `Contact` everywhere,
  so any page adding a second form needs unique element ids (duplicates
  silently detach every `<label for>` in the document). Behaviour lives in
  `src/scripts/lead-form.ts` and is bound once by `Layout`; a form component
  must **not** emit its own `<script>`, because the hoisted module tag renders
  as a stray element wherever the component sits. A single
  `document.querySelector` would leave the second form dead — it navigates on
  submit and loses the enquiry. `scripts/checks/blog-forms.js` guards all of
  this.
- **A running dev server NEVER sees a Sanity content edit.** `getFirmDetails()`
  memoises into a module-level promise — deliberately, so a static build queries
  the singleton once rather than once per component — and nothing invalidates
  that cache for the life of the process. HMR still picks up *code* changes, so
  the server looks live and current while quietly serving the document it
  fetched at boot. Every symptom points at the edit having failed: the Studio
  shows the new value, `sanity documents query` shows the new value, `dist/`
  shows the new value, and the page in the browser does not. **After any change
  to `firmDetails` — phone, address, footer nav, legal links, service areas —
  restart the dev server**, and check `dist/` rather than `:4321` when
  confirming one landed. Bit us twice in one session on the same document.

- **A dev server started before an edit can serve new markup with stale scoped
  CSS.** Half the rules apply and the rest silently don't. If a component looks
  unstyled but its HTML is clearly current, `astro dev stop && astro dev
  --background` before debugging the CSS.
- **Don't name a component `Promise`** (or any built-in) — the import shadows
  the global inside that module.
- **Adding `.container` to a `<ul>` and then resetting `margin: 0`** kills its
  `margin-inline: auto` and left-aligns the block above 1660px. If an element
  needs the container's width but not its gutter, declare `max-width` and
  `margin-inline: auto` directly rather than borrowing and overriding.
- **An `<img>` in flow drives its container's height.** Where a comp used a
  background image and expected the row to size from the text beside it, take
  the image out of flow (`position: absolute; inset: 0`) or it stretches to
  its own aspect ratio.
- **A full-bleed photo band under white text needs a real scrim.** Aim for
  ≥4.5:1 against the brightest region, not the average.
- **Borders sit inside the box.** A cell carrying both a 1px rule and the
  container gutter as padding needs `calc(var(--container-pad) - 1px)` to line
  up with the rest of the page.
- **The content box gets NARROWER as the viewport crosses 1440.**
  `--container-pad` jumps 40px → 100px there, so `.container` holds 1359px at
  1439 and **1240px at 1440** — 119px less at a wider viewport. Any row whose
  width is set by its contents rather than by the grid can fit at 1439, break
  at 1440, and fix itself again around 1458 once the extra gutter is paid back.
  This bit the header the moment a nav label got longer, and it broke the
  homepage and blog too, not just the page being worked on. **1440 is in the
  standard check list for exactly this reason — if a wide row is new or has
  grown, test 1440 and 1441 as separate cases.** The header's fix is to hold
  its compact tier to 1520px.
- **A hoisted `<script>` in a component can land as a stray element.** That is
  why `Layout` owns `lead-form.ts` and the practice-area route owns
  `pa-nav.ts`: behaviour lives in `src/scripts/`, the component stays markup.
  It matters most inside a flex or grid parent with a `gap`, where a stray node
  becomes visible space.
- **Collapsing something after first paint reads as a bug.** Anything that
  renders open and is then closed by JS — a filtered grid, an expanded nav
  branch — needs a blocking head script to stamp state on `<html>` before
  `<body>` parses, with the CSS keyed on that attribute. `FilterBoot.astro`
  does it for the Blog index (`data-blog-boot`); the practice-area route does
  it for the sidebar (`data-pa-boot`). Key the collapse rule on the attribute
  so that, without JS, everything stays open and nothing is unreachable.

---

## Verifying

The in-app browser pane is throttled and returns blank screenshots. Use the
repo's headless Chrome tools instead (see `scripts/README.md`):

```bash
npm run shot -- .section-class --url http://localhost:4321/path/ --width 1600
npm run probe -- --url http://localhost:4321/path/ --width 430 --eval "..."
```

Before calling a page done: `npm run build` passes, no console errors, and no
horizontal overflow (`scrollWidth === clientWidth`) at 1920 / 1440 / 1000 /
768 / 430.

### Performance — assume it matters on every change

Core Web Vitals feed SEO and lead capture on a marketing site, so don't wait to
be asked.

- Route images through Astro's pipeline (`<Image>` / `getImage()` from
  `astro:assets`, sourced from `src/assets/`), never a raw `<img>` out of
  `public/`. Only favicons and files needing fixed URLs belong in `public/`.
- LCP image: `loading="eager"` + `fetchpriority="high"`. Everything below the
  fold: `loading="lazy"` + `decoding="async"`.
- Always give images intrinsic dimensions so nothing shifts.
- Third-party embeds (Wistia, maps) load behind a click-to-load facade, with
  their metadata fetched at build time, never client-side.
- Check whether an image is already in `src/assets/images/` before importing a
  duplicate — several comp assets are byte-identical to files already here
  under different names.

---

## Sanity

**The content sweep is done.** Every word a reader sees comes from Sanity apart
from the chrome listed below. Twenty-nine document types — 14 page singletons,
seven collections, eight Site Settings records — plus five object types
(`navLink`, `seo`, `blockContent`, `aboutBody`, `paragraphRun`). Read each
through its helper in `src/sanity/`, all of which take the
`if (import.meta.env.PROD)` cache form so a dev server sees Studio edits on
refresh. Project ID `mj6dqs6p`, dataset `production`, both in the gitignored
`.env`.

**Record or page copy: count the pages the FIELDS reach, not the pages the
component does.** More than one page, it is a record in Site Settings; exactly
one, it belongs to that page's document. Two documents describing one line
disagree eventually and the page picks one. This was written down and then
broken twice in two days, so it is `npm run check:page-copy` now — run it
BEFORE modelling a page, not after. A DEFAULT PROP hides copy from that check:
when a shared component carries a default only one caller uses, that default is
that caller's copy, so make the prop required.

**A field that nothing reads must not exist, and a field that exists must reach
every surface that shows it.** An editor who fills a box and watches the page
not change has learnt the CMS is broken, and the only way to learn otherwise is
to read the code. Both halves have bitten: `attorney.photo` was modelled and
consumed by nothing, and `attorney.role` was wired to the byline while four
marketing spots kept hardcoded copies of the same string.

**The line between editable and chrome.** Editable is what a reader perceives as
the firm's voice — headings, leads, body copy, pull-quotes, CTA labels, stat
figures, alt text carrying a factual claim. Chrome stays in code: `Read More`,
`Load More Posts`, form labels and placeholders, `aria-label`s, the lead-form
validation strings.

**The office map is keyed on the firm's Google Business Profile CID, not on the
address.** `address.mapEmbed` builds
`maps.google.com/maps?cid=…&output=embed`, which Google 301s to its official
place-embed endpoint; the pin then carries the firm's name, rating and hours
instead of a generic red marker. An address query renders an anonymous pin, so
don't "simplify" it back to one — the branded card is the point. Still no API
key either way. The CID is a constant in `firmDetails.ts` alongside the other
derivations; it should become a real field in the Sanity sweep.

### Modelling copy: string, prose run, or rich text

**Pick by what the copy CAN contain, not by how long it is.**

- **A string** for anything that is one line and carries no markup — a button
  label, an eyebrow, a stat figure, a heading. A rich-text box holding a button
  label is worse than a string.
- **`paragraphRun`** for a run of plain paragraphs. Its toolbar is bold, italic
  and link, and nothing else: no block styles beyond Normal, no lists. Five
  sections use it — three on `/about-us/`, two on the homepage.
- **`blockContent`** for an article body — the site's one full toolbar, on the
  practice areas, location pages, blog posts, FAQ answers and legal pages.
- **A narrowed superset** where a section has its own visual vocabulary.
  `aboutBody` is the only one: it adds a Lead style and a pull-quote object, and
  re-renders `bullet` as the gold-tick checklist.

**The rule that decides it: flatten a contiguous run of prose; keep structured
data structured.** The homepage About section became ONE field — paragraphs,
sub-heads, checklist and pull-quote — because all of it is a single run and its
whole vocabulary could be mapped onto block styles. MeetPapa's chips, stats and
milestones stayed fields in the same pass, because they are data with a layout,
not prose. `global.css` says the same thing at the top of `.prose`.

**A narrowed toolbar is a safety feature, not fussiness.** Offer a section the
full `blockContent` toolbar and an editor can pick H2 in a section that styles
no H2 — unstyled text, nothing failing, nobody told. Narrow the styles to
exactly what the section renders. `blockContent`'s header forbids inventing a
second rich-text type for one field and names the superset as the exception;
both of the above are that exception, and each says so in its header.

**Length caps live in `schemaTypes/limits.ts`, are WARNING-only, and are
MEASURED.** One helper per kind of short string — `capEyebrow`, `capButton`,
`capHeading`, `capHeadingAccent`, `capCardTitle`, `capFigure`,
`capReassurance` — applied as `validation: (rule) => capButton(rule.required())`
so required-ness stays visible at the call site. Two rules govern them:

- **Never `.error()`.** Publishing fires the Vercel deploy hook, so a blocking
  error over a 41-character eyebrow stops the whole rebuild. `.error()` is for
  things that would actually break a page — a two-letter state code, a number
  range. Note that a bare `.max(N)` **is** an error; it needs `.warning()` to
  not be one. Six fields were silently error-level until 2026-08-20.
- **Never guess the number.** A cap that fires on correct copy teaches an editor
  that the warnings are noise, and then the one that matters gets ignored too.
  Each number is roughly double the longest value the dataset actually holds;
  `limits.ts` carries the measurements, the date, and the query to redo them.
  The test that it worked: `npx sanity documents validate` shows no NEW warnings.

The same "measure, don't guess" applies to a cap's absence. `homePage.headingLines`
is deliberately uncapped: it is the textarea where the editor's own line breaks
are the design, so a character count is the wrong instrument.

**Headings stay OUT of the rich text on the two legal-ish pages.** Portable Text
headings render through `ProseHeading`, which stamps an id on every one — right
for an article body an anchor might point into, wrong for headings that never
had ids. Each section keeps its heading as a plain string beside its body.

**Accent headings are `{lead, accent}` strings, never rich text.** All 22 carry
an inline `<em>` styled by a *scoped* rule; through a renderer the `<em>` loses
the scope hash and the gold italic silently turns black — on 92 pages for the
consultation section alone. Where the break in a headline is a design decision,
the field is one text box and the template splits on newlines (`headingLines()`
in `src/sanity/aboutPage.ts`), never an array of boxes.

**Moving copy into a renderer is a CSS change as much as a data change**, and
the byte-diff cannot see the CSS half. See the `:global` gotcha below; do it in
the same commit or the section renders unstyled.

The Sanity **CLI is authenticated on this machine**, so `sanity documents
create/query/validate` work directly. The `mcp.sanity.io` server shows as
unauthorized — that's expected, and not a blocker; use the CLI.

Manual steps that can't be automated: Sanity → API → CORS origins needs
`http://localhost:4321` **with credentials** for local `/admin` sign-in, and
the live URL added the same way after deploy.

---

## SEO

**Every SEO field is optional and falls back to what the page already renders.**
That is not a nicety, it is the acceptance test: a build before this layer and a
build after it have byte-identical `<title>`, `<meta name="description">`,
canonical and `og:*` on all 94 pages. If a change here moves one of them, the
change is wrong. The baseline diff is how you check — snapshot `dist/` first.

**The brand suffix applies to the EDITOR'S title, not to the fallback.** 92 of
this site's 93 titles are passed to `Layout` with " | The Dieye Firm" already on
them, and the 93rd (the homepage) opens with it. So `resolveTitle` returns a
fallback VERBATIM and only appends to a `metaTitle` someone typed — appending
unconditionally, as the reference build does, would ship the brand twice on 92
pages. If it already contains the brand, it is not added again.

**`canonicalize()` KEEPS the trailing slash**, the opposite of the reference.
Every URL this site serves ends in one and every canonical already emitted said
so, so stripping it would point 95 canonicals at URLs that exist only as a
redirect. Same reason internal redirect DESTINATIONS get the slash back: without
it, a redirect lands on a URL that redirects again.

**A page hidden by its own `noIndex` gets no canonical and no `og:url`.** Keyed
on the page's own flag, never on the sitewide crawl switch — that switch is
temporary staging state, and letting it strip canonicals off every page would
make staging differ from production in a way nobody asked for. This is also what
stops `/404` inventing a canonical for `/404/`, a URL the site does not serve.

**`src/lib/routePaths.ts` must stay free of `sanity:client`.** The `redirect`
schema imports it, and the Sanity CLI parses schema files during
`npm run typegen`, where that Vite virtual module does not resolve. Inside a
validator use `context.getClient({ apiVersion })` instead.

**Route assembly lives in ONE place**, `src/sanity/routes.ts`. The sitemap and
the redirect generator both need "what URLs exist", and the failure mode of two
copies drifting is a live page silently disappearing.

**Bulk redirects are evaluated BEFORE the filesystem.** A redirect whose source
is a live page takes that page off the site. `bulk-redirects.json.ts` therefore
drops any source in `getLivePaths()` and logs it — never silently. `/admin` is
in `RESERVED_PATHS` because a redirect there would lock the SEO team out of the
tool they would use to undo it. The Studio warns about the same thing earlier,
but a warning can be published past; the build guard is the one that holds.

**Emit both slash forms of every redirect source.** Bulk redirects match the
path exactly and run before trailing-slash normalisation, and the legacy
Scorpion URLs are a mix of both — `vercel.json`'s own 46 hand-written rules are
already 23 such pairs for exactly this reason.

**`vercel.json` is read BEFORE the build**, so nothing generated during a build
can land in its `redirects` array. `bulkRedirectsPath` is the one redirect
surface a build may write. Don't try to generate `vercel.json`, and don't reach
for the Vercel adapter + middleware unless redirects genuinely must apply
without a rebuild — that trades a static build for a runtime dependency.

**Redirects cannot be verified locally, at all.** They do not fire on
`astro dev` and bulk redirects do not work under `vercel dev` either. Prove the
generator instead — stub `getRedirects()` and read `dist/bulk-redirects.json` —
and leave routing itself to a deployed URL.

**The business schema is NOT emitted sitewide from Layout**, and that is a
deliberate divergence. 65 of the 93 pages already emit their own `LegalService`
scoped with a page-specific `areaServed`; a sitewide one would describe the same
firm twice on every one of them. `lib/schema.ts` builds the entity with a stable
`@id`, and the homepage emits it. Giving the other emitters that same `@id` is
the seam that would make a sitewide emit safe later.

**`/sitemap/` is the HTML index for humans; `/sitemap.xml` is the machine one.**
Two files, confusingly similar names, and the live site's own HTML index is at
`/site-map/` — a third spelling. Keep them straight.

---

## Development

Dev server in background mode:

```
astro dev --background
```

Manage with `astro dev stop`, `astro dev status`, `astro dev logs`.

Astro docs: [routing](https://docs.astro.build/en/guides/routing/) ·
[components](https://docs.astro.build/en/basics/astro-components/) ·
[framework components](https://docs.astro.build/en/guides/framework-components/) ·
[content](https://docs.astro.build/en/guides/content-collections/) ·
[styling](https://docs.astro.build/en/guides/styling/)

---

## Git, and keeping these docs true

One branch per page or section (`about`, `footer`, `blog_section`,
`papa_dieye`, …), merged to `master` by PR. Commit only when asked.

**Before pushing — and at the end of a session, even with nothing pushed —
rewrite `HANDOFF.md`.** Rewrite it whole; never append. It should say what is
true now: branch and what's uncommitted, decisions made and *why*, open
questions waiting on the user, and what's next. It is not a changelog — git
already has that.

**Update this file when a rule changes, not on a schedule.** A new convention, a
new gotcha, or a decision that would otherwise get relitigated earns an edit
here. Routine progress does not — that goes in `HANDOFF.md`.

The split matters: this file should stay stable enough to trust without
re-reading, which it can't do if it churns every push.
