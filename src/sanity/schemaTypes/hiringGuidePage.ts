import { defineType, defineField, defineArrayMember } from "sanity";
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
 * Headings stay outside the rich text — Portable Text headings go through
 * ProseHeading and would gain ids these never had.
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
        defineField({
          name: "kickerHref",
          title: "Kicker link",
          type: "string",
          description: "The kicker is a breadcrumb back to /about-us/. Leave empty to render it as plain text.",
        }),
        defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
      ],
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
          ],
          preview: { select: { title: "heading" } },
        }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Choosing an Attorney Page" }) },
});
