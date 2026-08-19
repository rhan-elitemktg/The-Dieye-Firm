import { defineType, defineField, defineArrayMember } from "sanity";
import { ThListIcon } from "@sanity/icons/ThList";

/* /sitemap/ — the page header, and nothing else.
 *
 * A SINGLETON. The LIST on this page is deliberately not modelled: every row is
 * derived from the collections and from firmDetails, so it maintains itself.
 * Modelling it would replace something that is always right with something that
 * goes stale the first time a page is added. The plan says so explicitly.
 *
 * The standfirst carries the page count, so it is a template with a {count}
 * token rather than a sentence with a number typed into it. A number an editor
 * can type is a number that can disagree with the list beneath it.
 */
export const sitemapPage = defineType({
  name: "sitemapPage",
  title: "Site Map Page",
  type: "document",
  icon: ThListIcon,
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
        defineField({
          name: "deckTemplate",
          title: "Standfirst",
          type: "string",
          description:
            "Write {count} where the number of pages should go — it is counted at build time, so it can never be wrong. Leaving it out simply omits the number.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Site Map Page" }) },
});
