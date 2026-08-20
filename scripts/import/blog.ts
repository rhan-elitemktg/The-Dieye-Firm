/* One-time import: src/content/blog/*.md -> `blogPost` documents.
 *
 * NOTE (phase 7): `src/content/` was DELETED. To run this again, restore it
 * first — `git checkout becaca2 -- src/content`. See
 * scripts/legacy-scrapers/README.md.
 *
 *   npx sanity exec scripts/import/blog.ts --with-user-token
 *
 * Uploads the post artwork as Sanity assets on the way through. That is the
 * step that makes the blog genuinely editable: an editor adding a post needs to
 * attach an image, and `astro:assets` can only optimise files that are already
 * in the repo at build time.
 *
 * Sanity deduplicates uploads by SHA-1, so two posts naming the same file cost
 * one asset. The local path -> asset id map avoids discovering that the slow
 * way, one round trip at a time.
 *
 * Bodies convert through scripts/lib/md-to-pt.mjs — the same satteri parse
 * Astro renders markdown with — proved lossless against dist/ for all 80 files
 * by `node scripts/legacy-scrapers/md-to-pt.mjs`.
 */

import { getCliClient } from "sanity/cli";
import { createReadStream, existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, join, resolve, dirname } from "node:path";
import { markdownToPortableText } from "../lib/md-to-pt.mjs";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });
const CONTENT = join(process.cwd(), "src/content/blog");

/* Frontmatter here is flat scalars plus two string lists (categories,
   keyTakeaways). Parsed for the shapes actually present, throwing on anything
   else so a new field cannot be dropped silently. */
function parseFrontmatter(raw: string, file: string) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error(`No frontmatter in ${file}`);
  const out: Record<string, any> = {};
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
    if (!top) throw new Error(`Unparsed frontmatter line in ${file}: ${line}`);
    const [, key, rest] = top;
    if (rest === "") {
      const list: string[] = [];
      while (i + 1 < lines.length && /^\s+-\s/.test(lines[i + 1])) {
        list.push(unquote(lines[++i].replace(/^\s*-\s*/, "")));
      }
      out[key] = list;
    } else {
      out[key] = unquote(rest);
    }
  }
  return out;
}

/* Upload once per distinct file, keyed on the resolved path. */
const assetCache = new Map<string, string>();
async function uploadImage(absPath: string): Promise<string> {
  const hit = assetCache.get(absPath);
  if (hit) return hit;
  if (!existsSync(absPath)) throw new Error(`Image not found: ${absPath}`);
  const asset = await client.assets.upload("image", createReadStream(absPath), {
    filename: basename(absPath),
  });
  assetCache.set(absPath, asset._id);
  console.log(`   uploaded ${basename(absPath).padEnd(34)} ${asset._id}`);
  return asset._id;
}

const idFor = (slug: string) => `blogPost-${slug}`;

async function run() {
  const files = readdirSync(CONTENT).filter((f) => f.endsWith(".md")).sort();
  if (files.length !== 16) throw new Error(`Expected 16 blog posts, found ${files.length}`);

  const docs: any[] = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const full = join(CONTENT, file);
    const raw = readFileSync(full, "utf8");
    const fm = parseFrontmatter(raw, file);

    const body = await markdownToPortableText(raw, slug);
    if (!body.length) throw new Error(`${slug} converted to an empty body`);

    let image;
    /* Six posts named the firm's generic artwork as their "image". That is not
       artwork, it is the absence of it — the same file every post without a
       photo already falls back to. Importing it would put an explicit copy of
       the placeholder on six documents, so an editor clearing it would see no
       change and there would be no way to tell "no photo chosen" from "the
       photo happens to be the placeholder". Left empty, the fallback handles it
       and the field means what it says. */
    const isPlaceholder = typeof fm.image === "string" && fm.image.endsWith("/blog-img.jpg");
    if (fm.image && !isPlaceholder) {
      /* Frontmatter holds a path relative to the markdown file. */
      const abs = resolve(dirname(full), fm.image);
      const assetId = await uploadImage(abs);
      image = {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
        ...(fm.imageAlt ? { alt: fm.imageAlt } : {}),
      };
    }

    docs.push({
      _id: idFor(slug),
      _type: "blogPost",
      title: fm.title,
      slug: { _type: "slug", current: slug },
      date: fm.date,
      author: fm.author ?? "The Dieye Firm",
      categories: fm.categories ?? [],
      featured: fm.featured === "true" || fm.featured === true,
      ...(image ? { image } : {}),
      ...(fm.keyTakeaways?.length ? { keyTakeaways: fm.keyTakeaways } : {}),
      body,
      legacyPath: fm.legacyPath,
      seo: {
        _type: "seo",
        ...(fm.seoTitle ? { metaTitle: fm.seoTitle } : {}),
        ...(fm.description ? { metaDescription: fm.description } : {}),
        noIndex: false,
      },
    });
  }

  const featured = docs.filter((d) => d.featured);
  if (featured.length > 1) {
    throw new Error(`${featured.length} posts are flagged featured; the archive panel holds one.`);
  }

  const tx = client.transaction();
  for (const d of docs) tx.createOrReplace(d);
  await tx.commit();

  console.log(
    `✓ ${docs.length} blog posts written  (${assetCache.size} distinct images, ${docs.filter((d) => d.image).length} posts with artwork)`,
  );

  await waitForPublic('count(*[_type == "blogPost"])', docs.length, `${docs.length} blog posts`);
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
