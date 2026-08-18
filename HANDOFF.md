# Handoff

**This file is rewritten, never appended.** Git is the history; this is only the
present. A stale line here is a wrong line — delete it rather than leaving it.

Rules and conventions live in `AGENTS.md` and don't belong here. This file is
only what's true right now.

_Last rewritten: 2026-08-18, on the `final_pages_and_loose_ends` branch._

---

## Start here

**Every page is built.** `/privacy-policy/`, `/sitemap/`, `/client-portal/` and
a `404` all landed this session, and `/disclaimer/` was dropped rather than
built. **A sweep of all 107 distinct internal hrefs across 95 built pages finds
ZERO unresolved links** — the first time that has been true.

**The next phase is the Sanity content-modelling pass.** Before starting it,
work the checklist below. It came out of a full audit of the codebase, and the
first two items were live defects nobody had filed.

### Fixed this session — was the audit's blocker list

1. ~~**Seven fabricated client testimonials.**~~ Fixed. See below.
2. ~~**All 16 blog redirects pointed at the wrong slash form.**~~ Fixed.
3. ~~**No 404 page.**~~ Built.
4. ~~**The Sanity Studio was indexable.**~~ `X-Robots-Tag: noindex` in `vercel.json`.
5. ~~**`/` and `/about-us/` had no canonical.**~~ Both have one; `/admin` is the
   only page without, and it is now `noindex`.
6. ~~**`video-modal.js` reported 16/1 forever.**~~ Now 18/18.

### Still to do before the Sanity pass

1. **The lead form has no endpoint.** `lead-form.ts` cancels submission and
   confirms inline, so `/thank-you/` is unreachable. Unchanged for weeks and
   still the only thing between the site and a real enquiry. It needs a decision
   about where leads go.
2. **`robots.txt` and `sitemap.xml` do not exist.** No `@astrojs/sitemap`
   integration, so 95 pages are unannounced. **Deliberately left** — `Layout`'s
   own comment defers the full editable SEO layer (global defaults, sitemap,
   robots, editor-managed redirects) to a later pass, and there is a
   `new-seo-setup` skill that builds exactly that. Doing it piecemeal now means
   doing it twice. **But it must not ship without them**, so it is either that
   pass or a deliberate stopgap.
3. **`og:image` is on 15 of 95 pages.** The other 80 share as a blank card.
   Better done in the Sanity pass, where a per-page image field supplies it.
4. **`/thank-you/`, `/about-us/` and `/blog/` carry no JSON-LD.** `/about-us/`
   is the canonical entity page for Papa and has no `Person`/`Attorney` markup.
5. **10 pages skip a heading level** (h1 → h3): 8 practice areas, one location
   page, and `/contact-us/`. The practice-area ones come from the client's own
   scraped headings; `/contact-us/` is ours and is the one to fix by hand.

---

## Where we are

Branch `final_pages_and_loose_ends`. **`c32147f "working commit"` holds the
first half of the session** (the three pages, the footer logo, the PDF). The
audit fixes below are **uncommitted**.

Build passes at **95 pages** (was 91 at the start of the session).

| | |
|---|---|
| New | `src/components/testimonials/reviews.ts` — the 14 real reviews, extracted |
| New | `src/pages/404.astro` |
| Changed | `src/components/home/Testimonials.astro` — six invented reviews → six real |
| Changed | `src/components/home/About.astro` — invented pull-quote → real |
| Changed | `src/components/testimonials/ReviewWall.astro` — now imports the array |
| Changed | `src/pages/index.astro`, `src/pages/about-us/index.astro` — canonical |
| Changed | `vercel.json` — 28 → 46 redirects, plus a `headers` block |
| Changed | `scripts/checks/video-modal.js` — the iframe assertion |

---

## What landed this session

### The three remaining pages, and one that was never owed

- **`/privacy-policy/`** — the firm's own published policy, verbatim. Proved by
  diffing the rendered body against the live source: **exact string match** after
  three documented deviations (curled quotes; NAP rendered from `firmDetails`;
  the headings are the client's own).
- **`/sitemap/`** — the interior template, with every row **derived** from the
  three collections. Lists 91 pages; excludes exactly `/admin/`, `/thank-you/`
  and itself.
- **`/client-portal/`** — no comp and no live page, so the copy is deliberately
  thin signposting. Three actions: the intake PDF, MyCase login, MyCase payment.
  Grouped **New clients** / **Existing clients** because the info bar link says
  only "Client Portal" and both audiences arrive from it.
- **`/disclaimer/` was dropped, not built.** It has never existed on
  dieyelaw.com — 404, as are `/legal-disclaimer/`, `/terms/`, `/terms-of-use/` —
  and the live footer links only `/privacy-policy/`. The link was ours, pointing
  at nothing. Removed from `firmDetails.legalLinks` at Rhan's direction rather
  than filled with invented legal text.

### The intake PDF is at the live site's own path

`public/documents/Client-Intake-for-website.pdf`, byte-identical to the file
already served at `dieyelaw.com/documents/Client-Intake-for-website.pdf`, **at
the same path**, so existing bookmarks and inbound links keep resolving.

### Seven fabricated client testimonials, removed

**This was the most serious thing in the codebase and it was in nobody's notes.**

`home/Testimonials.astro` held **six invented reviews attributed to invented
people** — Danielle, Marcus, Renee, Anthony, Simone, Curtis — under its own
`PLACEHOLDER COPY … replace before launch` header. `home/About.astro` held a
**seventh**, "Danielle R. / Divorce & Custody", under a five-star graphic, with
**no placeholder note of any kind**, which is why it outlived the other six.

Both render on `/` and `/about-us/`. Meanwhile the **14 real, published reviews**
sat in `ReviewWall.astro`, used only by `/testimonials/`.

For a law firm this is a Texas Bar advertising exposure before it is a content
problem. One mercy: **none of it reached JSON-LD** — there is no `Review` or
`AggregateRating` markup anywhere on the site, so the fabrications were never
asserted to Google as structured data.

**The fix was to extract, not to copy.** `testimonials/reviews.ts` now holds the
14 and their whole provenance note; `ReviewWall`, `home/Testimonials` and
`home/About` all read it. The extraction was **proved a no-op first** —
`/testimonials/` rendered a byte-identical body with 14 cards — before anything
new depended on it.

The homepage's six are selected **by `(name, matter)` through a `pick()` that
throws on a miss**, so a reorder or re-word in `reviews.ts` fails the build
rather than silently changing which reviews the homepage shows.

### All 16 blog redirects were pointed at the slash form that gets no traffic

Tested against the live host:

- `/blog/2026/april/preparing-emotionally-for-mediation` → **301**
- `/blog/2026/april/preparing-emotionally-for-mediation/` → **200**

So the canonical legacy URL — the one Google indexed — is the **slashed** one,
and all 16 rules in `vercel.json` used only the **unslashed** source. Vercel
applies `redirects` before trailing-slash normalisation, so the URL that
actually carries the equity never matched, and 16 posts would have 404'd at
cutover. Exactly the failure `AGENTS.md` warns about.

**All 46 rules now carry both slash forms**, verified programmatically, and
every destination resolves to a built page.

### `/site-map/` earned a redirect

It **is** in the live sitemap (one of its 121 URLs), so by `AGENTS.md`'s equity
test it is owed one, and now has one to `/sitemap/` in both slash forms.
`/privacy-policy/` is **not** in that sitemap, so it correctly gets nothing.

---

## Decisions made — don't relitigate

- **The 14 reviews became a module, not a copy.** Two consumers of the same data
  is the threshold — the same call `TreeNav` and `scripts/lib/html.mjs` record.
  It is also exactly the shape the Sanity `testimonial` type wants.
- **The homepage's six exclude every review that repeats its own pull-quote.**
  Six of the 14 do. The wall tolerates it (exception 1 in `reviews.ts` only drops
  a repeated sentence where it *stands alone*, and in those six it is embedded
  mid-sentence where cutting it would mangle the client's grammar). On three
  side-by-side cards the repetition is the first thing the eye catches, so the
  eight that don't repeat are the pool. **Kim is deliberately excluded** — she is
  the About section's pull-quote, and both sections render on the homepage.
- **There is no Child Support review on the homepage** because no real review
  names child support. The matter is absent rather than filled.
- **`btn--outline` was added to `global.css`**, not scoped to one page.
  `btn--ghost` is white-on-transparent for dark backgrounds and was invisible on
  `/client-portal/`'s white. Added when a consumer needed it, the way `Awards`
  gained `tone` for `/thank-you/`.
- **`/admin` is `noindex`ed by a response header, not a meta tag.**
  `@sanity/astro` injects that route and we control no `<head>` in it.
- **The 404 carries `noindex` and NO canonical.** A canonical on an error page
  tells Google the URL is legitimate, which contradicts the `noindex` above it.
- **`video-modal.js` now asserts "no *Wistia* iframe before click"**, matching
  `video-center.js`, and asserts the map separately. The strict form counted the
  sitewide Google map and failed identically in the baseline — a check that cries
  wolf. The map stays visible as its own assertion rather than hidden by a looser
  one.
- **`robots.txt` / `sitemap.xml` were deliberately NOT added.** See item 2 above.

---

## Verified

Served from `dist/` via `python3 -m http.server`, and diffed against a `dist/`
built from `HEAD` with the branch's work stashed.

- Build **95 pages**, no console errors or warnings and no failed requests on
  `/`, `/about-us/`, `/404.html`, `/client-portal/`, `/sitemap/`,
  `/privacy-policy/`. No broken images.
- **Sitewide link sweep: 107 distinct internal hrefs, ZERO unresolved.**
- **Zero invented names remain in the build** — Danielle, Marcus, Renee,
  Anthony, Simone, Curtis all return 0 pages.
- **No review is printed twice on the homepage** (checked by lead text, not name
  — three reviews are attributed "Former Client").
- The reviews extraction rendered `/testimonials/` **byte-identically**, 14 cards
  before and after.
- Checks: `faq` **41/41**, `video-center` **60/60**, `blog-index` **46/46**,
  `blog-forms` **19/19**, `video-modal` **18/18** (was 16/1),
  `privacy-policy` passing.
- No horizontal overflow at **1920 / 1441 / 1440 / 1000 / 768 / 650 / 430** on
  `/`, `/about-us/`, `/404.html`, `/testimonials/`, `/client-portal/`,
  `/sitemap/`, `/blog/`, `/family-law/divorce/`, `/faq/`.
- **All 46 redirect rules carry both slash forms**; all 19 destinations are built
  pages; no redirect source shadows a real page.
- The intake PDF serves at 200, `application/pdf`, and is byte-identical
  (`a1b2430…`) to the firm's own live copy.
- On the earlier round: of the 91 pre-existing pages, **zero changed beyond the
  footer and the client-portal href**.

---

## Things that would surprise you

- **A running dev server NEVER sees a Sanity content edit.** `getFirmDetails()`
  memoises for the life of the process. The Studio, the CLI and `dist/` all show
  the new value while `:4321` shows the old one, so every symptom points at the
  edit having failed. Cost real time twice in one session. Now in `AGENTS.md`.
- **`AGENTS.md`'s `data-content` grep is id-anchored and misses id-less blocks.**
  `/privacy-policy/` has exactly one content container and the documented
  `grep -o 'id="[A-Za-z0-9_]*"[^>]*data-content'` reports none, because that
  div carries no id. Measure the section against the block instead.
- **`dieyelaw.com/sitemap.xml` 301s** — `curl` without `-L` returns 162 bytes of
  nginx redirect HTML and greps clean, which looks exactly like "not in the
  sitemap". Use `curl -sL`. It has 121 URLs.
- **The two MyCase links use different subdomains** — `dieylaw.mycase.com` (no
  "e") in the Access Your Case redirect_uri, `dieyelaw.mycase.com` in Pay Now.
  **Both return 200**, so it is probably how MyCase provisioned them, but it
  looks like a typo and is not ours to normalise. See *Waiting on Rhan*.
- **`elite-white.svg` exists twice** — `public/` and `src/assets/logos/`,
  differing only by a trailing newline. The `public/` copy predates the other and
  is cited by `src/sanity/components/EliteMark.tsx` as the source it extracted
  the Studio emblem from. **Not a stray; don't delete it.**
- **`npm run probe` output is not valid JSON on its own** — npm prepends lines.
  Pipe through `sed -n '/^{/,$p'`.
- **npm's PATH shimming can clobber `sed`/`python3` inside a shell loop.** Use
  absolute paths (`/usr/bin/sed`) when piping probe output in a `for`.
- **`npm run shot` crops to the element box**, so an element flush with its
  container's right edge looks clipped when it isn't. Measure with `probe`
  before believing a screenshot.
- **The headless lib drops CDP events**, so console-error collection needs its
  own subscriber armed before `Page.navigate`.
- **`RESERVED` must be declared inside `getStaticPaths`.** Any new root-level
  page goes in it — `client-portal`, `sitemap` and `privacy-policy` all were.
- **`npx serve -s dist` silently serves the homepage for any path.** Use
  `python3 -m http.server` from inside `dist/`.
- **`cd dist` in one Bash call persists into the next.** Use absolute paths.
- **`CLAUDE.md` is a symlink to `AGENTS.md`.** Edit `AGENTS.md`.
- **Rhan runs the dev server from his IDE.** Check 4321 before starting a second.

---

## Waiting on Rhan

1. **The lead form still has no endpoint.** `/thank-you/` is unreachable.
2. **`/thank-you/` says nothing about what happens next** — no response time, no
   "call us if it's urgent". The wording is a commitment on the firm's behalf.
3. **Confirm the MyCase subdomain split** — `dieylaw` vs `dieyelaw`. Both work;
   flagging because one looks like a typo and it controls an OAuth callback.
4. **Should the homepage keep its `FAQPage` JSON-LD now that `/faq/` exists?**
   One line either way; not changed unilaterally.
5. **The nine FAQ questions are not headings.** They are `<summary>` text, so a
   screen-reader user navigating by heading skips all nine. An affordance rather
   than a WCAG failure, but worth having on a page that is nothing but questions.
   Would change the homepage too.
6. **`VideoObject` markup needs data only the firm has** — upload date, a
   one-line description per video, and ideally a real frame as the thumbnail.
7. **The `/testimonials/` video tile is still a placeholder.** Labelled "Video
   Testimonial" / "Watch their story" over a stock-photo poster of a man
   unconnected to the firm, playing the firm's own About Us video. The poster
   question was closed on 2026-08-18; the label question was not.
8. **Authored strings with no comp behind them** — `/client-portal/`'s copy in
   full, `/sitemap/`'s and `/faq/`'s kickers and decks, the 404's copy, plus the
   titles and meta descriptions on `/thank-you/`, `/testimonials/`,
   `/contact-us/` and `/about-us/choosing-a-family-law-attorney/`.
9. **26 of the 32 practice-area pages and 26 of the 32 location pages close with
   a "come talk to us" section.** Kept deliberately — six end on real content
   that must survive. Trivial to strip later, impossible to recover if dropped.
10. **FAQ answers flatten to one paragraph** in `PracticeAreaFaqs` — 14 pages,
    ~37 answers. Fixing it changes a component 64 routes render.
11. **The source FAQ headings on the practice-area pages are more specific than
    the rendered one.** A `faqsHeading` field would fix it.
12. **`modifications-enforcement` is 290 words**, the thinnest practice area and
    the only one where the sidebar overhangs the article.
13. **The August blog post is categorised by us, not the client**
    (`child-custody` via `CATEGORY_OVERRIDES`) and still has no artwork.
14. **Two near-duplicate blog posts** — `understanding-child-custody-laws`
    (2025-01) and `understanding-child-custody-laws-in-pearland-texas` (2026-07).

**Closed at Rhan's direction on 2026-08-18**, and deliberately no longer
tracked: the stock-photo testimonial poster, the two CMS-truncated reviews,
attorney review of the Key Takeaways, confirming the "500+ Families Helped" /
"5.0 Stars" / "17+ Years" claims, and sending the firm
`docs/live-site-corrections.md`.

**On that last one:** all three corrections are applied on the new site and
verified in the repo, so nothing is outstanding as work. What was tracked was
telling the firm so their live pages get fixed too — Rhan's call, not ours to
chase. **`docs/live-site-corrections.md` stays**, because `AGENTS.md` points at
it as the place to log any further departure from the client's published prose.

---

## Known issues

- **`WhatDrivesUs` reflows on font swap.** "Direct, Personal Attention" goes from
  one line to two when the real face loads, a 30px shift. **On 8 pages** —
  counted in the build on the string "Direct, Personal Attention", not from the
  import list, because the homepage renders it through a home component and does
  not import it directly: `/`, `/about-us/`,
  `/about-us/choosing-a-family-law-attorney/`, `/blog/`, `/faq/`,
  `/practice-areas/`, `/testimonials/`, `/video-center/`. (The previous handoff
  said seven.) A CLS hit worth fixing before launch. The interior `h1` reflow
  (~58px at 1440) is the same class of problem and is sitewide.
- **The homepage carries two dead `.faq--flush` rules.** ~60 bytes. Unavoidable:
  the markup is authored in `Faq.astro`, so Astro bundles that component's whole
  stylesheet wherever it appears.
- **The office map is a bare Google embed on 92 pages**, loading at parse time
  and setting third-party cookies sitewide. The last holdout of the
  click-to-load rule, and now asserted explicitly by `video-modal.js`.
- **`fetchpriority="high"` is set on 7 pages.** The rest have no hero image —
  their LCP is text and the only eager image is the header logo — so this is
  probably correct, but it has not been measured.
- **The `/practice-areas/` hero is 1247×741**, so it upscales ~1.5× across a
  full-bleed band at 1920. Rhan chose the image knowing this.
- **No location page carries an image.** The 32 are text and chrome only.

---

## Carry into the Sanity pass

**`testimonials/reviews.ts` is already the `testimonial` document type** —
`lead`, `body`, `name`, `matter`, plus an optional video reference. `matter` is
our categorisation and should become a reference to the practice-area document.
The provenance note and the three exceptions must travel with the documents.
**The rule that nothing here may be invented has to survive the migration**: it
is the thing that failed once already.

**The FAQs want a `faq` document type** — `question`, `answer` (Portable Text, so
a multi-paragraph answer survives), `category`, `order`, and a flag or separate
short field for the homepage's condensed version. **The two wordings are a
feature, not a sync bug.**

**The nine videos want a `video` document type** — `wistiaId`, `title`, `label`,
`poster`, `aspect`, and eventually `uploadDate` and `description` so
`VideoObject` becomes possible. **The poster ORDER carries a design constraint a
CMS sort will lose**, so it needs an explicit order field.

**The `locations` collection wants a `locationPage` document type.** `location`
and `parent` both become references; the four `firmDetails.serviceAreas` entries
become references to the four root documents.

**`/privacy-policy/`, `/client-portal/` and `/sitemap/` are all named arrays in
frontmatter**, in the shape the sweep wants. `/sitemap/` is the exception that
should stay derived — it is generated from the collections, and modelling it
would replace something self-maintaining with something that goes stale.

**`/about-us/choosing-a-family-law-attorney/`'s copy is already Sanity-shaped** —
a named `sections` array of `{heading, paragraphs[]}`.

**The Google Maps CID is a constant in `firmDetails.ts`**, not a field. It should
become one. Same for the intake PDF path, which is currently a literal in
`client-portal.astro`.

**"Updated on" instead of "Posted on"** for blog posts: an optional `updated`
field, the card picking its label from it, and `dateModified` in the
`BlogPosting` JSON-LD. Both dates need `timeZone: "UTC"`.

**`/contact-us/` reads everything factual from `firmDetails`**, so it needs no
work in the sweep.

---

## Redirects in place

**46 rules, every one in both slash forms.**

| From | To | Why |
|---|---|---|
| `/about-us/papa-dieye` | `/about-us/` | Bio moved up; live stub had no content |
| `/about-us/the-difference` | `/about-us/` | Folded into the bio page |
| `/video-center/the-dieye-firm` | `/video-center/` | Category page folded into the index |
| 3 × `/video-center/the-dieye-firm/<video>` | `/video-center/` | Detail pages folded in |
| 16 × `/blog/<year>/<month>/<truncated-slug>` | `/blog/<full-slug>/` | Scorpion cut slugs mid-word |
| `/site-map` | `/sitemap/` | In the live sitemap, so it carries equity |

**`/privacy-policy/`, `/client-portal/`, the practice areas and the location
pages need none** — all match the live site's URLs exactly, or never existed
there. `/sugar-land-family-law/*` is deliberately absent: not in the sitemap.

`vercel.json` also carries one `headers` rule: `X-Robots-Tag: noindex, nofollow`
on `/admin(/.*)?`.

---

## Known dangling routes

**None.** A sweep of all 107 distinct internal hrefs across the 95 built pages
finds nothing unresolved. `/client-portal`, `/privacy-policy/`, `/sitemap/` and
`/disclaimer/` are all off this list — the first three built, the fourth removed.

Nothing links to `/thank-you/`, and that is correct: it is a form destination,
not a nav item.

All three scrapers print their own dangling list on every run.
