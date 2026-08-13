# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-13, end of session._

---

## Start here

**Next task: build the Blog Post template.** Reasoning and open decision below.

---

## Where we are

Branch `papa_dieye`, pushed to origin, three commits ahead of `master`. Working
tree clean. **No PR opened yet** — repo convention is one branch per page merged
by PR, so that's an outstanding mechanical step.

`/about-us/papa-dieye/` is built and reviewed. Build passes, no console errors,
no horizontal overflow at 1920 / 1440 / 1000 / 768 / 430.

Everything else in the ~20-page interior build is untouched.

---

## Next: Blog Post

We build templates **hardest first** (now a convention in `AGENTS.md`). Current
ranking of what's left, by difficulty:

| Template | Why it sits here |
|---|---|
| **Blog Post** ← next | Dynamic route, Portable Text, sidebar, form, related posts |
| Blog index | Categories + featured + grid; `WhatDrivesUs` already built |
| Practice Areas index | Two of its four sections already built |
| Testimonials | Reuses the existing `Testimonials` component |
| Contact | `Contact.astro` already exists site-wide |
| Thank You | One section |

Blog Post shows only two bespoke sections in the comp, but it is the densest
file (36.5KB). Its `bp-*` classes cover a main article column plus a real
sidebar (attorney card, categories, "Get a Case Evaluation" form card, related
articles), a key-takeaways callout, an author row, fact boxes, mid-article
callouts, and a related-posts grid.

**It is first because of what it unlocks, all of which is currently unbuilt:**

- The **interior main+sidebar template** (1080 + 500) documented in `AGENTS.md`
  and never yet used. Every practice-area and service-area page needs it.
- **`.prose`** — defined in `global.css`, never once exercised.
- **Dynamic routing** (`[slug].astro`), needed again for practice areas and
  service areas.
- **Reusable sidebar cards** — attorney snapshot, CTA form card.

**Sanity stays deferred.** Follow the pattern already set in
`src/components/home/Blog.astro`: placeholder data shaped exactly like a future
`post` document, so the eventual swap is a query and a map, not a rewrite. Post
artwork exists at `src/assets/images/blog/` (4 images, small — 400x224).

---

## Open questions — waiting on Rhan

1. **Blog Post routing — asked, not yet answered.** Build the real dynamic route
   (`/blog/[slug].astro` driven by a few placeholder posts), or a single static
   `/blog/example-post/` to settle the design first?
   *Recommendation: the dynamic route.* Barely more work, and the routing
   pattern carries over to practice areas and service areas.
2. **The undesigned pages need direction** — About Us index, Choosing a Family
   Law Attorney, The Difference, all 8 practice-area detail pages, and the
   service-area pages. See `AGENTS.md`.
3. **Service-area page count** is driven by the `serviceAreas` array in the
   `firmDetails` Sanity singleton. Worth confirming the final list.
4. **Branch granularity** — one branch per page, or one per template group?

---

## Decisions made — don't relitigate

- **Templates are built hardest → easiest.** Adopted 2026-08-13.
- **Copy comes from the `.dc.html` comps, not the SiteSucker mirror.**
- **`/about-us/papa-dieye/` uses `<Header />`, not `<Header overlay />`.** We
  tried overlay twice. With `object-fit: cover` the subject sits at a fixed
  percentage of rendered height, and rendered height follows viewport *width* —
  so a taller hero cannot push Papa's head below the nav. Swapping to the
  mirrored storefront photo did fix it, but changed the comp's chosen image, so
  we reverted to the street photo with an in-flow header.
- **Header is two-tone** — info bar `--navy-700` over nav `--navy-900`, set in
  `MainNav.astro`'s default rather than per page.
- **Italic heading emphasis uses `--gold-600` on light backgrounds.**
- **Stat band (`ByTheNumbers`)** declares its own `max-width` + `margin-inline`
  rather than borrowing `.container`, gutter on the outer cells, no outer rules
  on desktop.
- **Sanity modelling stays deferred** until the static site is done.
- **Project docs split durable from volatile** — `AGENTS.md` for rules, this
  file for state, neither duplicated into agent memory. Same setup is now step
  12 of `/new-site`.

---

## Things that would surprise you

- **`_export-practice-areas.dc.html` is not a detail template.** It is the
  Practice Areas *index* comp with an asset-resolver wrapper; content is
  otherwise identical. This means the 8 practice-area pages are undesigned.
- **`CLAUDE.md` is a symlink to `AGENTS.md`.** Edit `AGENTS.md`; writing through
  the symlink is refused.
- **The design comps moved**, from `~/Downloads/The Dieye Firm project/` to
  `~/Downloads/The Dieye Firm/The Dieye Firm Claude Project/`.
- **`/new-site` was edited this session** to scaffold these two docs on every new
  project. It lives at `~/.claude/commands/new-site.md`, outside this repo, so
  it is not covered by these commits.
- **Reuse already banked:** `ByTheNumbers` and `WhatDrivesUs`, built for Papa
  Dieye, are reused by Practice Areas index, Blog index and Testimonials. Check
  `src/components/about/` before building anything that sounds familiar.
