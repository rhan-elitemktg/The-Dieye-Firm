import { defineType, defineField, defineArrayMember } from "sanity";
import { ErrorOutlineIcon } from "@sanity/icons/ErrorOutline";

/* The 404 page.
 *
 * A SINGLETON. It emits `noindex, follow` and is not in the sitemap, so it is
 * the one page here with nothing for the SEO tab to do — the tab is still
 * present for consistency, and still reserved for /new-seo-setup.
 *
 * The phone number is NOT a field: it comes from Firm Details, so this page
 * cannot end up offering a number the rest of the site has stopped using.
 */
export const notFoundPage = defineType({
  name: "notFoundPage",
  title: "404 Page",
  type: "document",
  icon: ErrorOutlineIcon,
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
        defineField({ name: "deck", title: "Standfirst", type: "text", rows: 2, validation: (rule) => rule.required() }),
      ],
    }),
    defineField({
      name: "routes",
      title: "Where to go instead",
      type: "array",
      group: "content",
      description: "The places a lost visitor is most likely to have wanted.",
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "route",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
            defineField({
              name: "href",
              title: "Link",
              type: "string",
              description: "A path on this site, with both slashes — e.g. /practice-areas/.",
              validation: (rule) => rule.required().regex(/^\/.*$/, { name: "site path" }).error("Start with a slash."),
            }),
            defineField({ name: "note", title: "Note", type: "string", validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: "label", subtitle: "note" } },
        }),
      ],
    }),
    defineField({
      name: "callLead",
      title: "Phone line",
      type: "string",
      group: "content",
      description:
        "The sentence before the phone number. The number itself comes from Firm Details and the full stop is added, so end this on the last word.",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "404 Page" }) },
});
