# The Dieye Firm

Marketing site for a Pearland / Houston family law firm. Astro 7 + Sanity
(embedded Studio at `/admin`) + React islands, deployed on Vercel.

The homepage is built. The work in progress is the ~20 interior pages, whose
routes are already defined by the nav array at the top of
`src/components/header/MainNav.astro` — that array is the page map.

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

**Do not take copy from the SiteSucker mirror** at `~/Downloads/The Dieye Firm/sitesucker/`.
It is a full capture of the live dieyelaw.com and is deliberately not being
used. Fine to look at for structure or URL patterns, never for words.

**These have no comp** and need direction before they can be built — don't
invent copy or fall back to the live site:

- About Us index, Choosing a Family Law Attorney, The Difference
- **All 8 practice-area detail pages** (divorce, custody, support, …) — the
  largest undesigned block in the project
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
  *Approved exception:* the header collapses to a hamburger at
  `max-width: 1200px`, not 1000px — the 6-item nav plus CTA and phone need
  ~1189px. Don't "fix" it back to 1000.
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
   page.
4. Use `src/components/Eyebrow.astro` for the gold-bird kicker. The homepage
   sections predate it and each carry their own copy; new work should not.
5. Give `Layout` a real `title` and `description`.

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

The one live document today is the `firmDetails` singleton — phone, address,
socials, service areas, footer nav. Read it through `getFirmDetails()` in
`src/sanity/firmDetails.ts`, which memoises so a static build fetches once.
Project ID `mj6dqs6p`, dataset `production`, both in the gitignored `.env`.

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
