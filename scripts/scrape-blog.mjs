/* scrape-blog.mjs — one-time ingest of the dieyelaw.com blog archive.
 *
 * The live site runs Scorpion CMS. Its post markup is unusually clean: one
 * <article class="cnt-stl"> per page, a body vocabulary of only
 * p/h2/h3/h4/ul/li/a/strong/b/em, and a JSON-LD BlogPosting whose articleBody
 * carries the full plain text — which we use to verify our own parse.
 *
 * We read the LIVE site, not the SiteSucker mirror in ~/Downloads. The mirror
 * was captured 2026-07-20 and is already one post behind; it can also carry
 * stale edits. The sitemap is the enumeration source of truth.
 *
 * Fetches are cached to .blog-cache/ (gitignored) so re-runs don't re-hit the
 * client's site. Delete that folder to force a refresh.
 *
 *   node scripts/scrape-blog.mjs           # parse (uses cache if present)
 *   node scripts/scrape-blog.mjs --refetch # ignore cache
 *
 * Writes: src/content/blog/*.md, scripts/blog-redirects.json,
 *         src/assets/images/blog/*
 */

import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  attr,
  decodeEntities,
  frontmatter,
  inlineToMd,
  makeCachedFetch,
  PHONE_RE,
  sliceElement,
  squash,
  stripTags,
  toMarkdown,
} from "./lib/html.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".blog-cache");
const OUT_CONTENT = path.join(ROOT, "src/content/blog");
const OUT_IMAGES = path.join(ROOT, "src/assets/images/blog");
const OUT_REDIRECTS = path.join(ROOT, "scripts/blog-redirects.json");

const ORIGIN = "https://www.dieyelaw.com";
const SITEMAP = `${ORIGIN}/sitemap.xml`;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

const REFETCH = process.argv.includes("--refetch");

/* Routes on the new site, keyed by the path segment the old site used. Comes
   straight from the nav array in src/components/header/MainNav.astro — the old
   site's family-law URLs map 1:1 onto ours. */
const KNOWN_ROUTES = new Set([
  "/family-law/",
  "/family-law/divorce/",
  "/family-law/child-custody/",
  "/family-law/child-support/",
  "/family-law/property-division/",
  "/family-law/spousal-support/",
  "/family-law/paternity/",
  "/family-law/modifications-enforcement/",
  "/family-law/protective-restraining-orders/",
  /* Papa's page now IS /about-us/. The old /about-us/papa-dieye/ is a 301 in
     vercel.json and deliberately not listed, so a post still linking to it is
     reported rather than silently riding the redirect. */
  "/about-us/",
  "/testimonials/",
  "/contact-us/",
  "/blog/",
]);

/* Editorial decisions that belong to this site rather than to the old one.
   They live here, keyed by the slug we generate, so re-running the scrape
   can't quietly undo them — every post file is rewritten on each run, so a
   hand edit to frontmatter would not survive. */

/* The August 2026 post was published with no category at all: the source page
   carries no category links for the extractor to find. Without one it can only
   ever appear under "All Posts" on the Blog index and never under a filter.
   Assigned from its own subject — it is about custody rights.

   Remove this entry once the category is set on the live site. */
const CATEGORY_OVERRIDES = {
  "how-the-2025-texas-fit-parent-presumption-affects-your-custody-rights": ["child-custody"],
};

/* The post that takes the Blog index's featured panel. The old site has no
   equivalent concept, so it can only come from here. Unset falls back to the
   newest post — see splitFeatured() in src/components/blog/blog.ts. */
const FEATURED_SLUG = "preparing-emotionally-for-mediation";

/* ---------------------------------------------------------------- fetching */

/* No delay between live fetches: the archive is 16 posts and their artwork,
   a fraction of what the other two scrapers pull. */
const cachedFetch = makeCachedFetch({ cacheDir: CACHE, origin: ORIGIN, refetch: REFETCH, ua: UA });

/* ------------------------------------------------------------- extraction */

function jsonLdBlogPosting(html) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const data = JSON.parse(decodeEntities(m[1].trim()));
      for (const node of Array.isArray(data) ? data : [data]) {
        if (node && node["@type"] === "BlogPosting") return node;
      }
    } catch {
      /* Scorpion emits one malformed block on some pages; skip it. */
    }
  }
  return null;
}

function extractPost(html, url) {
  const article = sliceElement(html, /<article\b[^>]*class="[^"]*cnt-stl[^"]*"[^>]*>/i, "article");
  if (!article) throw new Error(`no <article class="cnt-stl"> — ${url}`);

  const ld = jsonLdBlogPosting(html);
  if (!ld) throw new Error(`no BlogPosting JSON-LD — ${url}`);

  const h1m = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const title = squash(stripTags(h1m ? h1m[1] : ld.headline));

  const titleTag = html.match(/<title>([\s\S]*?)<\/title>/i);
  // Scorpion appends " | The Dieye Firm" and similar; keep the leading clause.
  const rawSeo = titleTag ? squash(decodeEntities(titleTag[1])) : "";
  const seoTitle = rawSeo.replace(/\s*\|\s*.*$/, "").trim();

  const descM = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const description = descM ? squash(decodeEntities(descM[1])) : "";

  const timeM = html.match(/<time\b[^>]*content="(\d{4}-\d{2}-\d{2})"/i);
  const date = timeM ? timeM[1] : String(ld.datePublished || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`no date — ${url}`);

  // Categories live in a repeater immediately after the article.
  const after = html.slice(html.indexOf(article) + article.length);
  const categories = [...after.slice(0, 4000).matchAll(/\/blog\/categories\/([a-z0-9-]+)\//g)]
    .map((m) => m[1]);

  const image = typeof ld.image === "string" ? ld.image : ld.image?.url || null;
  const imageAlt =
    squash(
      stripTags(
        (html.match(/<img\b[^>]*src="[^"]*\/images\/blog\/[^"]*"[^>]*>/i)?.[0] &&
          attr(html.match(/<img\b[^>]*src="[^"]*\/images\/blog\/[^"]*"[^>]*>/i)[0], "alt")) || ""
      )
    ) || title;

  return {
    url, title, seoTitle, description, date,
    categories: [...new Set(categories)],
    image, imageAlt, article,
    articleBody: squash(String(ld.articleBody || "")),
  };
}

/* ---------------------------------------------------------- normalisation */

/* The archive uses six different heading conventions (h2-only, h3-only,
   h3+h4, h2+h4 skipping h3, one post with aria-level overrides, one with no
   headings at all). Remap so the shallowest level present becomes h2 and the
   next becomes h3 — .prose styles h2/h3/h4 and the page h1 sits outside it. */
function normaliseHeadings(html, report) {
  /* The 2022 post has no heading tags at all — it uses short, fully-bold
     paragraphs as section titles. Promote those to real headings first so the
     post gets a document outline like every other one. Guarded tightly: whole
     paragraph bold, short, no trailing sentence punctuation, no link. */
  html = html.replace(
    /<p\b[^>]*>\s*<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>\s*<\/p>/gi,
    (m, _tag, inner) => {
      const text = squash(stripTags(inner));
      if (!text || text.length > 70 || /[.!?:]$/.test(text) || /<a\b/i.test(inner)) return m;
      report?.promoted.push(text);
      return `<h2>${inner}</h2>`;
    }
  );

  const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  const unique = [...new Set(levels)].sort((a, b) => a - b);
  if (!unique.length) return { html, map: {} };

  const map = {};
  unique.forEach((lvl, i) => { map[lvl] = Math.min(2 + i, 4); });

  const out = html.replace(/<(\/?)h([1-6])\b([^>]*)>/gi, (_, slash, lvl, rest) => {
    const to = map[Number(lvl)] ?? 2;
    // Drop aria-level/role overrides — the real level is now correct.
    const cleaned = slash ? "" : rest.replace(/\s+(aria-level|role)="[^"]*"/gi, "");
    return `<${slash}h${to}${cleaned}>`;
  });

  // The 2020 post wraps every heading in <b>; the tag carries no meaning there.
  return {
    html: out.replace(
      /(<h[2-4][^>]*>)\s*<(b|strong)>([\s\S]*?)<\/\2>\s*(<\/h[2-4]>)/gi,
      (_, open, __, inner, close) => `${open}${inner}${close}`
    ),
    map,
  };
}

function rewriteLinks(html, report) {
  return html.replace(/href="([^"]*)"/gi, (m, href) => {
    const raw = decodeEntities(href);

    if (/^(mailto:|tel:)/i.test(raw)) return m;

    /* Scorpion artefact in the 2022 post: a link whose target was a local file
       path. There is no sensible destination, so mark it for unwrapping — the
       words stay, the anchor goes. Pointing it at "/" would be a live link
       that means nothing. */
    if (/^file:\/\//i.test(raw)) {
      report.repaired.push(raw);
      return 'href="__UNWRAP__"';
    }

    let pathname = null;
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      if (u.hostname.replace(/^www\./, "") !== "dieyelaw.com") return m; // external, leave alone
      pathname = u.pathname;
    } else {
      // Relative, possibly ../../../-style. Resolve against the site root.
      pathname = new URL(raw, `${ORIGIN}/blog/y/m/s/`).pathname;
    }

    pathname = pathname.replace(/index\.html$/, "");
    if (!pathname.endsWith("/")) pathname += "/";

    if (!KNOWN_ROUTES.has(pathname)) report.unknown.add(pathname);
    report.rewritten++;
    return `href="${pathname}"`;
  });
}

/* Nearly every post closes with a firm-plug paragraph carrying a phone number
   or a contact link. We drop those so the number can never go stale — it
   renders from the firmDetails singleton instead. Only trailing paragraphs and
   the centre-aligned CTA lines are removed; body copy is left alone. */
function stripCtas(html, report) {
  let out = html;

  out = out.replace(/<p[^>]*style="[^"]*text-align:\s*center[^"]*"[^>]*>[\s\S]*?<\/p>/gi, (m) => {
    report.centered++;
    return "";
  });

  /* Some posts put the same firm-plug mid-article rather than at the end. The
     signature is precise enough to be safe: a paragraph that is entirely bold
     and carries a phone number is a CTA block, not prose. */
  out = out.replace(
    /<p\b[^>]*>\s*<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>\s*<\/p>/gi,
    (m, _tag, inner) => {
      const text = stripTags(inner);
      if (!PHONE_RE.test(text)) return m;
      report.inline.push(squash(text).slice(0, 90));
      return "";
    }
  );

  /* Walk backwards over trailing paragraphs. Match every <p> block and take
     the last one — anchoring a lazy quantifier to $ instead would span from
     the first <p> to the final </p> and swallow the whole article. */
  for (let i = 0; i < 3; i++) {
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

  for (const m of out.matchAll(new RegExp(PHONE_RE, "g"))) {
    report.remaining.push(squash(m[0]));
  }
  return out;
}

/* ------------------------------------------------------------------ slugs */

const STOP = new Set(["a", "an", "the", "to", "of", "in", "is", "it", "for", "and", "your", "you"]);

function slugify(title) {
  const words = title
    .toLowerCase()
    .replace(/[‘’']/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/);

  const out = [];
  for (const w of words) {
    const next = [...out, w].join("-");
    if (next.length > 80 && out.length >= 4) break;
    out.push(w);
  }
  // Never end on a stopword — that is what made the old URLs look broken.
  while (out.length > 4 && STOP.has(out[out.length - 1])) out.pop();
  return out.join("-");
}

/* ------------------------------------------------------------------- main */

async function main() {
  console.log("Enumerating posts from the sitemap…");
  const sitemap = await cachedFetch(SITEMAP);
  const urls = [
    ...new Set(
      [...sitemap.matchAll(/https:\/\/www\.dieyelaw\.com\/blog\/\d{4}\/[a-z]+\/[a-z0-9-]+\//g)].map(
        (m) => m[0]
      )
    ),
  ].sort();
  console.log(`  ${urls.length} posts\n`);

  await mkdir(OUT_CONTENT, { recursive: true });
  await mkdir(OUT_IMAGES, { recursive: true });

  const redirects = [];
  const slugs = new Map();
  const imageJobs = new Map();
  const notes = [];

  for (const url of urls) {
    const html = await cachedFetch(url);
    const post = extractPost(html, url);

    const report = {
      unknown: new Set(), rewritten: 0, repaired: [],
      centered: 0, trailing: [], inline: [], remaining: [], promoted: [],
    };

    /* CTA stripping runs before heading promotion so a bold CTA paragraph is
       never mistaken for a section title. */
    const cleaned = stripCtas(post.article, report);
    const { html: headed, map } = normaliseHeadings(cleaned, report);
    const body = rewriteLinks(headed, report);
    const markdown = toMarkdown(body);

    // Verify against the JSON-LD plain text: our parse should cover most of it.
    const ours = squash(markdown.replace(/[#*\-]|\[|\]\([^)]*\)/g, " "));
    const coverage = post.articleBody
      ? Math.min(1, ours.split(" ").length / Math.max(1, post.articleBody.split(" ").length))
      : 1;

    let slug = slugify(post.title);
    if (slugs.has(slug)) slug = `${slug}-${post.date.slice(0, 4)}`;
    slugs.set(slug, url);

    let imageField = null;
    if (post.image) {
      const base = path.basename(new URL(post.image).pathname);
      // One post's JSON-LD points at a directory rather than a file.
      if (/\.(jpe?g|png|webp|avif)$/i.test(base)) {
        const safe = base.replace(/[^a-zA-Z0-9._-]/g, "-");
        imageJobs.set(post.image, safe);
        imageField = `../../assets/images/blog/${safe}`;
      } else {
        report.badImage = post.image;
      }
    }

    const legacyPath = new URL(url).pathname;
    redirects.push({ source: legacyPath.replace(/\/$/, ""), destination: `/blog/${slug}/`, permanent: true });

    const categories = CATEGORY_OVERRIDES[slug] ?? post.categories;

    const fm = frontmatter({
      title: post.title,
      seoTitle: post.seoTitle && post.seoTitle !== post.title ? post.seoTitle : null,
      description: post.description,
      date: post.date,
      author: "The Dieye Firm",
      featured: slug === FEATURED_SLUG ? true : null,
      categories,
      image: imageField,
      imageAlt: post.imageAlt,
      legacyPath,
    });

    await writeFile(path.join(OUT_CONTENT, `${slug}.md`), fm + "\n" + markdown + "\n", "utf8");

    const words = markdown.split(/\s+/).filter(Boolean).length;
    notes.push({
      slug, date: post.date, words,
      headings: Object.entries(map).map(([f, t]) => `h${f}->h${t}`).join(" ") || "none",
      cats: categories.join(",") || "(none)",
      coverage: (coverage * 100).toFixed(0) + "%",
      links: report.rewritten,
      unknown: [...report.unknown],
      repaired: report.repaired,
      centered: report.centered,
      inline: report.inline.length,
      trailing: report.trailing.length,
      remaining: report.remaining,
      badImage: report.badImage,
      promoted: report.promoted,
    });

    console.log(`✓ ${slug}`);
  }

  await writeFile(OUT_REDIRECTS, JSON.stringify(redirects, null, 2) + "\n", "utf8");

  console.log(`\nDownloading ${imageJobs.size} images…`);
  for (const [src, name] of imageJobs) {
    const dest = path.join(OUT_IMAGES, name);
    if (existsSync(dest) && !REFETCH) { console.log(`· ${name} (have)`); continue; }
    try {
      await writeFile(dest, await cachedFetch(src, true));
      console.log(`✓ ${name}`);
    } catch (e) {
      console.log(`✗ ${name} — ${e.message}`);
    }
  }

  /* ---- report ---- */
  console.log("\n" + "=".repeat(78));
  console.log("slug".padEnd(46), "date".padEnd(11), "words".padStart(5), " hdr");
  console.log("=".repeat(78));
  for (const n of notes) {
    console.log(n.slug.slice(0, 45).padEnd(46), n.date.padEnd(11), String(n.words).padStart(5), "", n.headings);
  }

  const unknown = new Set(notes.flatMap((n) => n.unknown));
  const remaining = notes.flatMap((n) => n.remaining);
  console.log("\nLink targets not in the nav route map (will 404 until built):");
  [...unknown].sort().forEach((u) => console.log("  " + u));
  console.log(
    `\nCTA paragraphs removed: ${notes.reduce((a, n) => a + n.trailing, 0)} trailing, ` +
      `${notes.reduce((a, n) => a + n.inline, 0)} inline, ` +
      `${notes.reduce((a, n) => a + n.centered, 0)} centered`
  );
  console.log(`Phone numbers still in body copy: ${remaining.length ? remaining.join(", ") : "none"}`);
  const repaired = notes.flatMap((n) => n.repaired);
  if (repaired.length) console.log(`Broken hrefs repaired: ${repaired.join(", ")}`);
  const promoted = notes.filter((n) => n.promoted.length);
  if (promoted.length) {
    console.log("\nBold paragraphs promoted to headings (post had no outline):");
    promoted.forEach((n) => console.log(`  ${n.slug}: ${n.promoted.join(" | ")}`));
  }
  const noImage = notes.filter((n) => n.badImage);
  if (noImage.length) {
    console.log("\nPosts whose JSON-LD image is not a file (need art assigned):");
    noImage.forEach((n) => console.log(`  ${n.slug} -> ${n.badImage}`));
  }
  const low = notes.filter((n) => parseInt(n.coverage) < 80);
  if (low.length) console.log(`\n⚠ Low parse coverage: ${low.map((n) => `${n.slug} (${n.coverage})`).join(", ")}`);
  console.log(`\n${notes.length} posts → src/content/blog/`);
  console.log(`${redirects.length} redirects → scripts/blog-redirects.json`);
}

main().catch((e) => { console.error(e); process.exit(1); });
