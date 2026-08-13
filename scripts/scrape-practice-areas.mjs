/* scrape-practice-areas.mjs — one-time ingest of the dieyelaw.com family-law
 * section: 31 practice-area pages, ~37,000 words.
 *
 * Sibling of scrape-blog.mjs and deliberately shaped like it. The differences
 * from that script are all forced by the source markup:
 *
 *   1. Body copy is split across TWO containers. #MainContent holds the
 *      opening, and #ColumnContentExpandExpanded holds a "read more"
 *      continuation that Scorpion collapses behind an expander. 16 of the 31
 *      pages have one, and on /family-law/child-custody/ it carries 1,442 of
 *      the page's 1,832 words. Taking only #MainContent silently drops most of
 *      several pages, which is the single easiest way to get this wrong.
 *   2. The JSON-LD is LegalService, not BlogPosting, so there is no
 *      articleBody to verify our parse against. Coverage is measured against
 *      the plain text of the two containers instead.
 *   3. The first <h2> is a deck, not a section heading — it sits between the
 *      h1 and the opening paragraph. It becomes `subtitle`, not body copy.
 *   4. /family-law/mediation-vs-litigation/ carries five Q&A pairs as
 *      schema.org/FAQPage microdata inside a raw-html-embed. Those are lifted
 *      into `faqs` frontmatter so they can render as real markup with real
 *      JSON-LD, the way home/Faq.astro already does.
 *
 * WE READ THE LIVE SITE, not the SiteSucker mirror. The mirror is a 2026-07-20
 * capture and is missing /family-law/parental-rights/ entirely — a 1,545-word
 * page. It is still cross-checked against, so a page the client REMOVES since
 * that capture gets reported rather than vanishing silently.
 *
 * URLs are preserved exactly as the live site has them, so this section needs
 * no redirects — unlike the blog, whose Scorpion slugs were cut mid-word.
 *
 * Fetches are cached to .pa-cache/ (gitignored). Delete it to force a refresh.
 *
 *   node scripts/scrape-practice-areas.mjs           # parse (uses cache)
 *   node scripts/scrape-practice-areas.mjs --refetch # ignore cache
 *
 * Writes: src/content/practice-areas/**\/*.md
 */

import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".pa-cache");
const OUT_CONTENT = path.join(ROOT, "src/content/practice-areas");

const MIRROR = path.join(
  process.env.HOME,
  "Downloads/The Dieye Firm/sitesucker/family-law"
);

const ORIGIN = "https://www.dieyelaw.com";
const SITEMAP = `${ORIGIN}/sitemap.xml`;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const REFETCH = process.argv.includes("--refetch");

/* The /family-law/ index is NOT ingested. It has a comp — "Practice Areas
   index.dc.html" — and AGENTS.md makes comps the source of truth for both
   layout and copy wherever one exists. Only the 31 detail pages come from
   here. */
const INDEX_PATH = "/family-law/";

/* Short labels for the sidebar and nav, taken from the client's own nav
   flyout. Only entries where the flyout's wording needs typographic repair
   appear here — everything else is used verbatim. These are not new copy;
   they are the client's labels with correct casing and punctuation. */
const LABEL_FIXES = {
  qdros: "QDROs",
  "mediation-vs-litigation": "Mediation vs Litigation",
  "mothers-rights": "Mothers' Rights",
  "fathers-rights": "Fathers' Rights",
  "out-of-state-custody": "Out-of-State Custody",
  "protective-restraining-orders": "Protective & Restraining Orders",
  /* The flyout says "Right Type Divorce", which is a slug read aloud. The
     page's own h1 is "The Right Type of Divorce for You" — this is that
     wording trimmed to a nav label, not a new name for the page. */
  "right-type-divorce": "Right Type of Divorce",
};

/* Five practice-area pages link to blog posts by their old Scorpion URLs.
   scripts/blog-redirects.json already maps every one of those onto the flat
   /blog/<slug>/ route the ingest created, so we resolve them here rather than
   shipping internal links that rely on a 301 hop. */
const BLOG_REDIRECTS = new Map(
  JSON.parse(
    await readFile(path.join(ROOT, "scripts/blog-redirects.json"), "utf8")
  ).map((r) => [r.source.replace(/\/?$/, "/"), r.destination])
);

/* ---------------------------------------------------------------- fetching */

async function cachedFetch(url) {
  const key = url.replace(ORIGIN, "").replace(/[^a-z0-9]+/gi, "_").slice(0, 180);
  const file = path.join(CACHE, key + ".html");
  if (!REFETCH && existsSync(file)) return readFile(file, "utf8");
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  const body = await res.text();
  await mkdir(CACHE, { recursive: true });
  await writeFile(file, body);
  await new Promise((r) => setTimeout(r, 400)); // be polite to the client's host
  return body;
}

/* ------------------------------------------------------------ html helpers */

const NAMED = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”",
  mdash: "—", ndash: "–", hellip: "…", eacute: "é",
  uuml: "ü", ouml: "ö", agrave: "à", ccedil: "ç",
  deg: "°", trade: "™", reg: "®", copy: "©",
  bull: "•", middot: "·", frac12: "½", times: "×",
  minus: "−", prime: "′", Prime: "″",
};

function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z][a-z0-9]*);/gi, (m, n) => (n in NAMED ? NAMED[n] : m));
}

const stripTags = (html) => decodeEntities(html.replace(/<[^>]*>/g, ""));
const squash = (s) => s.replace(/\s+/g, " ").trim();
const wordCount = (s) => squash(s).split(" ").filter(Boolean).length;

/* Tags become a space rather than nothing. Only used for measuring the source,
   where `<p>one</p><p>two</p>` must count as two words, not one — otherwise
   the source total comes in low and coverage reads above 100%. */
const stripTagsSpaced = (html) => decodeEntities(html.replace(/<[^>]*>/g, " "));

/* Slice out an element by its opening-tag match, honouring nesting. */
function sliceElement(html, openRe, tagName) {
  const open = html.match(openRe);
  if (!open) return null;
  const start = open.index + open[0].length;
  const re = new RegExp(`<${tagName}\\b[^>]*>|</${tagName}>`, "gi");
  re.lastIndex = start;
  let depth = 1, m;
  while ((m = re.exec(html))) {
    depth += m[0][1] === "/" ? -1 : 1;
    if (depth === 0) return html.slice(start, m.index);
  }
  return null;
}

/* ------------------------------------------------------------------- FAQs */

/* schema.org/FAQPage microdata, pasted into the page as a raw HTML embed.
   Written generically rather than against the one page that has it today, so
   the next page the client adds one to is picked up without a code change. */
function extractFaqs(html, report) {
  const block = sliceElement(
    html,
    /<div\b[^>]*itemtype="https:\/\/schema\.org\/FAQPage"[^>]*>/i,
    "div"
  );
  if (!block) return { faqs: [], html };

  const faqs = [];
  const qRe = /<h[23][^>]*itemprop="name"[^>]*>([\s\S]*?)<\/h[23]>/gi;
  const aRe = /<div[^>]*itemprop="text"[^>]*>([\s\S]*?)<\/div>/gi;
  const questions = [...block.matchAll(qRe)].map((m) => squash(stripTags(m[1])));
  const answers = [...block.matchAll(aRe)].map((m) => squash(stripTags(m[1])));

  for (let i = 0; i < Math.min(questions.length, answers.length); i++) {
    if (questions[i] && answers[i]) faqs.push({ question: questions[i], answer: answers[i] });
  }
  if (questions.length !== answers.length) {
    report.faqMismatch = `${questions.length} questions vs ${answers.length} answers`;
  }

  // Remove the whole embed so the Q&A never renders twice.
  const embed = html.match(
    /<div\b[^>]*class="[^"]*raw-html-embed[^"]*"[^>]*>[\s\S]*?itemtype="https:\/\/schema\.org\/FAQPage"[\s\S]*$/i
  );
  const stripped = embed ? html.slice(0, embed.index) : html;
  return { faqs, html: stripped };
}

/* ------------------------------------------------------------- extraction */

function extractPage(html, url) {
  const main = sliceElement(html, /<div\b[^>]*id="MainContent"[^>]*>/i, "div");
  if (!main) throw new Error(`no #MainContent — ${url}`);

  /* The expander. Absent on 15 of the 31 pages, which is normal — but when it
     is present it is body copy, not chrome, and skipping it loses most of
     some pages. */
  const expanded = sliceElement(
    html,
    /<div\b[^>]*id="ColumnContentExpandExpanded"[^>]*>/i,
    "div"
  );

  const h1m = main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!h1m) throw new Error(`no <h1> — ${url}`);
  const title = squash(stripTags(h1m[1]));

  const titleTag = html.match(/<title>([\s\S]*?)<\/title>/i);
  const rawSeo = titleTag ? squash(decodeEntities(titleTag[1])) : "";
  const seoTitle = rawSeo.replace(/\s*\|\s*.*$/, "").trim();

  const descM = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  /* Four descriptions end on "Call (832) 299-1990." Same rule as the body: a
     phone number written into a file goes stale the day the firm changes it,
     and there is no firmDetails lookup available inside frontmatter. Dropping
     the trailing call-to-action leaves a complete sentence behind. */
  const description = descM
    ? squash(decodeEntities(descM[1]))
        .replace(new RegExp(`\\s*Call\\s+${PHONE_RE.source}[^.]*\\.?\\s*$`, "i"), "")
        .trim()
    : "";

  /* Everything after the h1. The first h2 in that remainder is a deck — it
     sits between the h1 and the opening paragraph and reads as a subtitle,
     not a section heading. Only treat it as one if no <p> comes first. */
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
    body: rest + (expanded ? "\n" + expanded : ""),
    sourceWords:
      wordCount(stripTagsSpaced(main)) + (expanded ? wordCount(stripTagsSpaced(expanded)) : 0),
    hasExpander: Boolean(expanded),
  };
}

/* ---------------------------------------------------------- normalisation */

/* These pages already carry a real outline (h2 sections, h3 subsections), so
   unlike the blog archive there are no bold-paragraph pseudo-headings to
   promote. All this does is guarantee the shallowest level present becomes h2
   — the page h1 sits outside .prose — and report anything that skips a level. */
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

  /* The Divorce page wraps one heading in <strong>, which would otherwise
     render as "## **Commonly Asked Questions**". Bold inside a heading carries
     no meaning — the heading level already is the emphasis. */
  return {
    html: remapped.replace(
      /(<h[2-4][^>]*>)\s*<(b|strong)\b[^>]*>([\s\S]*?)<\/\2>\s*(<\/h[2-4]>)/gi,
      (_, open, __, inner, close) => `${open}${inner}${close}`
    ),
    map,
  };
}

/* Every route this section can legitimately link to. The family-law entries
   are generated from the scrape itself, so a link between two practice-area
   pages is never reported as unknown. */
function buildKnownRoutes(paths) {
  return new Set([
    ...paths,
    "/family-law/",
    "/about-us/",
    "/about-us/papa-dieye/",
    "/about-us/choosing-a-family-law-attorney/",
    "/about-us/the-difference/",
    "/testimonials/",
    "/contact-us/",
    "/blog/",
    ...BLOG_REDIRECTS.values(),
  ]);
}

function rewriteLinks(html, known, report) {
  return html.replace(/href="([^"]*)"/gi, (m, href) => {
    const raw = decodeEntities(href);
    if (/^(mailto:|tel:|#)/i.test(raw)) return m;

    let pathname = null;
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      if (u.hostname.replace(/^www\./, "") !== "dieyelaw.com") return m; // external
      pathname = u.pathname;
    } else {
      pathname = new URL(raw, `${ORIGIN}/family-law/x/`).pathname;
    }

    pathname = pathname.replace(/index\.html$/, "");
    if (!pathname.endsWith("/")) pathname += "/";

    const redirected = BLOG_REDIRECTS.get(pathname);
    if (redirected) {
      report.blogLinks.push(`${pathname} -> ${redirected}`);
      pathname = redirected;
    }

    if (!known.has(pathname)) report.unknown.add(pathname);
    report.rewritten++;
    return `href="${pathname}"`;
  });
}

const PHONE_RE = /\(?\d{3}\)?[\s.-]?\d{3}[-.\s]?\d{4}/;

/* These pages are far heavier on calls-to-action than the blog was: a centred
   "SCHEDULE A CASE EVALUATION" button recurs every few sections, and most
   pages close on a phone-number plug. All of it goes — the number renders from
   the firmDetails singleton, and the page template already carries a form. */
function stripCtas(html, report) {
  let out = html;

  // Centred paragraphs are always CTAs on these templates.
  out = out.replace(/<p[^>]*style="[^"]*text-align:\s*center[^"]*"[^>]*>[\s\S]*?<\/p>/gi, () => {
    report.centered++;
    return "";
  });

  // A paragraph whose entire content is a .btn link, however it is aligned.
  out = out.replace(/<p\b[^>]*>\s*<a\b[^>]*class="[^"]*\bbtn\b[^"]*"[\s\S]*?<\/a>\s*<\/p>/gi, () => {
    report.buttons++;
    return "";
  });

  // A fully-bold paragraph carrying a phone number is a plug, not prose.
  out = out.replace(
    /<p\b[^>]*>\s*<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>\s*<\/p>/gi,
    (m, _tag, inner) => {
      const text = stripTags(inner);
      if (!PHONE_RE.test(text)) return m;
      report.inline.push(squash(text).slice(0, 90));
      return "";
    }
  );

  /* Walk backwards over trailing paragraphs. Six passes rather than the blog's
     three: these pages routinely stack a plug, a button and a sign-off. */
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

/* ----------------------------------------------------- html -> markdown */

function inlineToMd(html) {
  let s = html;
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, txt) => {
    const label = squash(stripTags(txt));
    if (!label) return "";
    return `[${label}](${decodeEntities(href)})`;
  });
  s = s.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => {
    const inner = squash(stripTags(t));
    return inner ? `**${inner}**` : "";
  });
  s = s.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => {
    const inner = squash(stripTags(t));
    return inner ? `*${inner}*` : "";
  });
  s = decodeEntities(s.replace(/<[^>]*>/g, ""));
  return squash(s);
}

function toMarkdown(html) {
  const blocks = [];
  const re = /<(h[2-4]|p|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase();
    const inner = m[2];

    if (tag.startsWith("h")) {
      const text = inlineToMd(inner);
      if (text) blocks.push("#".repeat(Number(tag[1])) + " " + text);
      continue;
    }
    if (tag === "p") {
      const text = inlineToMd(inner);
      if (text) blocks.push(text);
      continue;
    }
    const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((li) => inlineToMd(li[1]))
      .filter(Boolean);
    if (items.length) {
      blocks.push(items.map((t, i) => (tag === "ol" ? `${i + 1}. ${t}` : `- ${t}`)).join("\n"));
    }
  }
  return blocks.join("\n\n");
}

/* ------------------------------------------------------------------ yaml */

const y = (v) => JSON.stringify(v);

function frontmatter(fields) {
  const lines = [];
  for (const [k, v] of Object.entries(fields)) {
    if (v === null || v === undefined || (Array.isArray(v) && !v.length)) continue;
    if (Array.isArray(v)) {
      lines.push(`${k}:`);
      for (const item of v) {
        if (item && typeof item === "object") {
          const entries = Object.entries(item);
          lines.push(`  - ${entries[0][0]}: ${y(entries[0][1])}`);
          for (const [ik, iv] of entries.slice(1)) lines.push(`    ${ik}: ${y(iv)}`);
        } else {
          lines.push(`  - ${y(item)}`);
        }
      }
    } else {
      lines.push(`${k}: ${y(v)}`);
    }
  }
  return `---\n${lines.join("\n")}\n---\n`;
}

/* --------------------------------------------------------- nav labels */

/* The short label for each page, read from the client's own Family Law nav
   flyout so the sidebar says what the site says. Falls back to title-casing
   the slug for anything the flyout omits. */
function navLabels(html) {
  const labels = new Map();
  for (const m of html.matchAll(
    /<a[^>]+href="([^"]*\/family-law\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
  )) {
    const p = new URL(m[1], ORIGIN).pathname.replace(/index\.html$/, "");
    const text = squash(stripTags(m[2]));
    if (text && !labels.has(p) && text.length < 45) labels.set(p, text);
  }
  return labels;
}

const titleCase = (slug) =>
  slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

/* ------------------------------------------------------------------- main */

async function main() {
  console.log("Enumerating the family-law section from the live sitemap…");
  const sitemap = await cachedFetch(SITEMAP);
  const urls = [
    ...new Set(
      [...sitemap.matchAll(/https:\/\/www\.dieyelaw\.com\/family-law\/[a-z0-9/-]*\//g)].map((m) => m[0])
    ),
  ]
    .filter((u) => new URL(u).pathname !== INDEX_PATH)
    .sort();
  console.log(`  ${urls.length} detail pages (the index is comp-driven, not ingested)\n`);

  const livePaths = new Set(urls.map((u) => new URL(u).pathname));

  /* Cross-check the 2026-07-20 mirror. It is not the source — it is missing
     /family-law/parental-rights/ — but a page that exists there and NOT live
     has been removed since, which is worth knowing before we drop it. */
  let mirrorOnly = [];
  if (existsSync(MIRROR)) {
    const walk = async (dir, base = "") => {
      const out = [];
      for (const e of await readdir(dir, { withFileTypes: true })) {
        if (e.isDirectory()) out.push(...(await walk(path.join(dir, e.name), `${base}${e.name}/`)));
        else if (e.name === "index.html" && base) out.push(`/family-law/${base}`);
      }
      return out;
    };
    const mirrorPaths = await walk(MIRROR);
    mirrorOnly = mirrorPaths.filter((p) => !livePaths.has(p)).sort();
    const liveOnly = [...livePaths].filter((p) => !mirrorPaths.includes(p)).sort();
    console.log(`Mirror cross-check (${mirrorPaths.length} pages captured 2026-07-20):`);
    console.log(`  live but not in mirror : ${liveOnly.join(", ") || "none"}`);
    console.log(`  in mirror but not live : ${mirrorOnly.join(", ") || "none"}\n`);
  } else {
    console.log(`Mirror not found at ${MIRROR} — skipping cross-check.\n`);
  }

  const known = buildKnownRoutes(livePaths);
  const labels = navLabels(await cachedFetch(urls[0]));

  await mkdir(OUT_CONTENT, { recursive: true });

  const notes = [];
  for (const url of urls) {
    const html = await cachedFetch(url);
    const report = {
      unknown: new Set(), rewritten: 0, blogLinks: [],
      centered: 0, buttons: 0, trailing: [], inline: [], remaining: [],
    };

    const page = extractPage(html, url);
    const { faqs, html: deFaqd } = extractFaqs(page.body, report);

    /* CTA stripping runs first so a bold plug can never be read as a heading,
       and so the trailing-paragraph walk sees the real end of the copy. */
    const cleaned = stripCtas(deFaqd, report);
    const { html: headed, map } = normaliseHeadings(cleaned, report);
    const body = rewriteLinks(headed, known, report);
    const markdown = toMarkdown(body);

    /* Measured on the finished markdown, not on an intermediate stage. Every
       number the source carries sits inside a CTA block that stripCtas removes,
       so checking before conversion reports phantom hits — and, worse, would
       hide a real one that only appears after conversion. */
    for (const m of markdown.matchAll(new RegExp(PHONE_RE, "g"))) {
      report.remaining.push(squash(m[0]));
    }

    const pathname = new URL(url).pathname;
    const slug = pathname.replace(/^\/family-law\//, "").replace(/\/$/, "");
    const leaf = slug.split("/").pop();
    const parent = slug.includes("/") ? slug.split("/")[0] : null;

    const label =
      LABEL_FIXES[leaf] ?? labels.get(pathname) ?? titleCase(leaf);

    const fm = frontmatter({
      title: page.title,
      navLabel: label,
      seoTitle: page.seoTitle && page.seoTitle !== page.title ? page.seoTitle : null,
      description: page.description,
      subtitle: page.subtitle || null,
      parent,
      faqs,
      legacyPath: pathname,
    });

    const file = path.join(OUT_CONTENT, `${slug}.md`);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, fm + "\n" + markdown + "\n", "utf8");

    const words = wordCount(markdown.replace(/[#*\-]|\[|\]\([^)]*\)/g, " "));
    notes.push({
      slug, label, words,
      source: page.sourceWords,
      coverage: page.sourceWords ? words / page.sourceWords : 1,
      expander: page.hasExpander,
      subtitle: page.subtitle,
      faqs: faqs.length,
      headings: Object.entries(map).map(([f, t]) => `h${f}->h${t}`).join(" ") || "none",
      noHeadings: report.noHeadings,
      links: report.rewritten,
      unknown: [...report.unknown],
      blogLinks: report.blogLinks,
      centered: report.centered,
      buttons: report.buttons,
      inline: report.inline.length,
      trailing: report.trailing.length,
      remaining: report.remaining,
      faqMismatch: report.faqMismatch,
      description: page.description,
    });

    console.log(`✓ ${slug}`);
  }

  /* ---- report ---- */
  console.log("\n" + "=".repeat(96));
  console.log(
    "slug".padEnd(42), "label".padEnd(24), "words".padStart(5), "src".padStart(6), " cov  exp faq"
  );
  console.log("=".repeat(96));
  for (const n of notes) {
    console.log(
      n.slug.slice(0, 41).padEnd(42),
      n.label.slice(0, 23).padEnd(24),
      String(n.words).padStart(5),
      String(n.source).padStart(6),
      ` ${(n.coverage * 100).toFixed(0).padStart(3)}%`,
      n.expander ? " yes" : "  - ",
      n.faqs || "-"
    );
  }

  const blogLinks = notes.flatMap((n) => n.blogLinks);
  if (blogLinks.length) {
    console.log(`\nOld blog URLs resolved to their new routes (${blogLinks.length}):`);
    [...new Set(blogLinks)].sort().forEach((l) => console.log("  " + l));
  }

  const unknown = new Set(notes.flatMap((n) => n.unknown));
  console.log("\nLink targets outside the family-law route map (will 404 until built):");
  [...unknown].sort().forEach((u) => console.log("  " + u));

  console.log(
    `\nCTAs removed: ${notes.reduce((a, n) => a + n.centered, 0)} centred, ` +
      `${notes.reduce((a, n) => a + n.buttons, 0)} buttons, ` +
      `${notes.reduce((a, n) => a + n.inline, 0)} inline plugs, ` +
      `${notes.reduce((a, n) => a + n.trailing, 0)} trailing`
  );
  const remaining = notes.flatMap((n) => n.remaining);
  console.log(`Phone numbers still in body copy: ${remaining.length ? remaining.join(", ") : "none"}`);

  const noSub = notes.filter((n) => !n.subtitle);
  if (noSub.length) console.log(`\nPages with no deck/subtitle: ${noSub.map((n) => n.slug).join(", ")}`);
  const noDesc = notes.filter((n) => !n.description);
  if (noDesc.length) console.log(`Pages with no meta description: ${noDesc.map((n) => n.slug).join(", ")}`);
  const noHead = notes.filter((n) => n.noHeadings);
  if (noHead.length) console.log(`Pages with no headings at all: ${noHead.map((n) => n.slug).join(", ")}`);
  const mismatch = notes.filter((n) => n.faqMismatch);
  if (mismatch.length) mismatch.forEach((n) => console.log(`⚠ FAQ mismatch on ${n.slug}: ${n.faqMismatch}`));

  const low = notes.filter((n) => n.coverage < 0.8);
  if (low.length) {
    console.log("\n⚠ Low parse coverage — body copy may have been dropped:");
    low.forEach((n) => console.log(`  ${n.slug} (${(n.coverage * 100).toFixed(0)}%, ${n.words} of ${n.source})`));
  }

  const total = notes.reduce((a, n) => a + n.words, 0);
  console.log(`\n${notes.length} pages, ${total.toLocaleString()} words → src/content/practice-areas/`);
  console.log(`${notes.filter((n) => n.expander).length} of them needed the expander container.`);
  if (mirrorOnly.length) {
    console.log(`\n⚠ In the mirror but no longer live: ${mirrorOnly.join(", ")}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
