import GithubSlugger from "github-slugger";
import type { PortableTextBlock } from "@portabletext/types";

/* Heading ids for Portable Text, reproducing what Astro's markdown renderer does.
 *
 * ── Why this has to exist ────────────────────────────────────────────────────
 *
 * Astro 7 renders markdown through `satteri` (via @astrojs/markdown-satteri —
 * there is no remark or rehype in this project), and its heading-ids plugin
 * slugs every heading with `github-slugger`, one Slugger per document:
 *
 *     const slugger = new Slugger();
 *     const slug = typeof existingId === "string" ? existingId : slugger.slug(text);
 *
 * So every one of the 80 ingested pages currently renders
 * `<h2 id="what-is-a-qdro">`. `astro-portabletext` emits no id at all, so
 * without this the migration would silently strip an id from all 553 headings
 * on the site.
 *
 * Nothing on the site links to those fragments — the only `href="#…"` in the
 * build are SVG defs and the video bundle — so they are search surface rather
 * than navigation. They are still worth keeping: they are what Google has
 * indexed for the live pages, and reproducing them is twenty lines.
 *
 * ── Why the ids are precomputed rather than slugged during render ────────────
 *
 * One Slugger per DOCUMENT is what makes a repeated heading get `-1` appended.
 * A component override is invoked once per block, so keeping the slugger's state
 * across a render would mean shared mutable state whose correctness depends on
 * render order. Precomputing keeps it a pure function of the block array, which
 * is testable and order-independent.
 *
 * As it happens no page in the corpus repeats a heading, so the deduplication
 * never fires today — verified by comparing a shared slugger against a fresh one
 * per heading across all 80 documents, which produced identical output. It is
 * implemented anyway because the moment an editor writes two "Overview"
 * headings, the ids must not collide.
 */

/** The id Astro would give this heading, or undefined for a non-heading block. */
export type WithHeadingId = PortableTextBlock & { _headingId?: string };

const HEADING_STYLES = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

/** The heading's text, which is what satteri slugs (`ctx.textContent(node)`). */
function headingText(block: PortableTextBlock): string {
  return (block.children ?? [])
    .map((child) => ("text" in child && typeof child.text === "string" ? child.text : ""))
    .join("");
}

/**
 * Stamp `_headingId` onto every heading block, using one slugger for the whole
 * array — so call this once per document, on the complete body.
 */
export function withHeadingIds(blocks: PortableTextBlock[] | null | undefined): WithHeadingId[] {
  if (!blocks?.length) return [];
  const slugger = new GithubSlugger();
  return blocks.map((block) => {
    if (block._type !== "block" || !block.style || !HEADING_STYLES.has(block.style)) {
      return block as WithHeadingId;
    }
    return { ...block, _headingId: slugger.slug(headingText(block)) };
  });
}
