# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-18, on the `faq_page` branch._

---

## Start here

**`/faq/` is built**, on the branch and **not committed**. It was item 1 on the
previous list. `/video-center/` was item 0 and is **merged** — PR #28, commit
`ff405f9` — so the previous handoff's "Start here" was describing work that had
already landed. That is fixed here.

**What's left:**

1. **`/privacy-policy/`, `/disclaimer/` and `/sitemap/`** — the three footer
   links that still 404. With `/faq/` in, they are the *only* dangling routes
   left besides `/client-portal`, which is a third-party decision rather than a
   page to build.
2. **`/client-portal`** — in the info bar on every page. Needs a real portal URL
   or removal. Not ours to invent.

**Still unscheduled, and still the only thing between the site and a real
enquiry: the lead form has no endpoint.** `lead-form.ts` cancels submission and
confirms inline, so `/thank-you/` remains unreachable. It needs a decision about
where leads go before it can be built.

---

## Where we are

Branch `faq_page`, cut from `master`. **Everything below is uncommitted.**
Build passes at **91 pages** (was 90).

| | |
|---|---|
| New | `src/pages/faq.astro` |
| New | `scripts/checks/faq.js` |
| Changed | `src/components/home/Faq.astro` — optional `items` and `head` props |
| Changed | `src/pages/[...slug].astro` — `"faq"` added to `RESERVED` |
| Changed | `docs/live-site-corrections.md` — correction 3 |
| Changed | `AGENTS.md` — status line, and the FAQ as a fifth body of client prose |

**`src/assets/logos/elite-white.svg` is untracked and is not mine.** It was in
the working tree at the start of this session, it is referenced from nowhere in
`src/`, and it is the agency's logo rather than the firm's. Decide whether it
belongs in the repo before committing — `git status` will keep offering it.

**No redirect is involved.** The live page is at `/faq/` and so is ours, so
there is nothing in `vercel.json` for this branch. It is in
`dieyelaw.com/sitemap.xml`, which is `AGENTS.md`'s test for equity, and the URL
matches exactly.

---

## What landed this session

### The FAQ page — the client's nine answers, the homepage's component

The page is a header, the existing accordion, and `WhatDrivesUs` — the same
three-part shape as `/video-center/`, deliberately, and it reuses that page's
`BlogHeader` with a different kicker. **It ships no new CSS architecture, no new
JavaScript, and no new assets.**

**The content is the client's own published prose, verbatim.** The live `/faq/`
carries **nine** questions under one category heading, and they are the reason
the page exists: they carry the SEO equity and no comp will ever supply them.
Curly apostrophes, "$5,000.00", "20 percent" and all — left alone, per
`AGENTS.md`.

**The homepage keeps its condensed six, and the divergence is the point.**
`Faq.astro` already held six of the same nine, shortened by us to fit a homepage
section. Rendering those same six again at `/faq/` would have made the new page
a byte-identical copy of a homepage band, with a second identical `FAQPage`
JSON-LD block on a second URL, offering a visitor who clicked "FAQs" nothing
they had not already scrolled past. So the component took `items` and `head`
props and the two pages pass different arrays. **This is written up in
`AGENTS.md`** so nobody "fixes" it by unifying them.

### One answer departs from the live page, and it is documented three ways

The live page's second question reads *"What factors does the court look at in
determining the division of assets?"* and its answer opens *"Not necessarily."*,
then refers to *"All the factors mentioned above"* — factors that appear nowhere
on the page. The answer was written for a different question and moved without
its heading.

At Rhan's direction the question is recast to the one the answer is already
giving — **"Is marital property always divided 50/50?"** — and the orphaned
sentence is dropped. Nothing else in the answer is touched. It is commented on
the item itself in `faq.astro`, asserted by `scripts/checks/faq.js`, and written
up for the firm as **correction 3 in `docs/live-site-corrections.md`** so the
live page can be fixed too.

---

## Decisions made — don't relitigate

- **All nine, in the client's words — not the homepage's six.** Rhan's call over
  the two alternatives he was shown (ship the homepage's exact six; or take all
  nine but rewrite every answer in our condensed voice). The client's answers are
  the asset, and the two pages stop being duplicates.
- **The broken pair is repaired, not dropped and not shipped as-is.** Also
  Rhan's call, over dropping it to nine-minus-one or reproducing the mismatch
  verbatim on "the client's prose is untouchable" grounds. It would have read as
  an error to every visitor.
- **Props on `Faq.astro`, not a clone and not a move to a shared directory.**
  Exactly the precedent `BlogHeader` set when it took `eyebrow` for
  `/video-center/`: two pages does not justify the move. **If a third page ever
  wants this component, it graduates** — probably to `interior/`.
- **The component's own head is suppressed at `/faq/` (`head={false}`).** The
  page already opens with `BlogHeader`'s kicker and `h1`; the component's eyebrow
  and `h2` under them read as a stutter. The section keeps an `aria-label` so it
  does not become an unnamed region.
- **`FAQPage` JSON-LD stays on the homepage too**, emitting its six. Both blocks
  are generated from the same array as their own markup, so neither can drift,
  and the two sets differ in wording. Dropping the homepage's is a defensible
  one-line change — Google prefers `FAQPage` on FAQ-primary pages — but it
  changes a shipped page's structured data for no measured gain, so it is a
  question for Rhan rather than a silent edit. See *Waiting on Rhan*.
- **No content collection and no scraper.** Nine hand-curated Q&A pairs are a
  named array in frontmatter, which is what the Sanity sweep wants. Same
  reasoning as the video centre's nine.
- **The live page's single category heading ("Family Law & Divorce") is
  dropped.** One category is not a taxonomy, and a lone group label above an
  already-labelled section is noise. If the firm ever adds a second category, it
  comes back.
- **The page reuses `WhatDrivesUs`**, as `/video-center/` does — Rhan's plan.
  It is now on **seven** pages.

---

## Verified

All measured against `python3 -m http.server` from inside `dist/`, and diffed
against a `dist/` snapshot built from `HEAD` with the branch's work stashed.

- Build **91 pages**. **Of the 90 pre-existing pages, exactly ZERO bodies
  changed** — byte-identical `<body>` on all 90.
- **CSS rule sets**: `/blog/` 394 / 394, `/video-center/` 341 / 341,
  `/testimonials/` 372 / 372, all identical. The homepage went **722 → 724**,
  and the two new rules are both `.faq--flush`, **a class the homepage never
  renders**. That is unavoidable rather than sloppy: the section markup is
  authored in `Faq.astro`, so Astro scopes the rule to that component's hash and
  bundles its whole stylesheet wherever the component appears. Two dead
  declarations was the price of not writing the grid twice.
- `scripts/checks/faq.js`: **41 / 41**. Nine questions, one `h1`, head
  suppressed, section still labelled, one `FAQPage` block whose nine entities
  match the markup **question-by-question and answer-by-answer**, no empty or
  truncated answers, no surviving "factors mentioned above", one panel open on
  load, and every one of the nine opening, rendering a visible panel, and
  closing the other eight.
- `scripts/checks/video-center.js` **60 / 60** and `blog-index.js` **46 / 46**
  still pass against the new build.
- **Zero console errors or warnings**, measured with a collector injected via
  `Page.addScriptToEvaluateOnNewDocument` before `goto`. Seven images, none
  broken.
- No horizontal overflow at **1920 / 1441 / 1440 / 1000 / 768 / 650 / 430**.
- **The seam matches `/video-center/` exactly** — 8px from the page header's
  bottom to the first row of content, on both pages, at 1600.
- **Sitewide link sweep: 107 distinct internal hrefs, 4 unresolved**, down from
  5. `/faq/` resolves and is linked from **90 of 91 pages**; the one page
  without it is `/admin/`, which renders no site chrome. It marks its own nav
  item `is-active` / `aria-current="page"` for free — `isActive` prefix-matches,
  so **no nav edit was needed**.
- **Font swap: no new reflow.** At 1440 the only shift is the known
  `WhatDrivesUs` one. At 430 the tool also lists three `.faq__a` panels — those
  are **closed** panels, and `::details-content` is `block-size: 0; overflow:
  hidden`, so they contribute nothing to layout. The proof is the body delta:
  `/faq/` reflows −27px at 430, **identical to `/video-center/` and `/blog/`**,
  which is the sitewide chrome. If the closed panels counted, it would exceed it.

---

## Things that would surprise you

- **The live `/faq/` has NINE questions, not ten.** Flattening the page to text
  and counting headings gives ten, because one answer wraps in a way that reads
  as a question. Count `data-key` attributes on the `li` elements instead — the
  page's own item ids — which is what settled it.
- **`/faq/` has no `data-content` blocks at all**, so `AGENTS.md`'s "enumerate
  the containers before extracting" rule finds nothing to enumerate. The content
  is in `#FAQSystemS1`, a Scorpion FAQ widget, with each pair as
  `.qst strong` + `.ans .cnt-stl`. It is **not** the About Us pages' shape.
- **`dieyelaw.com/sitemap.xml` 301s.** `curl` without `-L` returns 162 bytes of
  nginx redirect HTML and greps clean, which looks exactly like "the page isn't
  in the sitemap". It is: `https://www.dieyelaw.com/faq/`. Use `curl -sL`.
- **The FAQ block at the foot of the About Us pages is NOT this page.** That one
  is sitewide boilerplate and `AGENTS.md` says to exclude it. This is the real
  section, at its own URL, in the sitemap.
- **A `<details>` that renders open cannot be opened by clicking it.** The first
  panel is open on load, so a check that clicks each summary in turn reports
  "answer 1 opens: false" — the click closed it. `faq.js` collapses the group
  before its loop. Cost one confusing red line.
- **`npm run probe` output is not valid JSON on its own** — npm prepends its own
  lines. Pipe through `sed -n '/^{/,$p'` before `json.load`.
- **`cd dist` in one Bash call persists into the next one**, so a later
  `ls scripts/` fails with "No such file or directory" while `npm run` keeps
  working (npm walks up for `package.json`). Use absolute paths.
- **`npx serve -s dist` silently serves the homepage for any path.** The `-s`
  flag rewrites to `index.html`, so a probe reports the wrong page's DOM while
  `curl` returns 200. Use `python3 -m http.server` from inside `dist/`.
- **`npm run shot --out <name>` writes to the repo root, not `.screenshots/`.**
  Pass a path.
- **`npm run shot` and `npm run probe` force lazy images to load**, so a probe
  reports every image as `loading="eager"`. Check `dist/` for the truth.
- **The headless lib drops CDP events**, so there is no console-error check in
  `scripts/checks/`. Inject a collector via
  `Page.addScriptToEvaluateOnNewDocument` before `goto`.
- **`RESERVED` at module scope fails.** Astro builds `getStaticPaths` into its
  own prerender chunk, where a module-level const is not defined. Declare it
  inside the function. **Any new root-level page must be added to it** — `/faq/`
  was, and a `locations` entry named `faq` would otherwise have silently
  overwritten this page's `index.html`.
- **`scripts/checks/video-modal.js` fails one assertion, and did before this
  branch.** Its "no iframes before click" counts *every* iframe, and the sitewide
  Contact section carries the Google map — so it reports 16 / 1 on the homepage
  in both the baseline and the current build. `video-center.js` states the
  invariant as "no **Wistia** iframe before click" and separately asserts the map
  is the only pre-click frame. Fixing `video-modal.js` is a one-line change
  nobody has made; leave it failing rather than making it pass without deciding.
- **`scripts/checks/blog-forms.js` does not apply to `/faq/`.** It asserts *two*
  lead forms and errors with "expected 2 lead forms, found 1". It is a check for
  the two-form page shapes (blog posts, practice areas, locations).
- **The interior `h1` reflows on font swap**, ~58px at 1440, sitewide.
- **`/family-law/` is a content page and `/practice-areas/` is the index.**
  `locations` versus `firmDetails.serviceAreas` is the same trap.
- **`CLAUDE.md` is a symlink to `AGENTS.md`.** Edit `AGENTS.md`.
- **Rhan runs the dev server from his IDE.** Check 4321 before starting a second.

---

## Waiting on Rhan

1. **The lead form still has no endpoint.** `lead-form.ts` cancels submission
   and confirms inline, so `/thank-you/` is unreachable.
2. **`/thank-you/` says nothing about what happens next** — no response time, no
   "call us if it's urgent". The wording is a commitment on the firm's behalf.
3. **Should the homepage keep its `FAQPage` JSON-LD now that `/faq/` exists?**
   Google prefers the markup on a page whose primary content is the FAQ. One
   line either way; not changed unilaterally because it alters a shipped page's
   structured data.
4. **The nine questions are not headings.** They are `<summary>` text, so a
   screen-reader user navigating by heading skips all nine. `<details>` is
   natively keyboard-operable and announced with its expanded state, so this is
   an affordance rather than a WCAG failure — but on a page that is *nothing but*
   questions it is worth having. The fix is an `h2` or `h3` inside each
   `<summary>`, and it would change the homepage too, which is why it is here
   rather than done.
5. **`VideoObject` markup needs data only the firm has** — an upload date and a
   one-line description per video, and ideally a real frame from each as the
   thumbnail.
6. **The `/testimonials/` video tile is still a placeholder.** Labelled "Video
   Testimonial" / "Watch their story" over a stock-photo poster of a man
   unconnected to the firm, playing the firm's own About Us video. The poster
   question was closed on 2026-08-18; the label question was not.
7. **Authored strings with no comp behind them** — now including **`/faq/`'s
   kicker ("Common Questions"), deck, page title and meta description**, plus
   `/video-center/`'s kicker and deck, and the title and meta description on
   `/thank-you/`, `/testimonials/`, `/contact-us/`,
   `/about-us/choosing-a-family-law-attorney/`, and the A–Z section head on
   `/practice-areas/`.
8. **26 of the 32 practice-area pages and 26 of the 32 location pages close with
   a "come talk to us" section.** Kept deliberately — six end on real content
   that must survive. Trivial to strip later, impossible to recover if dropped.
9. **FAQ answers flatten to one paragraph** in `PracticeAreaFaqs`, which
    renders `<p>{answer}</p>` — 14 pages, ~37 answers. **This does not affect
    `/faq/`**: all nine of its answers are single paragraphs at source. Fixing it
    changes a component 64 routes render.
10. **The source FAQ headings on the practice-area pages are more specific than
    the rendered one.** Five say "Frequently Asked Questions About Divorce in
    Harris County". A `faqsHeading` field would fix it.
11. **`modifications-enforcement` is 290 words**, the thinnest practice area and
    the only one where the sidebar overhangs the article.
12. **The August blog post is categorised by us, not the client**
    (`child-custody` via `CATEGORY_OVERRIDES`) and still has no artwork.
13. **Two near-duplicate blog posts** — `understanding-child-custody-laws`
    (2025-01) and `understanding-child-custody-laws-in-pearland-texas` (2026-07).

**Closed at Rhan's direction on 2026-08-18**, and deliberately no longer
tracked: the stock-photo testimonial poster, the two CMS-truncated reviews,
attorney review of the Key Takeaways, confirming the "500+ Families Helped" /
"5.0 Stars" / "17+ Years" claims, and **sending the firm
`docs/live-site-corrections.md`**. Recorded so a later session reopens them by
decision rather than by rediscovery.

**On that last one:** all three corrections are applied on the new site and
verified in the repo, so nothing here is outstanding as work. What was being
tracked was telling the firm so their live pages get fixed too — Rhan's call,
and not ours to chase. **`docs/live-site-corrections.md` stays**, because
`AGENTS.md` points at it as the place to log any further departure from the
client's published prose. Do not delete the file; just don't re-raise sending
it.

---

## Known issues

- **`WhatDrivesUs` reflows on font swap.** "Direct, Personal Attention" goes
  from one line to two when the real face loads, a 30px shift — **now on seven
  pages**, `/faq/` being the seventh. A CLS hit worth fixing before launch. The
  interior `h1` reflow is the same class of problem and is sitewide.
- **The homepage carries two dead `.faq--flush` rules.** See *Verified* for why
  they cannot live anywhere else. ~60 bytes.
- **`scripts/checks/video-modal.js` reports 16 / 1.** Pre-existing.
- **`/about-us/` passes no `canonical`.** It and `/` are the only two built pages
  that don't. One-line fix.
- **`/about-us/` and `/blog/` carry no JSON-LD at all.** `/about-us/` is the
  canonical entity page for Papa Dieye and has no `Person`/`Attorney` markup.
- **The `/practice-areas/` hero is 1247×741**, so it upscales about 1.5× across
  a full-bleed band at 1920. Rhan chose the image knowing this.
- **The office map is a bare Google embed**, on `/contact-us/` and on every
  content page via the shared section. It sets third-party cookies everywhere and
  is the last holdout of the click-to-load rule. `/faq/` added no new embed.
- **No location page carries an image.** The 32 are text and chrome only.

---

## Carry into the Sanity pass

**The FAQs want a `faq` document type** — `question`, `answer` (Portable Text,
so a multi-paragraph answer survives), `category`, `order`, and a flag or a
separate short field for the homepage's condensed version. **The two wordings
are a feature, not a sync bug**, so whatever models this has to hold both: the
client's full answer and our shortened one, on the same document. Today they are
two named arrays — the condensed six in `home/Faq.astro`, the full nine in
`pages/faq.astro`. The note about the recast question must travel with the
document it belongs to.

**The nine videos want a `video` document type** — `wistiaId`, `title`, `label`,
`poster`, `aspect`, and eventually `uploadDate` and `description` so
`VideoObject` becomes possible. **The poster ORDER carries a design constraint a
CMS sort will lose**, so it needs an explicit order field and the comment in
`VideoGrid.astro` needs to travel with it. `home/VideoReels.astro` holds six of
the same videos with different titles and portrait posters; both should read one
collection.

**`InteriorShell`, `InteriorHeader` and `TreeNav` are the interior template.**
Anything modelled later that renders long-form copy with a rail should use them.

**The `locations` collection wants a `locationPage` document type.** `location`
and `parent` both become references. The four `firmDetails.serviceAreas` entries
should become references to the four root documents.

**The 14 reviews want a `testimonial` document type** — `lead`, `body`, `name`,
`matter`, and an optional video reference. `matter` is our categorisation and
should become a reference to the practice-area document.

**`/about-us/choosing-a-family-law-attorney/`'s copy is already Sanity-shaped** —
a named `sections` array of `{heading, paragraphs[]}`. The four deviations at the
top of the file are the editorial record that should travel with it.

**The Google Maps CID is a constant in `firmDetails.ts`**, not a field on the
singleton. It should become one.

**"Updated on" instead of "Posted on"** for blog posts: an optional `updated`
field, the card picking its label from it, and `dateModified` in the
`BlogPosting` JSON-LD. Both dates need `timeZone: "UTC"`.

**All three collections are already the shape Sanity needs.** Categories are
still derived from posts, not modelled.

**`/contact-us/` reads everything factual from `firmDetails`**, so it needs no
work in the sweep.

---

## Redirects in place

| From | To | Why |
|---|---|---|
| `/about-us/papa-dieye` + `/` | `/about-us/` | Bio moved up; live stub had no content |
| `/about-us/the-difference` + `/` | `/about-us/` | Folded into the bio page |
| `/video-center/the-dieye-firm` + `/` | `/video-center/` | Category page folded into the index |
| 3 × `/video-center/the-dieye-firm/<video>` + `/` | `/video-center/` | Detail pages folded in; no copy existed to keep them |
| 16 × `/blog/<year>/<month>/<truncated-slug>` | `/blog/<full-slug>/` | Scorpion cut slugs mid-word |

**Both slash forms are present** for the video-centre and About Us rules, since
Vercel applies `redirects` before its own trailing-slash normalisation and a
single form can silently never fire. The 16 blog rules carry only one form
each — pre-existing, and worth a look if any of them ever misses.

**`/faq/`, the practice areas and the location pages need none** — all three
match the live site's URLs exactly. `/sugar-land-family-law/*` is deliberately
absent: it is not in the sitemap.

---

## Known dangling routes

| Link | Lives in | Lands with |
|---|---|---|
| `/client-portal` | Info bar | a third-party portal, or removal |
| `/privacy-policy/` | Footer | a privacy page |
| `/disclaimer/` | Footer | a disclaimer page |
| `/sitemap/` | Footer | an HTML sitemap, or point it at `/sitemap.xml` |

**`/faq/` is off this list**, and the four above are everything that remains — a
full sweep of all 107 distinct internal hrefs across the 91 built pages finds
nothing else. Nothing links to `/thank-you/` yet, and that is correct: it is a
form destination, not a nav item.

All three scrapers print their own dangling list on every run.
