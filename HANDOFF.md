# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-17, at the `/thank-you/` push._

---

## Start here

**`/thank-you/` is built.** That was the last comp with no page behind it —
every `.dc.html` in the project folder now has a route.

**Everything left has no comp**, which is the blocker on all of it:

- **The About Us group** — About Us index, Choosing a Family Law Attorney,
  The Difference. The largest remaining chunk, and next if direction lands.
- **The service areas.**
- **`/faq/` and `/video-center/`**, to fill the Resources flyout.

Don't invent the copy and don't fall back to the live site. Rhan's answer on
the About Us three is what unblocks the queue.

---

## Where we are

Branch `thank_you`, cut from `master` at `0ba7f50` (PR #24 merged). One commit,
carrying the whole page. **Pushed; no PR open yet.**

Build passes at **56 pages** (was 55).

Three tracked files changed outside the new page — `Layout.astro`,
`home/Awards.astro` and `AGENTS.md`, all for the two shared-component changes
below. The other 55 pages are unaffected: the homepage awards strip still
computes white with its hairline, and Contact still renders everywhere but
`/thank-you/`.

---

## What landed this session

**`/thank-you/`**, built from "Thank You.dc.html". Two new components plus a
reused one:

- `thank-you/ThankYouHead.astro` — centred gold-bird kicker over the `Thank
  You` h1, on white.
- `thank-you/MeetTheAttorney.astro` — the inset rounded photo card: side-scrim,
  gold rule, the comp's paragraph verbatim, and the button into
  `/about-us/papa-dieye/`.
- `home/Awards.astro`, reused — the comp closes on the trust strip, and it is
  doing real work there as the reassurance right after someone commits to
  making contact.

**`src/assets/images/papa-tan-wide.jpg`** is new (the comp's `papa-tan.jpg`,
1200x670). It is **not** a duplicate of `papa-hero-tan.jpg` — that one is
824x768, a portrait crop of the same shoot used by the homepage hero.

### Two shared components changed

- **`Layout` gained `contactVariant="none"`**, which drops the Contact section
  entirely. `/thank-you/` is the only page entitled to it; the reason is in
  Decisions below and the rule is now in `AGENTS.md`.
- **`Awards` gained `tone?: "white" | "bone"`**, defaulting to `white`. Only
  `/thank-you/` passes `bone`. A prop rather than a page-side override, because
  the background is the component's own and reaching in with `:global()` from
  one page would make it every page's problem.

---

## Decisions made — don't relitigate

- **No consultation prompt on `/thank-you/`.** The visitor has just submitted
  that exact form, so closing with "Take the First Step — reach out for a free
  consultation" invites a duplicate enquiry and reads as though the first one
  didn't register. The comp omits it too. Suppression is a `Layout` prop rather
  than a page quietly opting out, so the default stays "every page closes with
  the prompt".
- **`noindex, follow`.** A confirmation page is a destination, never a search
  result: it is reachable only by having just submitted the form, and indexing
  it puts a contentless page in front of someone searching for the firm.
  `follow` because the links out of it are still worth crawling.
- **No JSON-LD on that page, deliberately.** Structured data on a page excluded
  from the index is noise, not markup. It is the only built page without any.
- **The two background tones are inverted there**, at Rhan's instruction: the
  confirmation and the photo card share a white block, and the awards strip
  below them is bone. Everywhere else bone is the ground and Awards is the
  white band. `.tyband`'s 98px bottom padding is load-bearing for this — the
  card would otherwise sit flush on the colour change and the white would read
  as a bug rather than a band. Awards drops its `--bone-300` hairline in that
  tone: the rule exists to part a white band from bone ground.
- **The card's headline caps at 58px, not the comp's 68px**, in a 780px column
  rather than its 720px. The comp sets that h2 as two hardcoded spans, so two
  lines is its intent — at 68px it broke to three and stranded "Pearland." on
  its own line.
- **`<Header />` in flow, not `overlay`.** The page opens on a white
  confirmation block; there is no photo for the header to float over.
- **Mobile drops the side-scrim** at ≤650, the same collapse the three interior
  heroes make: the photo becomes its own band at the top of the card with the
  copy on solid navy beneath. A side-scrim can't work at that width — the copy
  would sit on Papa whatever the gradient does.

---

## Verified

- `npm run build` — 56 pages, clean.
- No horizontal overflow at 1920 / 1441 / 1440 / 1000 / 768 / 650 / 430, and no
  duplicate ids at any of them.
- No console errors at 1440 or 430, using the collector-before-`goto` method in
  "Things that would surprise you".
- `font-shift.js` at 1440 / 1000 / 430 — no reflow. The page does not carry
  `WhatDrivesUs`, so it doesn't inherit that shift.
- The band image is `loading="eager"` + `fetchpriority="high"` with intrinsic
  dimensions — checked in `dist/`, not by probe. It is the LCP element: on a
  1440x800 viewport the card's top edge sits at ~434px.
- One `h1`, zero forms, no Contact section — and Contact still present on `/`,
  `/contact-us/`, `/testimonials/` and `/blog/`.
- `blog-forms.js` passes 19/19 on a post, so the `Layout` change didn't touch
  form binding.
- The homepage awards strip still computes `rgb(255,255,255)` with its 1px
  `--bone-300` hairline.

---

## Waiting on Rhan

1. **Direction for the About Us group.** No comp for any of the three pages.
   This is the blocker on what's next.
2. **`/thank-you/` is unreachable until the form has an endpoint.**
   `lead-form.ts` still cancels submission and confirms inline, so nothing
   routes there yet. Building the destination first was the right order; the
   wiring is a separate job. When it lands, the form action points here.
3. **The comp says nothing about what happens next** on `/thank-you/` — no
   response time, no "call us if it's urgent" line. The inline form status
   already promises one business day. Worth adding, but the wording is a
   commitment on the firm's behalf.
4. **Two authored strings on `/thank-you/`** — page title ("Thank You | The
   Dieye Firm") and meta description. No comp.
5. **A real client video testimonial.** The `/testimonials/` tile is wired to
   `z79lx3x00o` — the firm's own "About Us" reel, **the same id
   `home/About.astro` already plays** — as a working stand-in. Its poster is a
   stock portrait of nobody connected to the firm, so the tile is deliberately
   **un-attributed**: "Video Testimonial / Watch their story", no name, because
   a name would assert a client who doesn't exist. Swap the id, the poster and
   add a name together.
6. **Two authored strings on `/testimonials/`** — page title and meta
   description. No comp.
7. **The two CMS-truncated reviews.** Larry's and the "Honest, Sincere" review
   end mid-word in the firm's own CMS (`…what he can do. H"` and `…Mr. Papa was
   always h`). Each is cut back to its last complete sentence in
   `ReviewWall.astro`. **The tails are not recoverable from the live site; ask
   the firm for the originals.**
8. **Two authored strings on `/practice-areas/`** — the A–Z section head ("Full
   Index" / "Every practice area, *A to Z.*") and the page title. No comp.
9. **Two authored strings on `/contact-us/`** — page title and meta
   description. No comp.
10. **26 of the 32 practice-area detail pages close with a "come talk to us"
    section.** The template already has a sidebar form and the sitewide Contact
    section, so these are a third ask. Kept deliberately, because it is **not**
    a blanket strip: the other six end on real content and must survive —
    Commonly Asked Questions · Frequently Asked Questions · How Mediation Can
    Save Time and Reduce Costs · How a Divorce Modification Is Filed in Texas ·
    Parental Rights Cases in Harris County Family Court · Visitation Rights for
    Unmarried Parents in Pearland. Trivial to strip later, impossible to
    recover if dropped now.
11. **`modifications-enforcement` is 290 words**, the thinnest page and the only
    one where the sidebar overhangs the article.
12. **Key Takeaways still need attorney review before launch** —
    `scripts/add-takeaways.mjs`.
13. **The August blog post is categorised by us, not the client**
    (`child-custody` via `CATEGORY_OVERRIDES`) and still has no artwork.
14. **Two near-duplicate blog posts** — `understanding-child-custody-laws`
    (2025-01) and `understanding-child-custody-laws-in-pearland-texas`
    (2026-07).
15. **Branch granularity** — one branch per page, or per template group? Still
    unanswered. This branch carries one page.

---

## Known issues

- **`WhatDrivesUs` reflows on font swap.** "Direct, Personal Attention" goes
  from one line to two when the real face loads, a 30px shift. It does this on
  `/about-us/papa-dieye/`, `/practice-areas/` and `/testimonials/` — three
  pages, so it is a CLS hit worth fixing before launch. `/thank-you/` doesn't
  carry that section.
- **The `/practice-areas/` hero is 1247×741**, so it upscales about 1.5× across
  a full-bleed band at 1920. Rhan chose the image knowing this.
- **The `/thank-you/` card image is 1200×670**, a ~1.2× stretch at the card's
  1460px maximum. Much gentler than the above, and the card's 2:1 is close
  enough to the photo's 1.79:1 that almost nothing is cropped.
- **The office map is a bare Google embed**, on `/contact-us/` and on all other
  content pages via the shared section. It sets third-party cookies on every
  page. `AGENTS.md` wants embeds behind a click-to-load facade; this one
  predates that rule and is the last holdout. It is also the sole failure in
  `video-modal.js` (run against `/`). Worth doing if a consent banner lands.
- **The testimonials video poster is a stock face.** Not a defect in the build
  — it is item 5 under "Waiting on Rhan" — but it is on the one page whose job
  is credibility, so it should not reach launch.

---

## Carry into the Sanity pass

**The 14 reviews want a `testimonial` document type** — `lead`, `body`, `name`,
`matter`, and an optional video reference so the tile stops being a hardcoded
constant. They are already a flat named array of plain objects in
`ReviewWall.astro`, so the migration is a query and a map. `matter` is our
categorisation, not the client's; every value is a practice area the quote
itself names, and it should become a reference to the practice-area document
rather than a string.

**The Google Maps CID is a constant in `firmDetails.ts`**, not a field on the
singleton. It should become one, so a second office or a re-verified listing
doesn't need a deploy.

**"Updated on" instead of "Posted on"** for blog posts, once editors can revise
one: an optional `updated` field, the card picking its label from it, and
`dateModified` in the `BlogPosting` JSON-LD. `AuthorCard` already takes an
optional date — practice-area pages render it without one — so that switch is
half-built. Both dates need `timeZone: "UTC"`.

**Both collections are already the shape Sanity needs.** `practiceArea` wants
`title` / `navLabel` / `subtitle` / `parent` / `faqs`, with parent/child as a
reference rather than a path. **Categories are still derived from posts**, not
modelled — `allCategories()` reads them off the archive and `categoryLabel()`'s
map is the seed data for a `category` type.

**`/contact-us/` reads everything factual from `firmDetails`** — phone, email,
address, hours, the map embed and link, the service areas in its JSON-LD.
Nothing on the page is a hardcoded NAP, so it needs no work in the sweep.

---

## Known dangling routes

| Link | Lives in | Lands with |
|---|---|---|
| `/faq/` | Resources flyout | an FAQ page |
| `/video-center/` | Resources flyout | a video page |
| `/harris-county-family-law-attorney/child-custody/` | PA in-body links | service areas |
| `/harris-county-family-law-attorney/child-support/` | PA in-body links | service areas |

`/faq/` and `/video-center/` are both real sections of the live site we have
not rebuilt; Resources needed children once Blog moved up to top level. The
comp's nav also lists "Free Guides"; it was left out because it exists neither
here nor on the live site.

Nothing links to `/thank-you/` yet, and that is correct — it is a form
destination, not a nav item. See item 2 under "Waiting on Rhan".

Both scrapers print their own dangling list on every run.

---

## Things that would surprise you

- **`/thank-you/` is the one page with no Contact section and no JSON-LD**, and
  both are deliberate. See Decisions.
- **`Awards` takes a `tone` prop now.** Default is unchanged; only
  `/thank-you/` passes `bone`.
- **The testimonials page has no pagination and no scroll behaviour**, despite
  the comp's "Load More" button. 14 reviews, all rendered, no JS.
- **`/testimonials/` carries only 9 reviews on the live site, not 14.** The
  other 5 live on other pages. Don't read that as a discrepancy.
- **The testimonials video is the homepage's About video.** Same Wistia id,
  standing in until a real client video exists.
- **`Layout` has an `after-contact` slot.** If a section needs to sit below the
  consultation prompt, that's how — the default slot is above it.
- **The map is keyed on a Business Profile CID, not the address.** Don't
  "simplify" it back to an address query; the branded card is the point. In
  `AGENTS.md`.
- **`/family-law/` is a content page and `/practice-areas/` is the index.** The
  reverse is the intuitive guess and it is wrong.
- **The section root is the one page whose file path is not its route.** Its id
  is `family-law`; `areaHref` and `getStaticPaths` both special-case it, the
  latter with `slug: undefined`, which a rest param renders at the parent path.
- **The header collapse point is measured, not chosen.** A longer nav label
  moves it. It has moved three times.
- **The content box gets narrower as the viewport crosses 1440** —
  `--container-pad` jumps 40→100px. Test 1440 and 1441 separately.
- **A practice-area page's body lives in two containers**, one behind a "read
  more". Both in `AGENTS.md`.
- **`npm run shot` and `npm run probe` force lazy images to load**, so a probe
  will report every image as `loading="eager"`. Check `dist/` for the truth.
- **`npm run probe` cannot see the Blog index's arrival scroll** — `settle()`
  ends in `window.scrollTo(0, 0)`. Drive `launch()` directly.
- **The headless lib drops CDP events**, so there is no console-error check in
  `scripts/checks/`. To catch them, `send("Page.addScriptToEvaluateOnNewDocument", …)`
  a collector before `goto` and read it back after `settle`.
- **`scripts/checks/video-modal.js` only runs against `/`** — it queries `.reel`
  and `.video-card`, which are homepage selectors. Same page-specific
  limitation `blog-forms.js` has.
- **`CLAUDE.md` is a symlink to `AGENTS.md`.** Edit `AGENTS.md`.
- **Rhan runs the dev server from his IDE.** Check 4321 before starting a second.
- **`.pa-cache/` and `.blog-cache/` are gitignored fetch caches.** Both scrapers
  take `--refetch`.
