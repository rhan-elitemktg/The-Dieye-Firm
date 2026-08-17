# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-17, at the `/contact-us/` commit._

---

## Start here

**`/contact-us/` is built.** The worst dead link on the site is closed: the gold
header CTA on all 54 pages and the six in-body CTAs from the practice-area copy
now land on a real page.

**Next up: the About Us group** — About Us index, Choosing a Family Law
Attorney, The Difference. It has **no comp**, so it needs direction from Rhan
before it can start. Don't invent the copy and don't fall back to the live site.

After that: the service areas, then `/faq/` and `/video-center/` to fill the
Resources flyout.

---

## Where we are

Branch `contact`, cut from `master` at `216443f` (PR #22 merged). One commit,
carrying the whole page. **Not pushed, no PR open.**

Build passes at **54 pages** (was 53).

---

## What landed this session

**`/contact-us/`**, built from "Contact.dc.html". Three parts:

- `contact/ContactHero.astro` — centred type on white. The only hero on the site
  with no photo, which is the comp's call: the form is the page, and a
  full-bleed band would push it under the fold.
- The sitewide `Contact` section, in a new `page` variant.
- `contact/FindUs.astro` — the office map at 1280×600, in the size a contact
  page should give it.

**`Contact.astro` gained a `variant` prop** (`"section"` | `"page"`). The page
variant drops the head, drops the map, adds a street photo of Papa above the
"Get In Touch" cards, and flattens the band to white with no padding *above*
it. All from the comp.

**`Layout.astro` gained two things** — a `contactVariant` prop it forwards to
`Contact`, and an `after-contact` named slot. The slot exists because `Layout`
renders `Contact` *after* the default slot, and the comp runs hero → form →
map; without it the 600px map would have pushed the form down the page.

**`src/assets/images/papa-old-town-portrait.jpg`** is new (the comp's
`contact-street.jpg`, 1376×768).

### Changes that reach all 53 content pages

These came out of the contact work but are not scoped to it. Worth knowing
before reading a diff on the homepage or a practice-area page and wondering.

- **The office map is branded.** `address.mapEmbed` keys the embed on the
  firm's Google Business Profile CID instead of an address query, so the pin
  carries the firm's name, logo and 4.7★ (104 reviews). `mapQuery` had no
  consumers left and was removed — two ways to build the same map is how the
  unbranded pin comes back.
- **The address links out.** `address.mapLink` opens the same listing in a new
  tab (`rel="noopener noreferrer"`, with a `.visually-hidden` "(opens in a new
  tab)"). On a phone it hands off to the Maps app.
- **The office address changed** to `12280 W Broadway St Ste 3105` — see below.
- **`.cinfo__item` links rest navy, hover gold.** Was the other way round.
  Also an a11y fix: gold-600 on white is 3.4:1, under the 4.5:1 floor for 16px
  bold, and the three values sat in it permanently. It matches how `--gold-600`
  is described in `global.css` ("text-on-light accent, hover").
- **`--mist-100: #eef3f5` is a new token**, promoted from a hardcoded one-off in
  `Contact.astro` now that `FindUs` is a second consumer. No pixel changed.

### One live Sanity edit

**The `firmDetails` singleton's `address.street` was changed** from
`12280 Broadway Street, Suite 3105` to **`12280 W Broadway St Ste 3105`**, at
Rhan's instruction, to match the Google Business Profile. The document was
backed up first and only that one field differs; every other field was verified
intact afterwards (3 footer columns, 4 service areas, 3 legal links, socials,
phone, hours). It propagated to all 53 content pages — contact card, footer and
the `streetAddress` in the JSON-LD on `/contact-us/` and all 32 practice-area
pages. `/admin` is the only page without it, which is correct.

**This is the one change in the commit that git cannot revert.** Rolling the
code back leaves the new address in Sanity; it would have to be re-edited in
`/admin`.

---

## Decisions made — don't relitigate

- **`/contact-us/` does not render its own `Contact`.** It asks `Layout` for a
  variant. Two copies of the component would mean two forms, duplicate element
  ids, and `lead-form.ts` binding twice — the exact failure `blog-forms.js`
  exists to catch. Now in `AGENTS.md`.
- **The hero eyebrow reads "Contact Us", not the comp's "Get In Touch".** The
  Contact section immediately below opens with an `h3` of exactly that phrase.
  The comp couldn't see it — the section is an opaque `x-import` there — so
  this is a translation fix, not a departure.
- **The photo replaces the map rather than joining it.** One office, one embed:
  `FindUs` carries the map on this page, so the shared section drops its own.
- **The photo is a new asset, not the existing `papa-old-town-pearland.png`.**
  Same shoot, same pose, different crop: the existing one is a wide street
  frame with Papa hard right, which puts his face at the very edge of a
  half-column card. Not byte-identical, so this isn't the duplicate-import trap
  `AGENTS.md` warns about — it was checked.
- **The photo uses `aspect-ratio`, not the comp's fixed 390px height** — same
  call as the practice-area cards, same reason. 16/9 in the two-column tier (a
  no-op crop: the source is 1.79:1), 2/1 once the grid stacks, back to 16/9 on
  a phone. That ladder mirrors the map's own, directly above it in the file.
- **The photo is `loading="eager"` + `fetchpriority="high"`**, unlike every
  other image that far down a page. With no hero photo above it, it is the LCP
  element at every width — 394px of it is in the initial viewport at 1920,
  475px at 1000. Measured, not assumed.
- **`sizes` is a four-tier `calc`, not a round `46vw`.** A round 46vw pulls the
  900px file at 1440 where the 640 is correct — confirmed: the browser now
  picks 640 for a 590px slot.
- **`ContactPage` wrapping a `LegalService`.** The practice-area pages nest the
  same NAP as a service provider, but this is the page the NAP is *about*.
- **The branded map is sitewide, not just `/contact-us/`.** Rhan asked for it
  on the contact page; the small map in the shared section is the same office,
  so leaving 53 pages on an anonymous pin would have been an odd split.
- **`FindUs` is tinted, the Contact block above it is white.** With both white
  the form and the map ran together as one slab. The tint is the same
  `--mist-100` the Contact section wears elsewhere, so the page keeps to two
  surfaces.
- **Only `padding-top` is zeroed on `.contact--page`**, not the whole
  `padding-block`. The bottom keeps `.section`'s 98px *and* its easing to
  72/48, so the navy form card isn't flush against the colour change.

---

## Verified

- `npm run build` — 54 pages, clean.
- No horizontal overflow at 1920 / 1441 / 1440 / 1160 / 1159 / 1000 / 768 / 430.
- No console errors on `/contact-us/` or the homepage.
- No font-swap reflow at 1440 / 1000 / 430.
- One form, one iframe, one `h1`, no duplicate element ids, `aria-current` on
  the header CTA.
- The form validates, masks the phone, submits and resets. `blog-forms.js`
  still passes on a blog post, so the two-form pages are unaffected.
- The map renders the branded place card — firm name, address, 4.7★ (104) — at
  1440 and 430.
- All three `.cinfo__link`s rest navy and hover gold, checked with a dispatched
  cursor on each rather than by reading the rule.

Two traps in the tooling, both of which produce a convincing false negative:

- **Headless Chrome only paints map tiles after a scroll and a settle.** A
  plain `npm run shot` of that band comes back blank, which looks like a broken
  embed and isn't.
- **`elementFromPoint` coordinates go stale across a `scrollIntoView`.** Read
  the rect *after* the scroll settles or the synthetic cursor lands on the
  wrong element and the hover looks broken.

`blog-forms.js` **errors on `/contact-us/`** — it asserts exactly two lead
forms, which is a blog-post invariant. That's the check being blog-specific,
not a fault on this page. Don't "fix" it by adding a second form.

---

## Waiting on Rhan

1. **Direction for the About Us group.** No comp for any of the three pages.
   This is the blocker on what's next.
2. **Two authored strings on `/contact-us/`** — the page title ("Contact a
   Pearland Family Law Attorney | The Dieye Firm") and its meta description.
   Neither is in the comp.
3. **Two authored strings on `/practice-areas/`** — the A–Z section head ("Full
   Index" / "Every practice area, *A to Z.*") and the page title ("Texas Family
   Law Practice Areas | The Dieye Firm"). Neither has a comp.
4. **26 of the 32 detail pages close with a "come talk to us" section.** The
   template already has a sidebar form and the sitewide Contact section, so
   these are a third ask. Kept deliberately, because it is **not** a blanket
   strip: the other six end on real content and must survive — Commonly Asked
   Questions · Frequently Asked Questions · How Mediation Can Save Time and
   Reduce Costs · How a Divorce Modification Is Filed in Texas · Parental
   Rights Cases in Harris County Family Court · Visitation Rights for Unmarried
   Parents in Pearland. Trivial to strip later, impossible to recover if
   dropped now.
5. **`modifications-enforcement` is 290 words**, the thinnest page and the only
   one where the sidebar overhangs the article.
6. **Key Takeaways still need attorney review before launch** —
   `scripts/add-takeaways.mjs`.
7. **The August blog post is categorised by us, not the client**
   (`child-custody` via `CATEGORY_OVERRIDES`) and still has no artwork.
8. **Two near-duplicate blog posts** — `understanding-child-custody-laws`
   (2025-01) and `understanding-child-custody-laws-in-pearland-texas` (2026-07).
9. **Branch granularity** — one branch per page, or per template group? Still
   unanswered. This branch carries one page.

---

## Known issues

- **`WhatDrivesUs` reflows on font swap.** "Direct, Personal Attention" goes
  from one line to two when the real face loads, a 30px shift. **Pre-existing**
  — it does the same on `/about-us/papa-dieye/` and `/practice-areas/`. Worth
  fixing before launch since it is a CLS hit on two pages. Not on
  `/contact-us/`, which doesn't use that section.
- **The `/practice-areas/` hero is 1247×741**, so it upscales about 1.5× across
  a full-bleed band at 1920. Rhan chose the image knowing this.
- **The office map is a bare Google embed**, on `/contact-us/` and on all 53
  other pages via the shared section. It sets third-party cookies on every
  page. `AGENTS.md` wants embeds behind a click-to-load facade; this one
  predates that rule and is the last holdout. Worth doing if a consent banner
  ever lands.

---

## Carry into the Sanity pass

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
Nothing on the page is a hardcoded NAP, so it needs no work in the sweep. The
comp's own address (suite 2743) and phone (832-299-7990) are both wrong; the
singleton is right.

---

## Known dangling routes

| Link | Lives in | Lands with |
|---|---|---|
| `/faq/` | Resources flyout | an FAQ page |
| `/video-center/` | Resources flyout | a video page |
| `/harris-county-family-law-attorney/child-custody/` | PA in-body links | service areas |
| `/harris-county-family-law-attorney/child-support/` | PA in-body links | service areas |

`/contact-us/` has left this table — it is built.

`/faq/` and `/video-center/` are both real sections of the live site we have
not rebuilt; Resources needed children once Blog moved up to top level. The
comp's nav also lists "Free Guides"; it was left out because it exists neither
here nor on the live site.

Both scrapers print their own dangling list on every run.

---

## Things that would surprise you

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
- **`CLAUDE.md` is a symlink to `AGENTS.md`.** Edit `AGENTS.md`.
- **Rhan runs the dev server from his IDE.** Check 4321 before starting a second.
- **`.pa-cache/` and `.blog-cache/` are gitignored fetch caches.** Both scrapers
  take `--refetch`.
