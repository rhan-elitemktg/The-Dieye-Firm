import type { PortableTextBlock } from "@portabletext/types";

/* Flatten Portable Text to plain text.
 *
 * For the places that need the words without the markup: JSON-LD (a FAQ answer
 * in schema.org/Answer is a string), meta descriptions, and card summaries.
 *
 * Blocks are joined with a space rather than a newline. Every consumer today
 * puts the result inside a JSON string where a literal newline would have to be
 * escaped and buys nothing, and schema.org answers read as one passage.
 */
export function toPlainText(blocks: PortableTextBlock[] | null | undefined): string {
  if (!blocks?.length) return "";
  return blocks
    .map((block) => {
      if (block._type !== "block") return "";
      return (block.children ?? [])
        .map((child) => ("text" in child && typeof child.text === "string" ? child.text : ""))
        .join("");
    })
    .filter(Boolean)
    .join(" ");
}
