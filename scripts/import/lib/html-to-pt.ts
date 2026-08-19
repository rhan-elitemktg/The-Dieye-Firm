/* The small HTML subset these two pages' prose uses -> Portable Text.
 *
 * Written for a ONE-TIME import, not as a general converter. It handles exactly
 * what /privacy-policy/ and /about-us/choosing-a-family-law-attorney/ contain:
 * text, `<strong>`, `<a href>`, and HTML entities. Anything else throws, because
 * silently dropping a tag from a legal page is the failure worth preventing.
 *
 * Entities become real characters — `&ldquo;` becomes a curly quote — since a
 * Portable Text span holds text, not markup. That renders identically: the
 * browser saw a curly quote before and sees one now. It is the only difference
 * the byte-diff shows for these pages, and it is the same class as the `&#39;`
 * escaping the rest of phase 5 produced, in the other direction.
 *
 * Keys are derived from position rather than random, so re-running the import
 * produces the same document and a re-run is a no-op rather than a diff.
 */

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type MarkDef = { _type: "link"; _key: string; href: string };

export type Block = {
  _type: "block";
  _key: string;
  style: "normal";
  listItem?: "bullet";
  level?: number;
  markDefs: MarkDef[];
  children: Span[];
};

const ENTITIES: Record<string, string> = {
  "&ldquo;": "“",
  "&rdquo;": "”",
  "&lsquo;": "‘",
  "&rsquo;": "’",
  "&ndash;": "–",
  "&mdash;": "—",
  "&hellip;": "…",
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

/** Entities -> real characters, for plain strings as well as span text. A
    heading stored as "Surveys &amp; Contests" and rendered through {expression}
    would come out as "Surveys &amp;amp; Contests" — escaped twice. */
export function decode(text: string): string {
  return text.replace(/&[a-z]+;|&#\d+;/gi, (entity) => {
    const hit = ENTITIES[entity.toLowerCase()];
    if (hit === undefined) throw new Error(`html-to-pt: unknown entity ${entity}`);
    return hit;
  });
}

/** One paragraph (or list item) of inner HTML -> one Portable Text block. */
export function htmlToBlock(html: string, key: string, listItem?: "bullet"): Block {
  const children: Span[] = [];
  const markDefs: MarkDef[] = [];
  let rest = html;
  let cursor = 0;

  const push = (text: string, marks: string[]) => {
    if (!text) return;
    children.push({ _type: "span", _key: `${key}s${children.length}`, text: decode(text), marks });
  };

  while (rest.length) {
    const next = rest.search(/<\w+/);
    if (next === -1) {
      push(rest, []);
      break;
    }
    push(rest.slice(0, next), []);
    rest = rest.slice(next);

    const strong = /^<strong>([\s\S]*?)<\/strong>/.exec(rest);
    const anchor = /^<a href="([^"]+)">([\s\S]*?)<\/a>/.exec(rest);

    if (strong) {
      if (/</.test(strong[1])) throw new Error(`html-to-pt: nested markup inside <strong>: ${strong[1]}`);
      push(strong[1], ["strong"]);
      rest = rest.slice(strong[0].length);
    } else if (anchor) {
      if (/</.test(anchor[2])) throw new Error(`html-to-pt: nested markup inside <a>: ${anchor[2]}`);
      const markKey = `${key}l${cursor++}`;
      markDefs.push({ _type: "link", _key: markKey, href: anchor[1] });
      push(anchor[2], [markKey]);
      rest = rest.slice(anchor[0].length);
    } else {
      throw new Error(`html-to-pt: unsupported markup at ${rest.slice(0, 60)}`);
    }
  }

  return {
    _type: "block",
    _key: key,
    style: "normal",
    ...(listItem ? { listItem, level: 1 } : {}),
    markDefs,
    children,
  };
}

/** A run of paragraph strings -> a Portable Text body. */
export function paragraphsToPt(paragraphs: string[], prefix: string): Block[] {
  return paragraphs.map((html, i) => htmlToBlock(html, `${prefix}${i}`));
}

/** A bulleted list -> one block per item. */
export function listToPt(items: string[], prefix: string): Block[] {
  return items.map((html, i) => htmlToBlock(html, `${prefix}${i}`, "bullet"));
}
