import { defineType, defineField, defineArrayMember } from "sanity";
import { PinIcon } from "@sanity/icons/Pin";

/* A location page. Thirty-two of them, across four service areas.
 *
 * ═══ These live at the SITE ROOT ═══
 *
 * /sugar-land-family-law-attorney/, not /locations/sugar-land/. The slug is the
 * whole path from the root, so it can collide with a real page — and a collision
 * is SILENT: `getStaticPaths` would emit two routes writing the same
 * index.html, last one wins, with a green build and a page quietly replaced.
 *
 * Guarded twice, deliberately. The slug field refuses a reserved first segment
 * here, so an editor is stopped in the Studio; and the route throws at build
 * time, so a document created before this rule existed still fails loudly rather
 * than eating a page.
 *
 * ═══ `location` and `parent` are not derived from the URL ═══
 *
 * Same rule as the practice areas, one level out. `location` says which of the
 * four service areas a page belongs to and drives its sidebar menu; on a
 * location root it points at itself, so "which location am I in" is total with
 * no branch. Two Pasadena pages hang off the site root rather than under
 * /pasadena-family-law-attorney/ and are placed in that menu by `location`
 * alone — their URLs do not move.
 *
 * `parent` is set only at the third level (…/divorce/uncontested-divorce/ sits
 * under …/divorce/). A page one segment under a location root is a top-level row
 * of that menu, which is what lets buildTree be shared with the practice areas
 * unchanged.
 *
 * ═══ Not to be confused with Firm Details → Service Areas ═══
 *
 * That is the four nav entries. This is the 32 pages. Keeping the names apart
 * matters: they are different things and one references the other.
 */

/* Paths the site already serves. A location page claiming one of these would
   overwrite it. `admin` is in the list and is NOT a file in src/pages — it is
   injected by @sanity/astro, so a guard derived from the filesystem would miss
   exactly the route an editor could least afford to lose. */
const RESERVED_FIRST_SEGMENTS = [
  "about-us",
  "admin",
  "blog",
  "client-portal",
  "contact-us",
  "faq",
  "family-law",
  "practice-areas",
  "privacy-policy",
  "sitemap",
  "testimonials",
  "thank-you",
  "video-center",
];

export const locationPage = defineType({
  name: "locationPage",
  title: "Location Pages",
  type: "document",
  icon: PinIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Page heading",
      type: "string",
      description:
        'The <h1>, and the default search-result title — e.g. "Sugar Land Paternity Attorney".',
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "navLabel",
      title: "Short name",
      type: "string",
      description:
        'What the sidebar menu calls this page — "Paternity", or "Sugar Land" on a location\'s main page.',
      group: "content",
      validation: (rule) =>
        rule
          .required()
          .max(40)
          .warning("Long labels wrap in the sidebar menu; under about 40 characters is safest."),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      description:
        'The full path from the site root — "sugar-land-family-law-attorney" or "sugar-land-family-law-attorney/divorce/uncontested-divorce". These match the live site exactly, so changing one costs a redirect.',
      options: { source: "title", maxLength: 120 },
      group: "content",
      validation: (rule) =>
        rule.required().custom((slug: { current?: string } | undefined) => {
          const current = slug?.current;
          if (!current) return true;
          if (current.startsWith("/") || current.endsWith("/")) {
            return "Leave off the leading and trailing slashes — just sugar-land-family-law-attorney/divorce.";
          }
          const first = current.split("/")[0];
          if (RESERVED_FIRST_SEGMENTS.includes(first)) {
            return `"${first}" is already a section of the site. A page here would replace it. Pick a different first part of the URL.`;
          }
          return true;
        }),
    }),
    defineField({
      name: "location",
      title: "Service area",
      type: "reference",
      to: [{ type: "locationPage" }],
      description:
        "Which service area's menu this page belongs to. On a service area's own main page, point it at itself.",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "parent",
      title: "Sits under",
      type: "reference",
      to: [{ type: "locationPage" }],
      description:
        "Only for a third-level page, e.g. Uncontested Divorce under Divorce. Leave empty and this becomes a top-level row of the service area's menu.",
      group: "content",
    }),
    defineField({
      name: "subtitle",
      title: "Deck",
      type: "string",
      description: "The line under the heading. Leave empty to omit it.",
      group: "content",
    }),
    defineField({
      name: "body",
      title: "Page content",
      type: "blockContent",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "faqs",
      title: "Frequently asked questions",
      type: "array",
      description:
        "Shown below the page content, and submitted to Google as FAQ markup. Leave empty to omit the section.",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "faq",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "blockContent",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "question" } },
        }),
      ],
    }),
    defineField({
      name: "legacyPath",
      title: "Original URL",
      type: "string",
      description:
        "The path this page had on the previous site. Kept as a record for the SEO team; nothing renders it.",
      group: "seo",
      readOnly: true,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: { title: "navLabel", slug: "slug.current", area: "location.navLabel" },
    prepare({ title, slug, area }) {
      return {
        title: title ?? "Untitled",
        subtitle: `${area ? `${area}  ·  ` : ""}/${slug}/`,
      };
    },
  },
});
