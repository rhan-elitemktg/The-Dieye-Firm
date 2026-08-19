import { defineType, defineArrayMember, defineField } from "sanity";
import { bodyBlockMember } from "./blockContent";

/* The homepage About section's body, as ONE rich-text field.
 *
 * ═══ Why this is a second rich-text type, when blockContent says not to ═══
 *
 * `blockContent` is the site's one toolbar and stays that way. This is the
 * documented exception it names — "a superset that reuses this same factory" —
 * and it exists because this section's body is not freeform prose. It has a
 * fixed visual vocabulary that the toolbar has to match one for one:
 *
 *   Lead        the opening paragraph, set larger and darker
 *   Normal      body paragraph
 *   Heading 3   the section's sub-heads
 *   Bulleted    NOT a bulleted list - it renders as the gold-tick checklist
 *   Pull quote  a block object; the headshot, name and title come from the
 *               `attorney` record, so only the sentence is typed here
 *
 * The marks come straight from `bodyBlockMember()`, so bold, italic and the
 * link annotation behave and validate exactly as they do everywhere else. Only
 * the block styles and lists are narrowed, and narrowing is the point: the
 * standard toolbar offers H2, H4 and Quote, and this section styles none of
 * them, so an editor could pick one and get unstyled text with nothing failing.
 *
 * If a third section ever wants this shape, promote it rather than copying it.
 */
const textBlock = bodyBlockMember();

export const aboutBody = defineType({
  name: "aboutBody",
  title: "Body",
  type: "array",
  of: [
    defineArrayMember({
      ...textBlock,
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Lead", value: "lead" },
        { title: "Heading 3", value: "h3" },
      ],
      lists: [{ title: "Checklist", value: "bullet" }],
    }),
    defineArrayMember({
      type: "object",
      name: "pullquote",
      title: "Pull quote",
      fields: [
        defineField({
          name: "quote",
          title: "Quote",
          type: "text",
          rows: 3,
          description:
            "Type the sentence without quotation marks - the marks, the headshot, and the name and title below it are all supplied by the page from the Attorney record.",
          validation: (rule) => rule.required(),
        }),
      ],
      preview: {
        select: { quote: "quote" },
        prepare: ({ quote }) => ({ title: quote, subtitle: "Pull quote" }),
      },
    }),
  ],
});
