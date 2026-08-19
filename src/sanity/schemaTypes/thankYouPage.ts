import { defineType, defineField, defineArrayMember } from "sanity";
import { CheckmarkCircleIcon } from "@sanity/icons/CheckmarkCircle";

/* /thank-you/ — where the consultation form lands.
 *
 * A SINGLETON. Two bands: the confirmation, and the photo card that fills the
 * wait. The awards strip below them is a shared record.
 *
 * This is the ONE page entitled to `contactVariant="none"`: the visitor has
 * just submitted that exact form, so closing with "Take the First Step" would
 * invite a duplicate enquiry and read as though the first one had not
 * registered. That is a Layout prop rather than a field, so the default stays
 * "every page closes with the prompt".
 *
 * Its heading is the only one on the site that puts a line break BEFORE the
 * italic rather than after a full line — see the note in MeetTheAttorney.astro.
 */
export const thankYouPage = defineType({
  name: "thankYouPage",
  title: "Thank You Page",
  type: "document",
  icon: CheckmarkCircleIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "head",
      title: "Confirmation",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
      ],
    }),
    defineField({
      name: "band",
      title: "Meet the Attorney band",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "headingLines",
          title: "Heading",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
          description:
            "One entry per line. Each is followed by a line break, and the italic part below opens the line after them.",
          validation: (rule) => rule.required().min(1),
        }),
        defineField({ name: "headingAccent", title: "Heading — italic part", type: "string" }),
        defineField({
          name: "headingTail",
          title: "Heading — after the italic",
          type: "string",
          description: "Start with punctuation to butt it against the italic, or with a word to have a space added.",
        }),
        defineField({ name: "lead", title: "Lead", type: "text", rows: 6, validation: (rule) => rule.required() }),
        defineField({
          name: "ctaLabel",
          title: "Button label",
          type: "string",
          description: "It points at /about-us/.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Thank You Page" }) },
});
