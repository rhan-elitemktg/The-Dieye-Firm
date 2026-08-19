import { defineType, defineField, defineArrayMember } from "sanity";
import { HeartIcon } from "@sanity/icons/Heart";
import { iconList } from "./iconOptions";

/* "The standard we hold" — the navy band of three values, on 8 pages.
 *
 * A SINGLETON. It is one band that renders identically everywhere it appears
 * (/about-us/, /about-us/choosing-a-family-law-attorney/, /practice-areas/,
 * /blog/, /faq/, /testimonials/, /video-center/), not a section any one page
 * owns, so editing it once changes all eight.
 *
 * ═══ Three values, and the layout means it ═══
 *
 * `.drives__grid` is `repeat(3, minmax(0, 1fr))`, so a fourth value silently
 * starts a second row holding one card and an eight-page band goes lopsided.
 * The array is capped and floored at three rather than left open, because the
 * failure is visual and an editor would only find it by looking.
 *
 * ═══ Why the icon is a picker and not an upload ═══
 *
 * The three glyphs are inlined SVGs from src/assets/icons/, drawn to take their
 * colour from the card through `currentColor`. An uploaded file would not do
 * that — it would arrive as an <img> and lose the colour, so the field names one
 * of the three the site actually has. Adding a fourth glyph is a code change,
 * which is honest: someone has to draw it.
 */
export const whatDrivesUs = defineType({
  name: "whatDrivesUs",
  title: "What Drives Us Band",
  type: "document",
  icon: HeartIcon,
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "The small gold line above the heading.",
      validation: (rule) =>
        rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
    }),
    defineField({
      name: "headingLead",
      title: "Heading",
      type: "string",
      description: 'The plain first part — e.g. "The standard".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "headingAccent",
      title: "Heading — italic part",
      type: "string",
      description: 'Rendered in gold italic — e.g. "we hold." Leave empty for none.',
    }),
    defineField({
      name: "values",
      title: "The three values",
      type: "array",
      description:
        "Exactly three. The band is a three-column grid on desktop, so a fourth would sit alone on a second row.",
      validation: (rule) => rule.required().length(3),
      of: [
        defineArrayMember({
          type: "object",
          name: "value",
          fields: [
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              description: "One of the three glyphs the site carries.",
              options: {
                list: iconList("compassionate-approach", "client-focused", "experienced"),
                layout: "radio",
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              description:
                'Kept short — "Direct, Personal Attention" is the longest that holds one line on a desktop card.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "text",
              title: "Text",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "text" },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "What Drives Us Band" }),
  },
});
