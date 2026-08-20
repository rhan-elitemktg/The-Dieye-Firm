import { defineType, defineField } from "sanity";
import { BulbOutlineIcon } from "@sanity/icons/BulbOutline";

/* /about-us/choosing-a-family-law-attorney/ — the hiring guide.
 *
 * A SINGLETON. This page has NO COMP: it was built from the live site's own 738
 * words, because where the client's published prose exists it is the source,
 * and it carries the search equity. Treat the text here as theirs.
 *
 * The body is PORTABLE TEXT for the same reason as the privacy policy: these
 * paragraphs carry LINKS inside sentences, pointing at practice-area pages. As
 * plain strings an editor would be typing `<a href>` by hand, and a broken one
 * would be a dead cross-link on a page whose whole job is cross-linking.
 *
 * ONE field for the whole body, headings included. It was five {heading, body}
 * sections until 2026-08-20, split that way because Portable Text headings go
 * through ProseHeading and would have gained ids these never had. That is now
 * handled where it belongs — the page passes `headingIds={false}` to ProseBody,
 * so the h2s render bare exactly as they did — and an editor gets one box
 * instead of five paired fields for what is one continuous 738-word read.
 *
 * The practice-area menu in the sidebar is not modelled: it is the same
 * FamilyLawNav the 32 practice-area pages render, driven by the collection.
 */
export const hiringGuidePage = defineType({
  name: "hiringGuidePage",
  title: "Choosing an Attorney Page",
  type: "document",
  icon: BulbOutlineIcon,
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
      name: "body",
      title: "Body",
      type: "blockContent",
      group: "content",
      description:
        "The whole page under the header. Use Heading 2 for the section headings and Heading 3 beneath them if a section ever needs splitting; links and bold sit inside the sentences.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Choosing an Attorney Page" }) },
});
