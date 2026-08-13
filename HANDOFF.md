# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-13._

---

## Where we are

Branch `papa_dieye`, pushed. Two commits ahead of `master`:

- `Add Papa Dieye about page` — the page, its 7 section components, the shared
  `Eyebrow`, two images, the two-tone header default, and the `global.css`
  cleanup.
- `Document project conventions and session handoff` — `AGENTS.md` rewritten
  from the Astro stub, and this file.

**No PR opened yet.** Repo convention is one branch per page, merged to
`master` by PR, so that's the next mechanical step.

`/about-us/papa-dieye/` is built and reviewed. Build passes, no console errors,
no horizontal overflow at 1920 / 1440 / 1000 / 768 / 430.

---

## Decisions made — don't relitigate

- **Copy comes from the `.dc.html` comps, not the SiteSucker mirror.** Asked and
  settled 2026-08-13. See `AGENTS.md`.
- **`/about-us/papa-dieye/` uses `<Header />`, not `<Header overlay />`.** We
  tried overlay twice. With `object-fit: cover` the subject sits at a fixed
  percentage of rendered height, and rendered height follows viewport *width* —
  so a taller hero cannot push Papa's head below the nav. Swapping to the
  mirrored storefront photo did fix it, but that changed the comp's chosen
  image, so we reverted to the street photo with an in-flow header. Both files
  carry a comment; full reasoning in `AGENTS.md`.
- **Header is two-tone** — info bar `--navy-700` over nav `--navy-900`. Fixed in
  `MainNav.astro`'s default, not special-cased per page.
- **Italic heading emphasis uses `--gold-600` on light backgrounds.** The core
  gold fails large-text contrast on white.
- **Stat band (`ByTheNumbers`)** declares its own `max-width` + `margin-inline`
  rather than borrowing `.container`, with the gutter on the outer cells. On
  desktop it carries no outer rules; tablet and mobile keep theirs, because
  once the grid wraps the first cell no longer stands alone on the left edge.
- **Sanity modelling stays deferred** until the static site is done.
- **Project docs split durable from volatile** — `AGENTS.md` for rules,
  `HANDOFF.md` for state — and neither is duplicated into agent memory. The
  same setup is now step 12 of `/new-site`.

---

## Open questions — waiting on Rhan

1. **Four interior pages have no comp** — About Us index, Choosing a Family Law
   Attorney, The Difference, and the service-area pages. Need direction on copy
   and layout before these can be built.
2. **Service-area page count** is driven by the `serviceAreas` array in the
   `firmDetails` Sanity singleton. Worth confirming the final list.
3. **Branch granularity for the rest of About Us** — one branch per page, or one
   for the whole group?

---

## Next

1. Open the PR for `papa_dieye`.
2. Rest of the About Us group — blocked on question 1 above.
3. Then: Family Law index + 8 practice areas (comps exist for both the index and
   the detail template), service areas, Testimonials, Blog index + post,
   Contact, Thank You.

---

## Things that would surprise you

- **`CLAUDE.md` is a symlink to `AGENTS.md`.** Edit `AGENTS.md`; writing through
  the symlink is refused.
- **The design comps moved**, from `~/Downloads/The Dieye Firm project/` to
  `~/Downloads/The Dieye Firm/The Dieye Firm Claude Project/`. Check the path
  before assuming.
- **`/new-site` was edited this session** to scaffold these two docs on every
  new project. It lives at `~/.claude/commands/new-site.md`, outside this repo,
  so it is not covered by these commits.
- **The dev server on :4321 is not managed by this session** — it was already
  running. `preview_start` will refuse the port.
