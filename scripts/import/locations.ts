/* One-time import: src/content/locations/**.md -> `locationPage` documents.
 *
 * NOTE (phase 7): `src/content/` was DELETED. To run this again, restore it
 * first — `git checkout becaca2 -- src/content`. See
 * scripts/legacy-scrapers/README.md.
 *
 *   npx sanity exec scripts/import/locations.ts --with-user-token
 *
 * Reads the committed markdown, which is the reviewed artifact: the scraper's
 * label fixes and parent overrides are already baked into these files, and the
 * corrections in docs/live-site-corrections.md are already applied. Re-scraping
 * the live site would run all of that editorial logic again and risk drift.
 *
 * Bodies convert through scripts/lib/md-to-pt.mjs, which parses with satteri —
 * the same parser Astro renders markdown with — so the Portable Text is built
 * from exactly the tree the pre-migration build came from. That conversion is
 * proved lossless against dist/ for all 80 files by `node scripts/legacy-scrapers/md-to-pt.mjs`.
 *
 * ── ids ──────────────────────────────────────────────────────────────────────
 *
 * Derived from the content path, hyphenated, NEVER dotted. A `.` in a Sanity
 * document id makes it a path, and only root-level ids are publicly readable —
 * so a dotted id produces documents that the Studio shows, the CLI returns, and
 * the anonymous build cannot see. That cost an hour in phase 1.
 *
 * `divorce/military-divorce` therefore becomes `practiceArea-divorce-military-
 * divorce`. Slashes flatten to hyphens, which can in principle collide
 * ("a/b-c" and "a-b/c"); the run asserts the ids are unique rather than assuming.
 *
 * ── ordering ─────────────────────────────────────────────────────────────────
 *
 * One transaction, so reference integrity is evaluated across the whole batch
 * and parents do not need to be written before their children.
 */

import { getCliClient } from "sanity/cli";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { markdownToPortableText } from "../lib/md-to-pt.mjs";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

const CONTENT = join(process.cwd(), "src/content/locations");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
  return out;
}

/* The frontmatter is flat YAML of scalars and one nested `faqs` list. Rather
   than pull in a YAML parser for that, parse the shapes actually present and
   throw on anything else, so a new field cannot be dropped silently. */
function parseFrontmatter(raw: string, file: string) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error(`No frontmatter in ${file}`);
  const out: Record<string, unknown> = {};
  const faqs: { question: string; answer: string }[] = [];
  const lines = m[1].split(/\r?\n/);

  const unquote = (v: string) => {
    const t = v.trim();
    if (t.startsWith('"')) return JSON.parse(t);
    if (t.startsWith("'")) return t.slice(1, -1).replace(/''/g, "'");
    return t;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const top = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (top) {
      const [, key, rest] = top;
      if (key === "faqs") {
        /* `faqs:` then repeated "  - question: …" / "    answer: …" pairs. */
        while (i + 1 < lines.length && /^\s+/.test(lines[i + 1])) {
          const q = lines[++i].match(/^\s*-\s*question:\s*(.*)$/);
          if (!q) continue;
          const a = lines[++i]?.match(/^\s*answer:\s*(.*)$/);
          if (!a) throw new Error(`FAQ question without an answer in ${file}`);
          faqs.push({ question: unquote(q[1]), answer: unquote(a[1]) });
        }
        continue;
      }
      out[key] = rest === "" ? "" : unquote(rest);
      continue;
    }
    throw new Error(`Unparsed frontmatter line in ${file}: ${line}`);
  }
  if (faqs.length) out.faqs = faqs;
  return out as Record<string, any>;
}

const idFor = (contentId: string) =>
  `locationPage-${contentId.replace(/\//g, "-")}`;

async function run() {
  const files = walk(CONTENT).sort();
  if (files.length !== 32) {
    throw new Error(`Expected 32 location pages, found ${files.length}`);
  }

  const docs = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const file of files) {
    const rel = relative(CONTENT, file).replace(/\.md$/, "");
    const raw = readFileSync(file, "utf8");
    const fm = parseFrontmatter(raw, file);
    const _id = idFor(rel);

    if (seenIds.has(_id)) {
      throw new Error(
        `Two content files flatten to the document id "${_id}". Slashes become hyphens, so ` +
          `"a/b-c" and "a-b/c" would collide — rename one or change idFor().`,
      );
    }
    seenIds.add(_id);
    if (seenSlugs.has(rel)) throw new Error(`Duplicate slug "${rel}"`);
    seenSlugs.add(rel);

    const body = await markdownToPortableText(raw, rel);
    if (!body.length) throw new Error(`${rel} converted to an empty body`);

    /* FAQ answers are plain strings in the markdown — whatever paragraph
       structure they had on the live site was flattened by the scrape and is not
       recoverable here. Each becomes a single Portable Text paragraph, which is
       what the site renders today; the type allows more so the flattening
       becomes a data fix later rather than a component change. */
    const faqs = (fm.faqs ?? []).map((f: any, i: number) => ({
      _key: `faq${i}`,
      // `pageFaq`, not `faq` — see the note on the schema's array member.
      _type: "pageFaq",
      question: f.question,
      answer: [
        {
          _type: "block",
          _key: `faq${i}b0`,
          style: "normal",
          markDefs: [],
          children: [{ _type: "span", _key: "s0", text: f.answer, marks: [] }],
        },
      ],
    }));

    docs.push({
      _id,
      _type: "locationPage",
      title: fm.title,
      navLabel: fm.navLabel,
      slug: { _type: "slug", current: rel },
      location: { _type: "reference", _ref: idFor(fm.location) },
      ...(fm.parent ? { parent: { _type: "reference", _ref: idFor(fm.parent) } } : {}),
      ...(fm.subtitle ? { subtitle: fm.subtitle } : {}),
      body,
      ...(faqs.length ? { faqs } : {}),
      legacyPath: fm.legacyPath,
      /* seoTitle and description come across as the SEO overrides they always
         were — the page rendered <title> from seoTitle and the meta description
         from description, so putting them here keeps both byte-identical while
         making them editable. */
      seo: {
        _type: "seo",
        ...(fm.seoTitle ? { metaTitle: fm.seoTitle } : {}),
        ...(fm.description ? { metaDescription: fm.description } : {}),
        noIndex: false,
      },
    });
  }

  /* Every reference must resolve, or the sidebar silently loses rows. */
  for (const d of docs) {
    for (const [field, ref] of [["parent", d.parent], ["location", d.location]] as const) {
      if (ref && !seenIds.has(ref._ref)) {
        throw new Error(`${d._id} has ${field} "${ref._ref}" which is not among the imported documents`);
      }
    }
  }

  const tx = client.transaction();
  for (const d of docs) tx.createOrReplace(d);
  await tx.commit();

  const areas = new Set(docs.map((d) => d.location._ref));
  const third = docs.filter((d) => d.parent).length;
  console.log(
    `✓ ${docs.length} location pages written  (${areas.size} service areas, ${third} third-level)`,
  );

  await waitForPublic(
    'count(*[_type == "locationPage"])',
    docs.length,
    `${docs.length} location pages`,
  );
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
