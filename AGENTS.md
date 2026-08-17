# The Dieye Firm

Marketing site for a Pearland / Houston family law firm. Astro 7 + Sanity
(embedded Studio at `/admin`) + React islands, deployed on Vercel.

The homepage, the blog and the 31 practice-area pages are built. What's left is
the remaining interior pages — the practice-area index, the About Us group and
the service areas.

The nav array at the top of `src/components/header/MainNav.astro` is no longer
the whole page map: its Family Law flyout is a curated shortlist of five, and
the full section lives in the `practiceAreas` collection. Read both.

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

**Two bodies of content are ingested from the live site instead**, and both are
already in. They are the client's own writing: they carry SEO equity, and no
comp will ever supply them.

- **Blog posts** — `npm run scrape:blog` → `src/content/blog/` (16).
- **Practice areas** — `npm run scrape:practice-areas` →
  `src/content/practice-areas/` (31, ~34,000 words).

**Client reviews are a third body**, and the exception that isn't in a
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

Rules that govern all three:

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
- **Both scrapers rewrite every file on every run.** Hand edits to frontmatter
  do not survive. Editorial decisions go in the script, keyed by slug.
- **A practice-area page's body is split across TWO containers** —
  `#MainContent` plus `#ColumnContentExpandExpanded`, a "read more" block
  Scorpion collapses. 16 of the 31 have one, and on `/family-law/child-custody/`
  it holds 1,442 of the page's 1,832 words. Taking only `#MainContent` halves
  several pages while looking like it worked. Blog posts don't have this.

**These have no comp** and need direction before they can be built — don't
invent copy or fall back to the live site:

- About Us index, Choosing a Family Law Attorney, The Difference
- The service-area pages

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
  right sidebar (500px), main first in source order.
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
- **The content file path IS the route**, with exactly one exception.
  `src/content/practice-areas/divorce/military-divorce.md` →
  `/family-law/divorce/military-divorce/`. The glob loader's id is already the
  nested slug, so `[...slug].astro` consumes it whole. The exception is the
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
different photo. `/about-us/papa-dieye/` uses `<Header />` for exactly this
reason; both files carry a comment saying so.

---

## Gotchas that have bitten us

- **Astro scoped styles don't reach `set:html` content.** Inlined SVGs and
  Portable Text never get the scoping attribute. Use `.parent :global(svg)`.
  Same reason `.prose` lives unscoped in `global.css`.
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

**Content modelling is deliberately deferred.** Build the static site first,
then model everything into Sanity in one pass. Don't add schema types
opportunistically while building pages — modelling against a fraction of the
site produces a model that gets rewritten, and changing schema after real
content exists forces a deprecate → migrate → remove cycle.

**So that the eventual sweep is mechanical:** keep each section's content in
named arrays at the top of the component's frontmatter (as `stats` in `Hero`
and `nav` in `MainNav` do), not inline in the markup.

**The two ingested collections are the exception that proves the rule.** Blog
posts and practice areas live in Astro content collections
(`src/content.config.ts`, `src/content/blog/*.md`,
`src/content/practice-areas/**/*.md`) rather than in component arrays, because
there are 47 of them and they are real editorial content. Both Zod schemas are
deliberately the shape the matching Sanity document will return, so each
migration is a query and a map — not a rewrite. `astro-portabletext` and
`@sanity/image-url` are already installed and unused, waiting for that pass. Do
**not** add a `post` or `practiceArea` schema type before the sweep.

The one live document today is the `firmDetails` singleton — phone, address,
socials, service areas, footer nav. Read it through `getFirmDetails()` in
`src/sanity/firmDetails.ts`, which memoises so a static build fetches once.
Project ID `mj6dqs6p`, dataset `production`, both in the gitignored `.env`.

**The office map is keyed on the firm's Google Business Profile CID, not on the
address.** `address.mapEmbed` builds
`maps.google.com/maps?cid=…&output=embed`, which Google 301s to its official
place-embed endpoint; the pin then carries the firm's name, rating and hours
instead of a generic red marker. An address query renders an anonymous pin, so
don't "simplify" it back to one — the branded card is the point. Still no API
key either way. The CID is a constant in `firmDetails.ts` alongside the other
derivations; it should become a real field in the Sanity sweep.

The Sanity **CLI is authenticated on this machine**, so `sanity documents
create/query/validate` work directly. The `mcp.sanity.io` server shows as
unauthorized — that's expected, and not a blocker; use the CLI.

Manual steps that can't be automated: Sanity → API → CORS origins needs
`http://localhost:4321` **with credentials** for local `/admin` sign-in, and
the live URL added the same way after deploy.

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
