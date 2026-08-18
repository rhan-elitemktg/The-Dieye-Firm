/* html.mjs — the parsing kit the Scorpion scrapers share.
 *
 * scrape-blog.mjs and scrape-practice-areas.mjs grew independently and ended up
 * carrying the same entity table, the same nesting-aware slicer and the same
 * HTML-to-markdown walk. scrape-locations.mjs would have been the third copy,
 * which is the point at which AGENTS.md says to extract.
 *
 * WHAT IS HERE IS ONLY WHAT IS GENUINELY THE SAME. The three scrapers also
 * appear to share `normaliseHeadings`, `stripCtas`, `rewriteLinks` and their
 * page extractors, and those have all diverged for real reasons — the blog
 * promotes bold paragraphs to headings because one 2022 post has no heading
 * tags at all; the practice areas walk six trailing paragraphs rather than
 * three because those pages stack a plug, a button and a sign-off. Lifting
 * them would mean an options object per caller that hides exactly the
 * differences the next person needs to see. They stay where they are.
 *
 * Two functions here are supersets rather than intersections, adopted from
 * whichever scraper had the broader one:
 *
 *   inlineToMd  keeps the blog's "__UNWRAP__" branch (a link whose target was
 *               a local file path: the words stay, the anchor goes). No other
 *               caller produces that href, so the branch is inert for them.
 *   frontmatter keeps the practice-area version's array-of-objects handling,
 *               which the `faqs` field needs. On scalar arrays it is
 *               byte-identical to the blog's.
 *
 * Proven by re-running both existing scrapers against their caches after the
 * extraction and requiring `git diff src/content/` to be empty.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

/* ------------------------------------------------------------ entities */

const NAMED = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”",
  mdash: "—", ndash: "–", hellip: "…", eacute: "é",
  uuml: "ü", ouml: "ö", agrave: "à", ccedil: "ç",
  deg: "°", trade: "™", reg: "®", copy: "©",
  bull: "•", middot: "·", frac12: "½", times: "×",
  minus: "−", prime: "′", Prime: "″",
};

export function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z][a-z0-9]*);/gi, (m, n) => (n in NAMED ? NAMED[n] : m));
}

export const stripTags = (html) => decodeEntities(html.replace(/<[^>]*>/g, ""));
export const squash = (s) => s.replace(/\s+/g, " ").trim();
export const wordCount = (s) => squash(s).split(" ").filter(Boolean).length;

/* Tags become a space rather than nothing. Only used for measuring the source,
   where `<p>one</p><p>two</p>` must count as two words, not one — otherwise
   the source total comes in low and coverage reads above 100%. */
export const stripTagsSpaced = (html) => decodeEntities(html.replace(/<[^>]*>/g, " "));

export function attr(tag, name) {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i"));
  return m ? decodeEntities(m[1]) : null;
}

/* Slice out an element by its opening-tag match, honouring nesting. */
export function sliceElement(html, openRe, tagName) {
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

export const PHONE_RE = /\(?\d{3}\)?[\s.-]?\d{3}[-.\s]?\d{4}/;

export const titleCase = (slug) =>
  slug.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

/* ----------------------------------------------------- html -> markdown */

export function inlineToMd(html) {
  let s = html;
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, txt) => {
    const label = squash(stripTags(txt));
    if (!label) return "";
    if (href === "__UNWRAP__") return label; // dead target: keep the words only
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

export function toMarkdown(html) {
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

const y = (v) => JSON.stringify(v); // JSON scalars are valid YAML

export function frontmatter(fields) {
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

/* ---------------------------------------------------------------- fetching */

/* Each scraper caches into its own gitignored directory, so the factory closes
   over the config rather than taking it per call. `delayMs` exists because the
   practice-area scraper sleeps between live fetches to be polite to the
   client's host and the blog scraper never did; passing 0 keeps that exactly.
   `binary` is only used for the blog's post artwork. */
export function makeCachedFetch({ cacheDir, origin, refetch, ua, delayMs = 0 }) {
  return async function cachedFetch(url, binary = false) {
    const key = url.replace(origin, "").replace(/[^a-z0-9]+/gi, "_").slice(0, 180);
    const file = path.join(cacheDir, key + (binary ? ".bin" : ".html"));
    if (!refetch && existsSync(file)) {
      return binary ? readFile(file) : readFile(file, "utf8");
    }
    const res = await fetch(url, { headers: { "user-agent": ua } });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
    const body = binary ? Buffer.from(await res.arrayBuffer()) : await res.text();
    await mkdir(cacheDir, { recursive: true });
    await writeFile(file, body);
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    return body;
  };
}
