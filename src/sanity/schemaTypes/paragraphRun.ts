import { defineType, defineArrayMember } from "sanity";
import { bodyBlockMember } from "./blockContent";

/* A run of plain paragraphs, as one field.
 *
 * The site has five of these - three on /about-us/, two on the homepage - and
 * they were all arrays of `text` boxes with drag handles. They are prose, so
 * they are rich text now; what they are NOT is an article, and that is what
 * this type encodes.
 *
 * ═══ Why not `blockContent` ═══
 *
 * blockContent is the article toolbar: H2, H3, H4, Quote, bulleted and numbered
 * lists. Every section using THIS type styles exactly one thing - a paragraph -
 * so an editor offered that toolbar could pick a heading and get unstyled text
 * with nothing failing. The narrowing is the safety.
 *
 * ═══ Why not a string, which is what these were ═══
 *
 * The marks. Bold, italic and the link annotation come straight from
 * `bodyBlockMember()`, so this validates and behaves like every other rich-text
 * field on the site, and a sentence can finally link to the practice area it
 * names. That was impossible while these were plain text.
 *
 * There are no block styles beyond Normal and no lists, so the toolbar an
 * editor sees is: bold, italic, link. Nothing that can render unstyled.
 */
const textBlock = bodyBlockMember();

export const paragraphRun = defineType({
  name: "paragraphRun",
  title: "Paragraphs",
  type: "array",
  of: [
    defineArrayMember({
      ...textBlock,
      styles: [{ title: "Normal", value: "normal" }],
      lists: [],
    }),
  ],
});
