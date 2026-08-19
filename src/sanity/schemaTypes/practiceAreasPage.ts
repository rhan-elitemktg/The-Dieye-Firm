import { defineType, defineField, defineArrayMember } from "sanity";
import { ThLargeIcon } from "@sanity/icons/ThLarge";
import { iconList } from "./iconOptions";

/* /practice-areas/ — the index for the family-law section.
 *
 * NOT /family-law/. That URL is a practice-area page in its own right
 * ("Pearland Family Lawyer"), built from the client's own scraped copy and
 * rendered by family-law/[...slug].astro. Mixing the two up is the easiest
 * mistake in this section of the site; see AGENTS.md.
 *
 * A SINGLETON, built to the conventions in the `homePage` header.
 *
 * ═══ Five bands, three of them here ═══
 *
 * By the Numbers (2 pages) and What Drives Us (8) are shared records. The rule,
 * which `npm run check:page-copy` now enforces:
 *
 *     renders on more than one page  ->  a record in Site Settings
 *     renders on exactly one page    ->  that page's own document
 *
 * ═══ The featured cards are half-editable, and that is deliberate ═══
 *
 * Six cards, each keyed to a practice area by its collection id. The TEXT and
 * the ICON are here; the LABEL and the LINK are not — they come from the
 * practice-area document itself, so a card can never drift from the page it
 * points at, and a page that disappears fails the build rather than shipping a
 * dead card. That was the component's contract before this document existed and
 * it is worth keeping.
 *
 * The PHOTO is also not here: the six are art-directed files in
 * src/assets/images/practice-areas/, keyed by the same id. So changing which
 * six areas are featured needs a developer to add a photo — the id field will
 * accept a new one and the build will stop with a message naming the file to
 * add. If the firm wants to reshuffle these without a deploy, the photos move
 * to Sanity the way the award badges and video posters did; it is the same
 * shape of change and about an hour.
 */
export const practiceAreasPage = defineType({
  name: "practiceAreasPage",
  title: "Practice Areas Page",
  type: "document",
  icon: ThLargeIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "headingAccent", title: "Heading — italic part", type: "string" }),
        defineField({
          name: "headingTail",
          title: "Heading — after the italic",
          type: "string",
          description:
            "The rest of the line, if the italic sits mid-sentence. Start it with punctuation to butt it against the italic, or with a word to have a space added.",
        }),
        defineField({ name: "lead", title: "Lead", type: "text", rows: 3, validation: (rule) => rule.required() }),
        defineField({
          name: "ctaLabel",
          title: "Button label",
          type: "string",
          description: "The gold button. It points at /contact-us/.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "featured",
      title: "Featured Areas",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "headingAccent", title: "Heading — italic part", type: "string" }),
        defineField({ name: "headingTail", title: "Heading — after the italic", type: "string" }),
        defineField({ name: "lead", title: "Lead", type: "text", rows: 2, validation: (rule) => rule.required() }),
        defineField({
          name: "cards",
          title: "Cards",
          type: "array",
          description: "Six, in a three-by-two grid.",
          validation: (rule) => rule.required().length(6),
          of: [
            defineArrayMember({
              type: "object",
              name: "card",
              fields: [
                defineField({
                  name: "areaId",
                  title: "Practice area",
                  type: "string",
                  description:
                    'The practice area\'s path, without /family-law/ — "divorce", "child-custody", "modifications-enforcement". The card takes its title and its link from that page, so they can never drift. An id with no photo in src/assets/images/practice-areas/ stops the build and names the file to add.',
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "label",
                  title: "Shorter title",
                  type: "string",
                  description:
                    'Only where the page\'s own menu label is too long for the card — "Modifications" for "Modifications & Enforcement". Leave empty to use the page\'s.',
                }),
                defineField({
                  name: "icon",
                  title: "Icon",
                  type: "string",
                  options: {
                    list: iconList("divorce", "child-custody", "family-law", "child-support", "property-division", "modifications"),
                  },
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "text",
                  title: "Text",
                  type: "text",
                  rows: 4,
                  description: "Written for this card — it is not the practice area's own summary.",
                  validation: (rule) => rule.required(),
                }),
              ],
              preview: { select: { title: "areaId", subtitle: "text" } },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "allAreas",
      title: "Full Index",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          description: "The list itself is every practice area, A to Z, straight from the collection.",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "headingAccent", title: "Heading — italic part", type: "string" }),
        defineField({ name: "headingTail", title: "Heading — after the italic", type: "string" }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Practice Areas Page" }) },
});
