import { defineType, defineField } from "sanity";
import { CheckmarkCircleIcon } from "@sanity/icons/CheckmarkCircle";
import { capButton, capEyebrow, capHeading, capHeadingAccent } from "./limits";

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
          validation: (rule) => capEyebrow(rule.required()),
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
          type: "text",
          rows: 2,
          description:
            "Press Enter to break the line. Every line gets a break, and the italic part below opens the line after them — unlike the homepage, where the italic finishes the last line.",
          validation: (rule) => rule.required(),
        }),
        defineField({ name: "headingAccent", title: "Heading — italic part", type: "string", validation: (rule) => capHeadingAccent(rule) }),
        defineField({
          name: "headingTail",
          title: "Heading — after the italic",
          type: "string",
          description: "Start with punctuation to butt it against the italic, or with a word to have a space added.",
          validation: (rule) => capHeading(rule),
        }),
        defineField({ name: "lead", title: "Lead", type: "text", rows: 6, validation: (rule) => rule.required() }),
        defineField({
          name: "ctaLabel",
          title: "Button label",
          type: "string",
          description: "It points at /about-us/.",
          validation: (rule) => capButton(rule.required()),
        }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Thank You Page" }) },
});
