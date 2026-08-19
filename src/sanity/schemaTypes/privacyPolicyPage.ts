import { defineType, defineField, defineArrayMember } from "sanity";
import { LockIcon } from "@sanity/icons/Lock";

/* /privacy-policy/ — the firm's published policy.
 *
 * A SINGLETON. The body is PORTABLE TEXT, unlike every other page document in
 * phase 5, and this is the one page where that is the right answer: the prose
 * carries bold inside sentences, so a plain string field would hand a lawyer a
 * box with `<strong>` tags in it and a way to break the page by mistyping one.
 *
 * The headings are NOT inside the rich text, deliberately. Portable Text
 * headings go through ProseHeading, which stamps an id on every one — right for
 * an article body an anchor might point into, wrong here, where it would add
 * ids to eight headings that never had them. Each section keeps its heading as
 * a plain string beside its body.
 *
 * ═══ The one interpolated sentence ═══
 *
 * The closing paragraph gives the phone number and the postal address, and both
 * come from `firmDetails` rather than being typed here — the same rule the rest
 * of the site follows, and the reason a wrong number in a comp never reached
 * the site. `contactNote` is the sentence BEFORE them; the page appends the NAP.
 */
export const privacyPolicyPage = defineType({
  name: "privacyPolicyPage",
  title: "Privacy Policy Page",
  type: "document",
  icon: LockIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "header",
      title: "Page header",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
      ],
    }),
    defineField({
      name: "intro",
      title: "Opening",
      type: "blockContent",
      group: "content",
      description: "The paragraphs above the first heading.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      group: "content",
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "section",
          fields: [
            defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "body", title: "Text", type: "blockContent", validation: (rule) => rule.required() }),
            defineField({
              name: "contactNote",
              title: "Closing sentence with the firm's contact details",
              type: "string",
              description:
                "Only the last section uses this. Write the sentence UP TO the phone number — the number and the postal address are added from Firm Details, so they can never go stale here.",
            }),
          ],
          preview: { select: { title: "heading" } },
        }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Privacy Policy Page" }) },
});
