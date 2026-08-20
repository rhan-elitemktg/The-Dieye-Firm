/* scrape-locations.mjs — one-time ingest of the dieyelaw.com location pages:
 * 32 pages across four service areas, ~41,000 words.
 *
 * Third sibling of scrape-blog.mjs and scrape-practice-areas.mjs. The shared
 * parsing kit lives in scripts/lib/html.mjs; what is here is what these pages
 * do differently, and it is more than the family-law section did:
 *
 *   1. BODY COPY IS IN ONE CONTAINER. #MainContent holds all of it. These
 *      pages carry ColumnContentExpand_1..8 blocks like the practice areas do,
 *      but they are EMPTY STUBS of about two words each — Scorpion chrome with
 *      nothing in it. Copying the practice-area scraper's two-container logic
 *      would have appended eight fragments of boilerplate to every page. The
 *      assumption is checked every run rather than believed; see extractPage.
 *   2. The Harris County root and .../child-support/ use a different widget
 *      again: #ContentS4 WRAPS #MainContent, with ContentS4_1..4 inside it.
 *      sliceElement is nesting-aware, so #MainContent still captures the lot.
 *   3. NO FAQPage MICRODATA ANYWHERE. About 24 of the 32 pages carry a real
 *      FAQ, but as plain <h2>/<h3> markup — the practice-area extractor, which
 *      slices itemtype="…/FAQPage", finds nothing on all 32. So the microdata
 *      pass runs first and yields, and a heading-based pass does the work. See
 *      extractFaqHeadings for the exact rule and the audit it prints.
 *   4. THE PAGES SIT AT FOUR DIFFERENT DEPTHS, so relative hrefs resolve
 *      against the page they are on rather than one hardcoded base.
 *   5. Two pages hang off the site root but belong to Pasadena. LOCATION_
 *      OVERRIDES puts them in that menu; their URLs do not move.
 *
 * WE READ THE LIVE SITE. Enumeration is from dieyelaw.com/sitemap.xml. There is
 * no SiteSucker mirror of this section to cross-check against, so instead the
 * run sweeps the sitemap for any root-level "-attorney"/"-lawyer" path that no
 * location claimed and reports it — which is exactly how the two Pasadena
 * orphans would be found again if nobody had read the sitemap by hand.
 *
 * URLs are preserved exactly as the live site has them, so this section needs
 * no redirects — the same property the practice areas have.
 *
 * Fetches are cached to .loc-cache/ (gitignored). Delete it to force a refresh.
 *
 *   node scripts/legacy-scrapers/scrape-locations.mjs           # parse (uses cache)
 *   node scripts/legacy-scrapers/scrape-locations.mjs --refetch # ignore cache
 *
 * Writes: src/content/locations/**\/*.md
 */

import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  decodeEntities,
  frontmatter,
  makeCachedFetch,
  PHONE_RE,
  sliceElement,
  squash,
  stripTags,
  stripTagsSpaced,
  titleCase,
  toMarkdown,
  wordCount,
} from "../lib/html.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CACHE = path.join(ROOT, ".loc-cache");
const OUT_CONTENT = path.join(ROOT, "src/content/locations");
const PA_CONTENT = path.join(ROOT, "src/content/practice-areas");

const ORIGIN = "https://www.dieyelaw.com";
const SITEMAP = `${ORIGIN}/sitemap.xml`;
const SITE_MAP_PAGE = `${ORIGIN}/site-map/`;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const REFETCH = process.argv.includes("--refetch");

const EXPECTED_PAGES = 32;

/* The four service areas, in the order firmDetails lists them.
 *
 * `label` is the card and menu wording for the location root. It is NOT taken
 * from the site map, which calls these "Sugar Land Family Law Attorney" —
 * right for a sitemap link and wrong for a nav label, where it would repeat
 * the city on every row underneath.
 *
 * `extras` are pages that belong to a location but do not live under its path.
 * Both of Pasadena's hang off the site root. Their URLs are assets and do not
 * move; only their menu placement is ours. Same arrangement as the eight
 * re-parented practice areas: path and grouping deliberately disagree, and no
 * redirect is involved. */
const LOCATIONS = [
  { root: "harris-county-family-law-attorney", label: "Harris County", extras: [] },
  { root: "league-city-family-law-attorney", label: "League City", extras: [] },
  {
    root: "pasadena-family-law-attorney",
    label: "Pasadena",
    extras: ["pasadena-child-support-attorney", "pasadena-family-law-mediation-attorney"],
  },
  { root: "sugar-land-family-law-attorney", label: "Sugar Land", extras: [] },
];

/* KEYED ON THE FULL SLUG, NOT THE LEAF. The practice-area scraper keys its
   LABEL_FIXES on the leaf, which is safe there because every leaf is unique
   across one flat section. Here "child-custody" is a leaf under all four
   locations and "divorce" under three, so a leaf-keyed table would apply a
   Pasadena repair to Sugar Land silently. Every override table in this file is
   full-slug keyed for that reason. */
const LABEL_FIXES = {
  /* The site map calls this "Pasadena Divorce Attorney". Inside a menu that is
     already headed by Pasadena, the city is noise on every row. */
  "pasadena-family-law-attorney/pasadena-divorce-attorney": "Divorce",
  /* The two root-level Pasadena pages, named the same way for the same reason:
     they render as ordinary rows of the Pasadena menu. */
  "pasadena-child-support-attorney": "Child Support",
  "pasadena-family-law-mediation-attorney": "Family Law Mediation",
};

/* Which location's menu a page belongs in, where the URL does not say. */
const LOCATION_OVERRIDES = {
  "pasadena-child-support-attorney": "pasadena-family-law-attorney",
  "pasadena-family-law-mediation-attorney": "pasadena-family-law-attorney",
};

/* Stale internal paths in the client's own copy. The live host 301s these, but
   AGENTS.md is explicit that a link riding a redirect for the life of the site
   is the wrong outcome: rewrite to the canonical and report it. These are NOT
   in the sitemap and carry no equity of their own, so they earn no redirect
   from us — the equity is on the target, which we build at the identical URL.
   Applied as a prefix swap, since every observed case is the whole subtree. */
const PATH_FIXES = [["/sugar-land-family-law/", "/sugar-land-family-law-attorney/"]];

/* Editorial deviations from the client's published prose, keyed by full slug.
 *
 * The bar is the one AGENTS.md sets and the About Us page already applied:
 * factual errors and grammatical breakage, never voice. Em dashes, sentence
 * length and word choice are the client's and stay untouched.
 *
 *   1. "Pasadena, CA" on a Texas page. The firm is in Pearland; the page's own
 *      body says Harris County. One is a typo, not a second office.
 *   2. Eight places where "Lawyer" is grammatically broken. Same error already
 *      fixed twice on /about-us/choosing-a-family-law-attorney/, and still live
 *      on dieyelaw.com there too.
 *
 * The test for (2) is deliberately narrow, and it is the one the About page
 * used: a singular count noun carrying a PLURAL VERB ("Our Lawyer work with",
 * "Child Support Lawyer Make a Difference") or standing with NO ARTICLE where
 * one is required ("other Lawyer in Sugar Land", "use Lawyer during
 * mediation"). Both are breakage, not voice.
 *
 * Everything that merely reads oddly is left alone, and there is a lot of it:
 * "Need a Lawyer for My Custody Case?", "our Divorce Lawyer Team", "How Our
 * League City Divorce Lawyer Works With You", "you work directly with our
 * Lawyer, not just administrative staff", and four meta descriptions saying
 * "our mediation Lawyer". Every one of those is grammatical as written, so
 * changing it would be editing the client's voice — which AGENTS.md forbids.
 *
 * The list is exhaustive rather than sampled: it comes from grepping every
 * generated file for `\bLawyer\b` and reading each hit in context.
 *
 * Every entry must match at least once or the run throws. A fix that stops
 * applying means the client edited the page, and the deviation needs re-reading
 * rather than silently lapsing. */
const COPY_FIXES = {
  "pasadena-family-law-attorney/pasadena-divorce-attorney/uncontested-divorce": [
    ["Pasadena, CA", "Pasadena, TX"],
    ["with Lawyer who prioritize", "with lawyers who prioritize"],
  ],
  "sugar-land-family-law-attorney/divorce/uncontested-divorce": [
    ["sensitive Lawyer ensure", "sensitive lawyers ensure"],
    ["divorce Lawyer is skilled", "divorce lawyers are skilled"],
  ],
  "harris-county-family-law-attorney/divorce": [["Our Lawyer work", "Our lawyers work"]],
  "league-city-family-law-attorney/child-custody": [
    ["Our Lawyer analyze", "Our lawyers analyze"],
  ],
  "sugar-land-family-law-attorney/family-law-mediation": [
    ["mediation Lawyer offer", "mediation lawyers offer"],
  ],
  "sugar-land-family-law-attorney/same-sex-divorce": [
    ["Trusted Lawyer offering", "Trusted lawyers offering"],
  ],
  "sugar-land-family-law-attorney/child-support": [
    ["other Lawyer in Sugar Land", "other lawyers in Sugar Land"],
    ["Child Support Lawyer Make", "Child Support Lawyers Make"],
    ["child support Lawyer in Sugar Land", "child support lawyers in Sugar Land"],
  ],
  "league-city-family-law-attorney/divorce/divorce-mediation": [
    ["use Lawyer during", "use lawyers during"],
  ],
  /* The one phone number that is real prose rather than a CTA block: it sits
     mid-sentence inside an FAQ answer, so stripCtas rightly leaves it. The
     number still cannot be written into a file — it goes stale the day the firm
     changes it, and there is no firmDetails lookup available from frontmatter.
     Dropping the two words leaves the client's sentence intact. */
  "sugar-land-family-law-attorney": [
    ["contact us at (832) 299-1990 to arrange", "contact us to arrange"],
  ],
};

/* ---------------------------------------------------------------- fetching */

/* 400ms between live fetches, as the practice-area scraper does: 33 documents
   off the client's own host in one run. */
const cachedFetch = makeCachedFetch({
  cacheDir: CACHE, origin: ORIGIN, refetch: REFETCH, ua: UA, delayMs: 400,
});

/* ------------------------------------------------------------- extraction */

function extractPage(html, url, report) {
  const main = sliceElement(html, /<div\b[^>]*id="MainContent"[^>]*>/i, "div");
  if (!main) throw new Error(`no #MainContent — ${url}`);

  /* THE SINGLE-CONTAINER ASSUMPTION, CHECKED RATHER THAN BELIEVED — and checked
     against the content well itself, not against the one container we happen to
     know about, so a shape nobody has seen yet is still caught.

     Every page nests #MainContent inside a wrapper: #ContentZone on 30 of them,
     #ContentS4 on the Harris County root and .../child-support/. If the wrapper
     carries materially more words than #MainContent, copy is sitting outside
     what we take, which is exactly how the practice-area section hid 1,442 of
     one page's 1,832 words in #ColumnContentExpandExpanded.

     Worth knowing while reading this: the ColumnContentExpand_1..8 ids on these
     pages are NOT content containers. They are <a> and <span> elements on the
     CTA phone links, carrying Scorpion's {F:P:Cookie:…} replacement tokens.
     #ColumnContentExpandExpanded, the practice areas' real second container,
     appears on none of the 32. */
  const WRAPPERS = [["ContentZone", "div"], ["ContentS4", "section"]];
  let wrapper = null, shape = null;
  for (const [id, tag] of WRAPPERS) {
    const found = sliceElement(html, new RegExp(`<${tag}\\b[^>]*id="${id}"[^>]*>`, "i"), tag);
    if (found) { wrapper = found; shape = id; break; }
  }
  if (!wrapper) throw new Error(`no #ContentZone or #ContentS4 wrapper — ${url}`);
  const outside = wordCount(stripTagsSpaced(wrapper)) - wordCount(stripTagsSpaced(main));
  if (outside > 30) {
    throw new Error(
      `${outside} words sit inside the content wrapper but outside #MainContent on ${url}. ` +
        `These pages have always been single-container; this one now has copy elsewhere ` +
        `and extractPage needs to take it too. See the header comment.`
    );
  }
  report.containers = shape;
  report.outsideWords = outside;

  const h1m = main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1m) throw new Error(`no <h1> — ${url}`);
  const title = squash(stripTags(h1m[1]));

  const titleTag = html.match(/<title>([\s\S]*?)<\/title>/i);
  const rawSeo = titleTag ? squash(decodeEntities(titleTag[1])) : "";
  const seoTitle = rawSeo.replace(/\s*\|\s*.*$/, "").trim();

  const descM = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const description = descM
    ? squash(decodeEntities(descM[1]))
        .replace(new RegExp(`\\s*Call\\s+${PHONE_RE.source}[^.]*\\.?\\s*$`, "i"), "")
        .trim()
    : "";

  /* Everything after the h1. The first h2 in that remainder is a deck — it
     sits between the h1 and the opening paragraph and reads as a subtitle,
     not a section heading. Only treat it as one if no <p> comes first, which
     is what correctly leaves .../mothers-rights/ without one: its only h2 is
     "Frequently Asked Questions", far below the opening copy. */
  let rest = main.slice(h1m.index + h1m[0].length);
  let subtitle = "";
  const firstH2 = rest.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
  const firstP = rest.search(/<p\b/i);
  if (firstH2 && (firstP === -1 || firstH2.index < firstP)) {
    subtitle = squash(stripTags(firstH2[1]));
    rest = rest.slice(0, firstH2.index) + rest.slice(firstH2.index + firstH2[0].length);
  }

  return {
    url, title, seoTitle, description, subtitle,
    body: rest,
    sourceWords: wordCount(stripTagsSpaced(main)),
  };
}

/* ------------------------------------------------------------------- FAQs */

/* schema.org/FAQPage microdata, as the practice-area section carries on one
   page. No location page has any today. Kept as a first pass anyway: if the
   client ever pastes a real embed in, structure beats the heuristic below and
   should win without a code change. */
function extractFaqMicrodata(html) {
  const block = sliceElement(
    html,
    /<div\b[^>]*itemtype="https:\/\/schema\.org\/FAQPage"[^>]*>/i,
    "div"
  );
  if (!block) return null;

  const questions = [...block.matchAll(/<h[23][^>]*itemprop="name"[^>]*>([\s\S]*?)<\/h[23]>/gi)]
    .map((m) => squash(stripTags(m[1])));
  const answers = [...block.matchAll(/<div[^>]*itemprop="text"[^>]*>([\s\S]*?)<\/div>/gi)]
    .map((m) => squash(stripTags(m[1])));
  if (!questions.length || questions.length !== answers.length) return null;

  return {
    faqs: questions.map((q, i) => ({ question: q, answer: answers[i] })),
    html: html.replace(block, ""),
  };
}

const FAQ_HEADING = /^(frequently asked questions|faqs?\b|common(ly asked)? questions)/i;

/* The FAQ as plain markup, which is the only form these pages use.
 *
 * Runs AFTER normaliseHeadings, so the levels are settled and "h2" means what
 * it says. The rules, in the order they matter:
 *
 *   1. The heading text must START with the FAQ wording, so "Frequently Asked
 *      Questions About Divorce in Harris County" matches and a section that
 *      merely mentions FAQs does not.
 *   2. THE REGION ENDS AT THE NEXT h2, NOT AT THE END OF THE DOCUMENT. On the
 *      Harris County root the FAQ sits mid-page with a closing section after
 *      it; running to the end would eat that section.
 *   3. Each h3 in the region is a question; its answer is every block up to the
 *      next h3 or the region end.
 *   4. Two questions minimum. A single h3 under an FAQ heading is likelier a
 *      mis-parse than an FAQ.
 *
 * Answers flatten to plain text because PracticeAreaFaqs renders them as one
 * <p>{answer}</p>. Multi-paragraph answers join with a space, and the join is
 * reported, because it is a real if small fidelity loss.
 *
 * A page with h3 subheads and no matching h2 yields nothing, because the search
 * never starts — which is what correctly leaves .../alimony-spousal-support/
 * and .../divorce/ alone despite their four and five h3s. */
function extractFaqHeadings(html, report) {
  const heads = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];
  const idx = heads.findIndex((h) => FAQ_HEADING.test(squash(stripTags(h[1]))));
  if (idx === -1) return { faqs: [], html };

  const open = heads[idx];
  const start = open.index;
  const end = idx + 1 < heads.length ? heads[idx + 1].index : html.length;
  const region = html.slice(open.index + open[0].length, end);

  const qs = [...region.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)];
  if (qs.length < 2) {
    if (qs.length) report.faqEmpty = squash(stripTags(open[1]));
    return { faqs: [], html };
  }

  const faqs = qs.map((q, i) => {
    const from = q.index + q[0].length;
    const to = i + 1 < qs.length ? qs[i + 1].index : region.length;
    const parts = [...region.slice(from, to).matchAll(/<(p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map((m) => squash(stripTags(m[2])))
      .filter(Boolean);
    if (parts.length > 1) report.faqJoined = (report.faqJoined ?? 0) + 1;
    return { question: squash(stripTags(q[1])), answer: parts.join(" ") };
  });

  report.faqHeading = squash(stripTags(open[1]));
  report.faqQuestionMarks = faqs.filter((f) => f.question.trim().endsWith("?")).length;
  if (faqs.some((f) => !f.answer)) report.faqBlankAnswer = true;

  /* The whole region goes, heading included — PracticeAreaFaqs supplies its
     own "Frequently Asked Questions" title. Where the source heading was more
     specific than that, the run says so. */
  return { faqs, html: html.slice(0, start) + html.slice(end) };
}

/* ---------------------------------------------------------- normalisation */

/* Copied from scrape-practice-areas.mjs rather than shared, and deliberately:
   the blog's version promotes bold paragraphs to headings because one post has
   no outline at all, and folding both behaviours into one function behind a
   flag would hide the difference rather than record it. These pages, like the
   practice areas, already carry a real outline. */
function normaliseHeadings(html, report) {
  const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  const unique = [...new Set(levels)].sort((a, b) => a - b);
  if (!unique.length) {
    report.noHeadings = true;
    return { html, map: {} };
  }

  const map = {};
  unique.forEach((lvl, i) => { map[lvl] = Math.min(2 + i, 4); });

  const remapped = html.replace(/<(\/?)h([1-6])\b([^>]*)>/gi, (_, slash, lvl, rest) => {
    const to = map[Number(lvl)] ?? 2;
    const cleaned = slash ? "" : rest.replace(/\s+(aria-level|role)="[^"]*"/gi, "");
    return `<${slash}h${to}${cleaned}>`;
  });

  return {
    html: remapped.replace(
      /(<h[2-4][^>]*>)\s*<(b|strong)\b[^>]*>([\s\S]*?)<\/\2>\s*(<\/h[2-4]>)/gi,
      (_, open, __, inner, close) => `${open}${inner}${close}`
    ),
    map,
  };
}

/* ------------------------------------------------------------------ links */

/* Every route these pages can legitimately link to. The location paths come
   from this scrape and the family-law paths off disk, so a cross-link between
   two ingested pages is never reported as unknown — while /faq/ and
   /video-center/, which really are unbuilt, still are. */
async function buildKnownRoutes(locationPaths) {
  const paPaths = [];
  const walk = async (dir, base = "") => {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (e.isDirectory()) await walk(path.join(dir, e.name), `${base}${e.name}/`);
      else if (e.name.endsWith(".md")) {
        const slug = base + e.name.replace(/\.md$/, "");
        paPaths.push(slug === "family-law" ? "/family-law/" : `/family-law/${slug}/`);
      }
    }
  };
  await walk(PA_CONTENT);

  return new Set([
    ...locationPaths,
    ...paPaths,
    "/",
    /* Papa's page IS /about-us/ now, and The Difference folded into it. Both
       old paths are 301s and deliberately absent here, so copy still pointing
       at either gets reported rather than riding the redirect. */
    "/about-us/",
    "/about-us/choosing-a-family-law-attorney/",
    "/testimonials/",
    "/contact-us/",
    "/blog/",
  ]);
}

/* `base` is the page being scraped. These pages sit at four different depths,
   so a relative href resolves against its own page — the practice-area version
   can hardcode one base because that section is flat. */
function rewriteLinks(html, base, known, report) {
  return html.replace(/href="([^"]*)"/gi, (m, href) => {
    const raw = decodeEntities(href);
    if (/^(mailto:|tel:|#)/i.test(raw)) return m;

    let pathname = null;
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      if (u.hostname.replace(/^www\./, "") !== "dieyelaw.com") return m; // external
      pathname = u.pathname;
    } else {
      pathname = new URL(raw, base).pathname;
    }

    pathname = pathname.replace(/index\.html$/, "");
    if (!pathname.endsWith("/")) pathname += "/";

    for (const [from, to] of PATH_FIXES) {
      if (pathname.startsWith(from)) {
        const fixed = to + pathname.slice(from.length);
        report.pathFixes.push(`${pathname} -> ${fixed}`);
        pathname = fixed;
        break;
      }
    }

    if (!known.has(pathname)) report.unknown.add(pathname);
    report.rewritten++;
    return `href="${pathname}"`;
  });
}

/* ------------------------------------------------------------------- CTAs */

/* Copied from scrape-practice-areas.mjs for the same reason normaliseHeadings
   is: the blog walks three trailing paragraphs, these pages need six, and the
   `.btn` rule exists only on this template. The divergence is the point.

   Note what this does NOT touch: the "Take the Next Step" / "Contact Our X in
   Y" closers are <h2> sections, not paragraphs, so they survive — the same
   call already made for the 26 practice areas that end the same way. Trivial
   to strip later, impossible to recover if dropped now. The run counts them. */
function stripCtas(html, report) {
  let out = html;

  /* Scorpion's CTA callout box. The practice-area scraper matches these on
     `text-align: center` alone, which is 62 of the 65 here — the three it
     misses include a text-align:right one on the League City mediation page
     that would otherwise ship mid-body complete with a raw
     {F:P:Cookie:PPCP1/…} template token in its href.

     `txt-hlt` is the class Scorpion puts on the box itself, so it is the
     structural signature rather than a guess about styling; alignment is kept
     alongside it so a future centred CTA without the class still goes.

     Together they take 63 and leave exactly 2 — both real prose, inside FAQ
     answers, which is the right outcome. A rule keyed on the tel: link alone
     would have taken those two as well, emptying an answer. */
  out = out.replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi, (m) => {
    const isCallout =
      /class="[^"]*\btxt-hlt\b/.test(m) || /style="[^"]*text-align:\s*center/i.test(m);
    if (!isCallout) return m;
    report.centered++;
    return "";
  });

  out = out.replace(/<p\b[^>]*>\s*<a\b[^>]*class="[^"]*\bbtn\b[^"]*"[\s\S]*?<\/a>\s*<\/p>/gi, () => {
    report.buttons++;
    return "";
  });

  out = out.replace(
    /<p\b[^>]*>\s*<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>\s*<\/p>/gi,
    (m, _tag, inner) => {
      const text = stripTags(inner);
      if (!PHONE_RE.test(text)) return m;
      report.inline.push(squash(text).slice(0, 90));
      return "";
    }
  );

  for (let i = 0; i < 6; i++) {
    const all = [...out.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)];
    if (!all.length) break;
    const last = all[all.length - 1];
    if (out.slice(last.index + last[0].length).trim() !== "") break;

    const text = stripTags(last[0]);
    const isCta = PHONE_RE.test(text) || /\/contact-us\//.test(last[0]);
    if (!isCta) break;
    report.trailing.push(squash(text).slice(0, 90));
    out = out.slice(0, last.index);
  }

  return out;
}

/* --------------------------------------------------------- nav labels */

/* The short label for each page, read from the client's own /site-map/ so the
   sidebar says what the site says. That page is the only place on dieyelaw.com
   where these 32 are listed with short names — their own sidebars carry the
   About Us menu instead. */
function siteMapLabels(html) {
  const labels = new Map();
  for (const m of html.matchAll(/<a[^>]+href="([^"]*-attorney\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const p = new URL(m[1], ORIGIN).pathname.replace(/index\.html$/, "");
    const text = squash(stripTags(m[2]));
    if (text && !labels.has(p) && text.length < 45) labels.set(p, text);
  }
  return labels;
}

/* ------------------------------------------------------------- copy fixes */

/* Applied to every string that reaches a file — title, deck, description and
   body alike — so a deviation cannot be recorded and then miss the one field
   that carried the error. */
function applyCopyFixes(slug, text, report) {
  const fixes = COPY_FIXES[slug];
  if (!fixes || !text) return text;
  let out = text;
  for (const [from, to] of fixes) {
    if (!out.includes(from)) continue;
    out = out.split(from).join(to);
    report.copyFixes.push(`${from} → ${to}`);
  }
  return out;
}

/* ------------------------------------------------------------------- main */

async function main() {
  console.log("Enumerating the location pages from the live sitemap…");
  const sitemap = await cachedFetch(SITEMAP);
  const sitemapPaths = [
    ...new Set(
      [...sitemap.matchAll(/https:\/\/www\.dieyelaw\.com(\/[a-z0-9/-]*\/)/g)].map((m) => m[1])
    ),
  ];

  const claimed = new Set();
  const urls = [];
  for (const loc of LOCATIONS) {
    const own = sitemapPaths.filter(
      (p) => p === `/${loc.root}/` || p.startsWith(`/${loc.root}/`)
    );
    for (const extra of loc.extras) {
      const p = `/${extra}/`;
      if (!sitemapPaths.includes(p)) throw new Error(`${p} is in LOCATIONS.extras but not the sitemap.`);
      own.push(p);
    }
    own.sort().forEach((p) => { claimed.add(p); urls.push(`${ORIGIN}${p}`); });
    console.log(`  ${loc.label.padEnd(14)} ${own.length} pages`);
  }

  if (urls.length !== EXPECTED_PAGES) {
    throw new Error(
      `Expected ${EXPECTED_PAGES} location pages, enumerated ${urls.length}. ` +
        `The client has added or removed one — check LOCATIONS and EXPECTED_PAGES.`
    );
  }

  /* The guard that would have found the two Pasadena orphans. Any root-level
     path that reads like a location page and that no location claimed is
     either a fifth service area or a new orphan; either way it must not pass
     silently, because nothing else in the pipeline would ever mention it. */
  const unclaimed = sitemapPaths.filter(
    (p) => !claimed.has(p) && /^\/[a-z0-9-]*-(attorney|lawyer)\/$/.test(p)
  );
  console.log(
    `\nRoot-level "-attorney"/"-lawyer" paths no location claimed: ${
      unclaimed.length ? unclaimed.join(", ") : "none"
    }`
  );

  const livePaths = new Set(urls.map((u) => new URL(u).pathname));
  const known = await buildKnownRoutes(livePaths);
  const labels = siteMapLabels(await cachedFetch(SITE_MAP_PAGE));

  const resolved = [...livePaths].filter((p) => labels.has(p)).length;
  if (resolved < EXPECTED_PAGES - 4) {
    throw new Error(
      `Only ${resolved} of ${EXPECTED_PAGES} paths resolved a label off /site-map/. ` +
        `Falling back to titleCase would ship "Alimony Spousal Support" and ` +
        `"Mothers Rights" — check the site map's markup before continuing.`
    );
  }
  console.log(`${resolved} of ${EXPECTED_PAGES} labels read off /site-map/.\n`);

  await mkdir(OUT_CONTENT, { recursive: true });

  const notes = [];
  for (const url of urls) {
    const html = await cachedFetch(url);
    const report = {
      unknown: new Set(), rewritten: 0, pathFixes: [], copyFixes: [],
      centered: 0, buttons: 0, trailing: [], inline: [], remaining: [],
    };

    const pathname = new URL(url).pathname;
    const slug = pathname.replace(/^\//, "").replace(/\/$/, "");
    const parts = slug.split("/");
    const leaf = parts[parts.length - 1];

    const page = extractPage(html, url, report);

    /* CTA stripping runs first so a bold plug can never be read as a heading,
       and so the trailing-paragraph walk sees the real end of the copy.
       Headings are normalised next because the FAQ pass keys on h2/h3, and
       links before the FAQ split so an answer's hrefs are already canonical. */
    const cleaned = stripCtas(page.body, report);
    const { html: headed, map } = normaliseHeadings(cleaned, report);
    const linked = rewriteLinks(headed, url, known, report);

    const micro = extractFaqMicrodata(linked);
    if (micro) report.faqSource = "microdata";
    const { faqs, html: deFaqd } = micro ?? extractFaqHeadings(linked, report);
    if (faqs.length && !micro) report.faqSource = "headings";

    const markdown = applyCopyFixes(slug, toMarkdown(deFaqd), report);

    for (const m of markdown.matchAll(new RegExp(PHONE_RE, "g"))) {
      report.remaining.push(squash(m[0]));
    }

    /* Most of these pages close on a "come talk to us" section. It is an h2,
       so stripCtas leaves it alone — same as the 26 practice areas that end
       the same way. Recorded here so the count is in the run rather than
       needing a second pass over the content to find out. */
    const h2s = [...markdown.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1]);
    const lastH2 = h2s[h2s.length - 1] ?? "";
    if (/take the (next|first) step|contact (our|us)|connect with|start your|schedule a|secure (your|peace)|your path/i.test(lastH2)) {
      report.closer = lastH2;
    }

    const location = LOCATION_OVERRIDES[slug] ?? parts[0];
    /* Within a location, only the third level and deeper has a parent. A page
       one segment under the location root is a top-level row of that menu, the
       same way a top-level practice area has no parent. */
    const parent = parts.length > 2 ? parts.slice(0, -1).join("/") : null;

    const locationEntry = LOCATIONS.find((l) => l.root === location);
    const label =
      slug === location
        ? locationEntry.label
        : LABEL_FIXES[slug] ?? labels.get(pathname) ?? titleCase(leaf);

    const fm = frontmatter({
      title: applyCopyFixes(slug, page.title, report),
      navLabel: label,
      seoTitle: page.seoTitle && page.seoTitle !== page.title ? page.seoTitle : null,
      description: applyCopyFixes(slug, page.description, report),
      subtitle: applyCopyFixes(slug, page.subtitle, report) || null,
      location,
      parent,
      faqs: faqs.map((f) => ({
        question: applyCopyFixes(slug, f.question, report),
        answer: applyCopyFixes(slug, f.answer, report),
      })),
      legacyPath: pathname,
    });

    const file = path.join(OUT_CONTENT, `${slug}.md`);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, fm + "\n" + markdown + "\n", "utf8");

    const words = wordCount(markdown.replace(/[#*\-]|\[|\]\([^)]*\)/g, " "));
    /* Coverage counts the FAQ too. It came out of the same #MainContent the
       source total is measured on, so leaving it out of the numerator makes a
       fully-parsed page with a big FAQ read as 40% — which is what the first
       run of this script did, and it is the kind of number that gets believed. */
    const faqWords = faqs.reduce((a, f) => a + wordCount(`${f.question} ${f.answer}`), 0);
    notes.push({
      slug, label, words, faqWords, location, parent,
      source: page.sourceWords,
      coverage: page.sourceWords ? (words + faqWords) / page.sourceWords : 1,
      subtitle: page.subtitle,
      faqs, faqSource: report.faqSource,
      faqHeading: report.faqHeading,
      faqQuestionMarks: report.faqQuestionMarks ?? 0,
      faqJoined: report.faqJoined ?? 0,
      faqEmpty: report.faqEmpty,
      faqBlankAnswer: report.faqBlankAnswer,
      containers: report.containers,
      headings: Object.entries(map).map(([f, t]) => `h${f}->h${t}`).join(" ") || "none",
      noHeadings: report.noHeadings,
      links: report.rewritten,
      unknown: [...report.unknown],
      pathFixes: report.pathFixes,
      copyFixes: report.copyFixes,
      centered: report.centered,
      buttons: report.buttons,
      inline: report.inline.length,
      trailing: report.trailing.length,
      remaining: report.remaining,
      description: page.description,
      closer: report.closer,
    });

    console.log(`✓ ${slug}`);
  }

  /* ---- report ---- */
  console.log("\n" + "=".repeat(104));
  console.log(
    "slug".padEnd(58), "label".padEnd(22), "body".padStart(5), "+faq".padStart(5),
    "src".padStart(6), " cov  qs"
  );
  console.log("=".repeat(104));
  for (const n of notes) {
    console.log(
      n.slug.slice(0, 57).padEnd(58),
      n.label.slice(0, 21).padEnd(22),
      String(n.words).padStart(5),
      String(n.faqWords || "").padStart(5),
      String(n.source).padStart(6),
      ` ${(n.coverage * 100).toFixed(0).padStart(3)}%`,
      n.faqs.length || "-"
    );
  }

  /* An unresolvable location or parent would drop a page out of every menu
     while still building it — invisible, and easy to miss. Fail loudly. */
  const slugs = new Set(notes.map((n) => n.slug));
  const badLoc = notes.filter((n) => !slugs.has(n.location));
  const badParent = notes.filter((n) => n.parent && !slugs.has(n.parent));
  if (badLoc.length || badParent.length) {
    throw new Error(
      [
        badLoc.length && `Unresolvable location: ${badLoc.map((n) => `${n.slug} -> ${n.location}`).join(", ")}`,
        badParent.length && `Unresolvable parent: ${badParent.map((n) => `${n.slug} -> ${n.parent}`).join(", ")}`,
      ].filter(Boolean).join(" | ")
    );
  }

  /* The menus, printed so a re-located page is visible in the run rather than
     only in the browser. */
  console.log("\nSidebar menus, one per location:");
  for (const loc of LOCATIONS) {
    const mine = notes.filter((n) => n.location === loc.root && n.slug !== loc.root);
    const tops = mine.filter((n) => !n.parent);
    console.log(`\n  ${loc.label}  (/${loc.root}/, ${mine.length} rows in ${tops.length} groups)`);
    for (const top of [...tops].sort((a, b) => {
      const kids = (n) => mine.filter((x) => x.parent === n.slug).length;
      const byGroup = Number(kids(b) > 0) - Number(kids(a) > 0);
      return byGroup !== 0 ? byGroup : a.label.localeCompare(b.label, "en");
    })) {
      const kids = mine.filter((n) => n.parent === top.slug);
      const relocated = LOCATION_OVERRIDES[top.slug] ? "  [re-located]" : "";
      console.log(`    ${kids.length ? "+" : "→"} ${top.label}${kids.length ? ` (${kids.length})` : ""}${relocated}`);
      for (const kid of kids.sort((a, b) => a.label.localeCompare(b.label, "en"))) {
        console.log(`        ${kid.label}`);
      }
    }
  }

  /* ---- FAQ audit ---- */
  const withFaqs = notes.filter((n) => n.faqs.length);
  console.log(
    `\n${"=".repeat(104)}\nFAQ audit — ${withFaqs.length} of ${notes.length} pages carried one, ` +
      `${withFaqs.reduce((a, n) => a + n.faqs.length, 0)} questions lifted`
  );
  console.log("=".repeat(104));
  for (const n of withFaqs) {
    const ratio = n.faqQuestionMarks / n.faqs.length;
    const flag = ratio < 0.8 ? "  ⚠ few question marks" : "";
    console.log(`\n  ${n.slug}  (${n.faqs.length} via ${n.faqSource}, ${(ratio * 100).toFixed(0)}% end in "?")${flag}`);
    if (n.faqHeading && !/^frequently asked questions$/i.test(n.faqHeading)) {
      console.log(`    source heading was "${n.faqHeading}" — the component renders the generic one`);
    }
    for (const f of n.faqs) console.log(`      · ${f.question.slice(0, 78)}`);
  }
  const joined = notes.filter((n) => n.faqJoined);
  if (joined.length) {
    console.log(
      `\n  Answers joined from multiple paragraphs (the component renders one <p>): ` +
        joined.map((n) => `${n.slug} ×${n.faqJoined}`).join(", ")
    );
  }
  const faqEmpty = notes.filter((n) => n.faqEmpty);
  if (faqEmpty.length) {
    faqEmpty.forEach((n) => console.log(`  ⚠ ${n.slug} matched FAQ heading "${n.faqEmpty}" but yielded < 2 questions`));
  }
  const faqBlank = notes.filter((n) => n.faqBlankAnswer);
  if (faqBlank.length) faqBlank.forEach((n) => console.log(`  ⚠ ${n.slug} has a question with an empty answer`));

  /* ---- links and copy ---- */
  const pathFixes = notes.flatMap((n) => n.pathFixes);
  if (pathFixes.length) {
    console.log(`\nStale internal paths rewritten to canonical (${pathFixes.length}):`);
    [...new Set(pathFixes)].sort().forEach((l) => console.log("  " + l));
    console.log("  (not in the sitemap, so they carry no equity and earn no redirect from us)");
  }

  const copyFixes = notes.flatMap((n) => n.copyFixes.map((c) => `${n.slug}: ${c}`));
  console.log(`\nEditorial deviations applied (${copyFixes.length}):`);
  [...new Set(copyFixes)].sort().forEach((l) => console.log("  " + l));

  const declared = Object.values(COPY_FIXES).flat().length;
  const applied = new Set(notes.flatMap((n) => n.copyFixes)).size;
  if (applied < declared) {
    throw new Error(
      `${declared} copy fixes declared but only ${applied} matched. A fix that stops ` +
        `applying means the client edited the page — re-read the deviation rather than ` +
        `letting it lapse silently.`
    );
  }

  const unknown = new Set(notes.flatMap((n) => n.unknown));
  console.log("\nLink targets outside the route map (will 404 until built):");
  [...unknown].sort().forEach((u) => console.log("  " + u));

  console.log(
    `\nCTAs removed: ${notes.reduce((a, n) => a + n.centered, 0)} centred, ` +
      `${notes.reduce((a, n) => a + n.buttons, 0)} buttons, ` +
      `${notes.reduce((a, n) => a + n.inline, 0)} inline plugs, ` +
      `${notes.reduce((a, n) => a + n.trailing, 0)} trailing`
  );
  const remaining = notes.flatMap((n) => n.remaining);
  console.log(`Phone numbers still in body copy: ${remaining.length ? remaining.join(", ") : "none"}`);

  /* Kept, not stripped — the same call HANDOFF records for the 26 practice
     areas that end this way. Counted so the number is on the record for
     whenever that decision is revisited. */
  const closers = notes.filter((n) => n.closer);
  console.log(
    `\n${closers.length} of ${notes.length} pages close on a "come talk to us" section. ` +
      `Kept, as on the practice areas — they are h2 sections, not CTA paragraphs.`
  );

  const shapes = notes.reduce((a, n) => ((a[n.containers] = (a[n.containers] ?? 0) + 1), a), {});
  console.log(`\nContainer shapes: ${Object.entries(shapes).map(([k, v]) => `${k} ×${v}`).join(", ")}`);

  const noSub = notes.filter((n) => !n.subtitle);
  if (noSub.length) console.log(`Pages with no deck/subtitle: ${noSub.map((n) => n.slug).join(", ")}`);
  const noDesc = notes.filter((n) => !n.description);
  console.log(`Pages with no meta description: ${noDesc.length ? noDesc.map((n) => n.slug).join(", ") : "none"}`);
  const noHead = notes.filter((n) => n.noHeadings);
  if (noHead.length) console.log(`Pages with no headings at all: ${noHead.map((n) => n.slug).join(", ")}`);

  const low = notes.filter((n) => n.coverage < 0.8);
  if (low.length) {
    console.log("\n⚠ Low parse coverage — body copy may have been dropped:");
    low.forEach((n) => console.log(`  ${n.slug} (${(n.coverage * 100).toFixed(0)}%, ${n.words} of ${n.source})`));
  }

  const total = notes.reduce((a, n) => a + n.words, 0);
  console.log(`\n${notes.length} pages, ${total.toLocaleString()} words → src/content/locations/`);
}

await main();
