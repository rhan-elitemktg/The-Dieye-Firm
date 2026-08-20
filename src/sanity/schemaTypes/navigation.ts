import { defineType, defineField, defineArrayMember } from "sanity";
import { MenuIcon } from "@sanity/icons/Menu";

/* Navigation — every menu on the site, in one place. A SINGLETON.
 *
 * ═══ Top-level nav rows are NOT here, deliberately ═══
 *
 * The seven rows of the main nav — About, Practice Areas, Service Areas,
 * Testimonials, Resources, Blog — are declared in
 * `src/components/header/MainNav.astro` and stay there. Their labels are
 * width-constrained (the header collapses to a hamburger at a MEASURED
 * breakpoint, and a longer label moves it), one of them is deliberately
 * hrefless so it renders as a button, and two carry `activeUnder` prefixes
 * that decide which row lights up. None of that is content; all of it is
 * layout that happens to contain words.
 *
 * What IS here is what goes UNDER those rows, which is genuinely editorial:
 * which five practice areas are worth promoting, which service areas exist,
 * what sits under About and Resources.
 *
 * ═══ Why the practice-area flyout is a REFERENCE and not a link ═══
 *
 * Each row points at a `practiceArea` DOCUMENT rather than carrying its own
 * label and URL. That keeps the guarantee the hardcoded version had: a page
 * that moves takes its nav link with it, and a page that is deleted breaks the
 * build loudly instead of shipping a menu row that 404s. `label` overrides the
 * document's own `navLabel` only where the nav needs it shorter — the flyout
 * calls "Protective & Restraining Orders" "Protective Orders", because the row
 * is tight and the two are the same thing to a visitor.
 *
 * The order is editorial and is NOT alphabetical, unlike the sidebar index. A
 * menu ranks; an index lists.
 */
export const navigation = defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  icon: MenuIcon,
  groups: [
    { name: "header", title: "Header menus", default: true },
    { name: "footer", title: "Footer" },
  ],
  fields: [
    defineField({
      name: "practiceAreaLinks",
      title: "Practice Areas dropdown",
      description:
        "The shortlist under Practice Areas in the main nav — a promotion, not an index. Everything else is reachable through “View All” and through the menu in every practice-area page's sidebar. Drag to reorder.",
      type: "array",
      group: "header",
      of: [
        defineArrayMember({
          type: "object",
          name: "practiceAreaLink",
          fields: [
            defineField({
              name: "area",
              title: "Practice area",
              type: "reference",
              to: [{ type: "practiceArea" }],
              options: { disableNew: true },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "label",
              title: "Shorter label",
              description:
                "Optional. Leave empty to use the page's own short name. Set it only where the nav row is too tight for that — the flyout shows “Protective Orders” for “Protective & Restraining Orders”.",
              type: "string",
              validation: (rule) =>
                rule
                  .max(28)
                  .warning("The dropdown is narrow — keep it under about 28 characters."),
            }),
          ],
          preview: {
            select: { title: "label", fallback: "area.navLabel", subtitle: "area.title" },
            prepare: ({ title, fallback, subtitle }) => ({
              title: title ?? fallback ?? "(no page chosen)",
              subtitle,
            }),
          },
        }),
      ],
      validation: (rule) =>
        rule
          .min(1)
          .max(8)
          .warning("More than about eight rows and the flyout runs past the fold."),
    }),

    defineField({
      name: "serviceAreas",
      title: "Service areas",
      description:
        "The Service Areas dropdown in the main nav. The short name is what the dropdown shows. ⚠️ These also feed the “areas served” data given to Google on every practice-area and location page, and the build FAILS if a location page's area is not listed here — so this is not only a menu.",
      type: "array",
      group: "header",
      of: [
        defineArrayMember({
          type: "object",
          name: "serviceArea",
          fields: [
            defineField({
              name: "label",
              title: "Full name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "navLabel",
              title: "Short name",
              description: "Shown in the nav dropdown, where the full name is unwieldy.",
              type: "string",
              validation: (rule) =>
                rule.required().max(24).warning("The nav dropdown is narrow — keep the short name short."),
            }),
            defineField({
              name: "href",
              title: "Page path",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        }),
      ],
      validation: (rule) => rule.min(1),
    }),

    defineField({
      name: "aboutLinks",
      title: "About dropdown",
      description:
        "The rows under About. The About row itself is a real link to /about-us/, so this is for pages BESIDE it, not a repeat of it. If this empties, the nav renders About as a plain link rather than a dropdown with one row.",
      type: "array",
      group: "header",
      of: [defineArrayMember({ type: "navLink" })],
    }),

    defineField({
      name: "resourcesLinks",
      title: "Resources dropdown",
      description:
        "The rows under Resources. Resources is a grouping label with no page of its own, so it renders as a button — if this empties, the row disappears entirely rather than becoming a dead link.",
      type: "array",
      group: "header",
      of: [defineArrayMember({ type: "navLink" })],
    }),

    defineField({
      name: "footerNav",
      title: "Footer columns",
      description:
        "The link columns beside the footer logo. Three columns is what the layout is built for.",
      type: "array",
      group: "footer",
      of: [
        defineArrayMember({
          type: "object",
          name: "footerColumn",
          fields: [
            defineField({
              name: "heading",
              title: "Column heading",
              type: "string",
              validation: (rule) =>
                rule.required().max(30).warning("Long column headings wrap and unbalance the footer."),
            }),
            defineField({
              name: "links",
              title: "Links",
              type: "array",
              of: [defineArrayMember({ type: "navLink" })],
              validation: (rule) => rule.min(1),
            }),
          ],
          preview: {
            select: { title: "heading", links: "links" },
            prepare({ title, links }) {
              const count = Array.isArray(links) ? links.length : 0;
              return { title, subtitle: `${count} link${count === 1 ? "" : "s"}` };
            },
          },
        }),
      ],
      validation: (rule) =>
        rule.max(3).warning("The footer grid is built for three columns."),
    }),

    defineField({
      name: "legalLinks",
      title: "Legal bar links",
      description: "The small print beside the copyright line.",
      type: "array",
      group: "footer",
      of: [defineArrayMember({ type: "navLink" })],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Navigation" }),
  },
});
