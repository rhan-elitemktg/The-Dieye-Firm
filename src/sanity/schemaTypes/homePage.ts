import { defineType, defineField } from "sanity";
import { HomeIcon } from "@sanity/icons/Home";

/* The homepage.
 *
 * A singleton — the fixed document id is pinned in src/sanity/structure.ts,
 * since Sanity has no `singleton: true` schema option.
 *
 * ═══ Two conventions this document establishes for every page type ═══
 *
 * 1. EVERY SECTION IS A COLLAPSED OBJECT. Each visible band on the page is an
 *    `object` field with `options: { collapsible: true, collapsed: true }` and
 *    NO `description` on the object itself — the title says what it is, and
 *    anything that needs explaining is explained on the field inside, where an
 *    editor is actually looking. The page then opens as a tidy list of closed
 *    accordions in roughly the order the sections appear on the page, instead of
 *    a wall of eighty fields.
 *
 *    This applies to list-only sections too. `collapsible` is an ObjectOptions
 *    flag and arrays have no equivalent, so a section that is really just a list
 *    still gets the object wrapper.
 *
 * 2. CONTENT AND SEO ARE TABS. `groups` puts search metadata behind its own tab
 *    so it never sits between two pieces of copy. Two things to know: an
 *    UNGROUPED field is invisible in every named tab (only "All fields" shows
 *    it), so every top-level field must carry a `group`; and Sanity prepends its
 *    own "All fields" tab, so the count is always one higher than declared.
 *
 * ═══ This document is grown one migration phase at a time ═══
 *
 * The homepage composes eleven bands and must never be migrated in one go. Each
 * phase adds the sections it is responsible for; everything not yet here is
 * still hardcoded in the matching component under src/components/home/. The
 * sections below are the ones that own a SELECTION of documents rather than
 * copy — their headings and body text arrive with the rest of the page.
 */
export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "about",
      title: "About section",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "pullQuote",
          title: "Pull quote",
          type: "reference",
          to: [{ type: "testimonial" }],
          description:
            "The review quoted beside the video. Pick a SHORT one — past about 50 words it pushes the video tile below the fold. Choose one that isn't also in Success Stories below, or the same words appear twice on this page.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "testimonials",
      title: "Success Stories",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "picks",
          title: "Reviews to show",
          type: "array",
          of: [{ type: "reference", to: [{ type: "testimonial" }] }],
          description:
            "Six reviews, in the order they should appear. Prefer ones whose pull quote isn't repeated word-for-word inside the review — on three cards side by side that repetition is the first thing the eye catches.",
          validation: (rule) =>
            rule
              .required()
              .length(6)
              .error("The band is built for exactly six cards.")
              .unique(),
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home Page" }),
  },
});
