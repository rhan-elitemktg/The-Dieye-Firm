/* Markdown -> Portable Text, for the one-time Sanity import.
 *
 * This runs at IMPORT time only. Nothing on the site imports it; once the 80
 * markdown files are in Sanity it retires alongside the scrapers.
 *
 * ---- why it parses with satteri rather than a regex ------------------------
 *
 * Astro 7 renders markdown with `satteri`, via @astrojs/markdown-satteri. There
 * is no remark and no rehype in this project. Parsing with satteri's own
 * `markdownToHast` therefore means the import sees *exactly* the tree Astro
 * rendered the baseline from — the comparison isn't "close enough", it's the
 * same parse.
 *
 * Two things fall out of that for free:
 *
 *   - Entities are already decoded. `&sect;` survived the scrape into the .md
 *     (decodeEntities in html.mjs has no `sect`), and satteri decodes it at
 *     render, which is why dist/ already shows `§`. Coming through hast we
 *     inherit that. This matters more than it sounds: astro-portabletext emits
 *     {node.text}, which Astro escapes, so a literal `&sect;` stored in Sanity
 *     would render as visible `&sect;` on the page.
 *   - Link text containing parentheses parses correctly. The corpus contains
 *     `[Pensions, 401(k) plans, and savings plans](/family-law/qdros/)`, which a
 *     naive `\[(.+?)\]\((.+?)\)` truncates at the first `)` — silently, into a
 *     broken href.
 *
 * ---- the grammar, bounded by construction ----------------------------------
 *
 * `toMarkdown()` in ./html.mjs is the only thing that ever wrote these files and
 * it can only emit h2|h3|p|ul|ol plus links, bold and italic. Parsing all 80
 * files confirms what actually landed:
 *
 *   block   p 1045 · h2 370 · h3 178 · h4 5 · ul 128 (li 552) · ol 2 (li 10)
 *   inline  text 3066 · a 339 · strong 384 · a-inside-strong 12
 *   props   href, and nothing else
 *
 * Zero em, blockquote, code, img, hr, table, nested list or stray text. The
 * converter handles that set and THROWS on anything else — a document that grows
 * a new construct should stop the import, not lose a paragraph quietly.
 *
 * ---- keys ------------------------------------------------------------------
 *
 * _key values are positional, not random. The import uses createOrReplace with
 * deterministic document ids so it can be re-run while iterating; random keys
 * would make every run produce different bytes for identical content, which
 * defeats that and adds noise to every diff.
 */

import { markdownToHast } from "satteri";

/* Astro's own markdown defaults, and they are NOT satteri's — `markdownToHast`
 * with no options applies neither, while @astrojs/markdown-satteri passes both
 * (`gfm: gfm !== false, smartPunctuation: smartypants !== false`).
 *
 * smartPunctuation is the one that matters, and it is easy to miss because it
 * changes nothing structural. The markdown files hold typewriter punctuation —
 * `accuser's`, `"quoted"`, `--`, `...` — and Astro renders them as `accuser’s`,
 * `“quoted”`, `–`, `…`. So the bytes on the live page are not the bytes in the
 * file. Import without this and Sanity gets straight quotes, every one of which
 * renders as a visible change on a page of the client's own prose.
 *
 * Storing the typographic form is also the right end state: Portable Text is the
 * source of truth after this migration, so what an editor sees in the Studio
 * should be what a reader sees on the page, with no transform in between. */
const FEATURES = { gfm: true, smartPunctuation: true };

const BLOCK_STYLE = { p: "normal", h2: "h2", h3: "h3", h4: "h4" };
const LIST_ITEM = { ul: "bullet", ol: "number" };

/** Strip a YAML frontmatter block, if present. */
export function stripFrontmatter(raw) {
  return raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

/* Walk an inline subtree, accumulating marks down the branch. `strong` is a
   decorator (a bare string); a link is a markDef whose _key goes in the same
   list — which is how a link inside bold ends up as one span carrying both. */
function collectSpans(node, marks, ctx) {
  if (node.type === "text") {
    if (!node.value) return;
    const last = ctx.spans[ctx.spans.length - 1];
    /* Merge with the previous span when the mark set is identical, so a run of
       text broken up by the parser doesn't become several spans. */
    if (last && sameMarks(last.marks, marks)) {
      last.text += node.value;
      return;
    }
    ctx.spans.push({
      _type: "span",
      _key: `s${ctx.spans.length}`,
      text: node.value,
      marks: [...marks],
    });
    return;
  }

  if (node.type !== "element") {
    throw new Error(`Unexpected inline node type "${node.type}" in ${ctx.source}`);
  }

  if (node.tagName === "strong" || node.tagName === "b") {
    for (const child of node.children ?? []) collectSpans(child, [...marks, "strong"], ctx);
    return;
  }
  if (node.tagName === "em" || node.tagName === "i") {
    for (const child of node.children ?? []) collectSpans(child, [...marks, "em"], ctx);
    return;
  }
  if (node.tagName === "a") {
    const href = node.properties?.href;
    if (typeof href !== "string" || !href) {
      throw new Error(`Link with no href in ${ctx.source}`);
    }
    const key = `l${ctx.markDefs.length}`;
    ctx.markDefs.push({ _key: key, _type: "link", href });
    for (const child of node.children ?? []) collectSpans(child, [...marks, key], ctx);
    return;
  }
  if (node.tagName === "br") {
    /* html.mjs's inlineToMd can emit a hard break. None exists in the corpus
       today; represent it as a newline inside the span rather than dropping it. */
    collectSpans({ type: "text", value: "\n" }, marks, ctx);
    return;
  }

  throw new Error(`Unexpected inline element <${node.tagName}> in ${ctx.source}`);
}

const sameMarks = (a, b) => a.length === b.length && a.every((m, i) => m === b[i]);

/** Build one Portable Text block from a hast element's inline children. */
function toBlock(children, { style, listItem, key, source }) {
  const ctx = { spans: [], markDefs: [], source };
  for (const child of children ?? []) collectSpans(child, [], ctx);

  const block = {
    _type: "block",
    _key: key,
    style,
    markDefs: ctx.markDefs,
    children: ctx.spans.length
      ? ctx.spans
      : [{ _type: "span", _key: "s0", text: "", marks: [] }],
  };
  if (listItem) {
    block.listItem = listItem;
    block.level = 1;
  }
  return block;
}

/**
 * Convert a markdown body to a Portable Text block array.
 *
 * @param {string} markdown  body text, with or without frontmatter
 * @param {string} source    a path or slug, used only in error messages
 */
export async function markdownToPortableText(markdown, source = "<unknown>") {
  const tree = await markdownToHast(stripFrontmatter(markdown), { features: FEATURES });
  const blocks = [];

  for (const node of tree.children ?? []) {
    /* satteri puts the newlines between blocks in the tree as text nodes. */
    if (node.type === "text") {
      if (node.value.trim()) {
        throw new Error(`Stray top-level text in ${source}: ${node.value.slice(0, 60)}`);
      }
      continue;
    }
    if (node.type !== "element") {
      throw new Error(`Unexpected top-level node type "${node.type}" in ${source}`);
    }

    const style = BLOCK_STYLE[node.tagName];
    if (style) {
      blocks.push(
        toBlock(node.children, { style, key: `b${blocks.length}`, source }),
      );
      continue;
    }

    const listItem = LIST_ITEM[node.tagName];
    if (listItem) {
      for (const li of node.children ?? []) {
        if (li.type === "text") {
          if (li.value.trim()) throw new Error(`Stray text in <${node.tagName}> in ${source}`);
          continue;
        }
        if (li.type !== "element" || li.tagName !== "li") {
          throw new Error(`Unexpected <${li.tagName ?? li.type}> inside <${node.tagName}> in ${source}`);
        }
        /* A nested list would arrive as an element child of the <li>. Nothing in
           the corpus has one, and Portable Text would need a level bump — so
           refuse rather than silently flatten it. */
        for (const c of li.children ?? []) {
          if (c.type === "element" && (c.tagName === "ul" || c.tagName === "ol")) {
            throw new Error(`Nested list in ${source} — not supported, and none existed at import`);
          }
        }
        blocks.push(
          toBlock(li.children, { style: "normal", listItem, key: `b${blocks.length}`, source }),
        );
      }
      continue;
    }

    if (node.tagName === "blockquote") {
      /* Flatten the paragraphs inside; Portable Text's blockquote is a style on
         a block, not a container. None exists in the corpus. */
      for (const p of node.children ?? []) {
        if (p.type !== "element") continue;
        blocks.push(
          toBlock(p.children, { style: "blockquote", key: `b${blocks.length}`, source }),
        );
      }
      continue;
    }

    throw new Error(`Unexpected top-level element <${node.tagName}> in ${source}`);
  }

  return blocks;
}
