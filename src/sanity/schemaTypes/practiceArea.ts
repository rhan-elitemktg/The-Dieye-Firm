import { defineType, defineField, defineArrayMember } from "sanity";
import { TagIcon } from "@sanity/icons/Tag";

/* A practice area. Thirty-two of them, all under /family-law/.
 *
 * ═══ slug is the FULL path, and `parent` does NOT derive from it ═══
 *
 * The obvious model — a single-segment slug, with the URL built by walking
 * ancestors — is wrong for this section, and quietly so.
 *
 * Eight of the thirty-two are deliberately re-parented for the SIDEBAR while
 * keeping their FLAT live URLs: Fathers'/Mothers'/Grandparent Rights and
 * Paternity sit under Parental Rights, Hidden Assets and QDROs under Property
 * Division, Protective Orders under Domestic Violence, and Mediation vs
 * Litigation under Divorce. That grouping is what keeps the menu at 11 rows
 * instead of 19, and it follows the firm's own cross-linking.
 *
 * Deriving the path from the parent would move /family-law/paternity/ to
 * /family-law/parental-rights/paternity/ — a redirect on eight pages that carry
 * live SEO equity, for no reason anyone asked for. So the two are separate
 * fields that are ALLOWED to disagree, and disagreeing is the normal case here.
 *
 * `slug` is therefore the whole path under /family-law/ ("divorce/military-
 * divorce"), and `parent` is a reference used only to build the sidebar tree.
 *
 * ═══ The section root ═══
 *
 * /family-law/ is itself a practice area — "Pearland Family Lawyer" — and sits
 * in this collection like any other, with the slug "family-law". The route
 * special-cases it. Note it is NOT the section index: that is /practice-areas/,
 * a different page built from a different source. Mixing those two up is the
 * easiest mistake in this section.
 *
 * ═══ title vs navLabel ═══
 *
 * Every page has both, and they are very different: `title` is SEO-shaped
 * ("Pearland Divorce Lawyer") and `navLabel` is short ("Divorce"). Menus sort
 * and label on navLabel — sorting on title files two thirds of the section
 * under P.
 */
export const practiceArea = defineType({
  name: "practiceArea",
  title: "Practice Areas",
  type: "document",
  icon: TagIcon,
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
        'The <h1> at the top of the page, and the default search-result title. Written for search — e.g. "Experienced Pearland Military Divorce Lawyer".',
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "navLabel",
      title: "Short name",
      type: "string",
      description:
        'What menus, breadcrumbs and cards call this page — e.g. "Military Divorce". The sidebar sorts alphabetically on this, not on the page heading.',
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
        'The full path under /family-law/ — "divorce" or "divorce/military-divorce". These match the live site exactly, so changing one costs a redirect: it is not the same as renaming the page.',
      options: { source: "navLabel", maxLength: 96 },
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "parent",
      title: "Sits under",
      type: "reference",
      to: [{ type: "practiceArea" }],
      options: { disableNew: true },
      description:
        "Where this page appears in the sidebar menu. Leave empty for a top-level area. This does NOT change the URL — several pages are grouped under a parent while keeping a top-level address, which is deliberate.",
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
          /* `pageFaq`, NOT `faq` — `faq` is a global DOCUMENT type (the nine
             site-wide FAQs behind /faq/) and an array member sharing that name
             makes two different shapes compete for one name in the schema
             registry. Sanity reports it as a configuration warning. The stored
             `_type` was migrated to match by
             scripts/import/rename-page-faq-type.ts; the two must move together
             or the Studio shows every existing item as "Unknown type". */
          name: "pageFaq",
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
          preview: {
            select: { title: "question" },
          },
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
    select: { title: "navLabel", slug: "slug.current", parent: "parent.navLabel" },
    prepare({ title, slug, parent }) {
      return {
        title: title ?? "Untitled",
        subtitle: parent ? `↳ under ${parent}  ·  /family-law/${slug}/` : `/family-law/${slug}/`,
      };
    },
  },
});
