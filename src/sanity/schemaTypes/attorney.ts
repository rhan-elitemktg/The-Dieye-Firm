import { defineType, defineField } from "sanity";
import { UserIcon } from "@sanity/icons/User";

/* The firm's attorney. One document today — Papa Dieye.
 *
 * ═══ Why a document type and not fields on Firm Details ═══
 *
 * His name, role and photo appear in five separate places: the "Reviewed by"
 * card on 85 pages, the homepage attorney band, /about-us/, the homepage About
 * pull-quote's attribution, and the thank-you page. Each of those had its own
 * copy of the strings, which is how the firm ended up describing him two
 * different ways (see below). One document ends that.
 *
 * It is a document rather than a singleton because a second attorney is a
 * realistic hire, and the difference then is adding a record rather than
 * reshaping the schema. The Studio pins nothing, so a second one just appears
 * in the list.
 *
 * ═══ ONE role, resolved ═══
 *
 * The site described him as "Founding Attorney" on 2 pages and "Principal &
 * Founder" on 85 — the marketing pages and the article byline had drifted
 * apart, each hardcoded where it was used. Rhan's call, 2026-08-18: it is
 * "Founding Attorney" everywhere. The byline changes on 85 pages as a result,
 * which is the point of asking rather than preserving both.
 *
 * ═══ The rating is a factual claim with a shelf life ═══
 *
 * "5.0" and "Over 150 five-star Google reviews" are numbers that go stale and
 * that a law firm should not overstate. They are fields so the firm can keep
 * them true without a deploy, and the descriptions say so.
 */
export const attorney = defineType({
  name: "attorney",
  title: "Attorneys",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "As it should appear everywhere on the site.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Title",
      type: "string",
      description:
        'Shown under the name — on the article byline, the homepage band and the About page. One value, used everywhere: the site previously said "Founding Attorney" in some places and "Principal & Founder" in others.',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      description:
        "The headshot used on the article byline and beside the enquiry forms. A square crop works best.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Leave empty where the name is already beside the photo.",
        }),
      ],
    }),
    defineField({
      name: "rating",
      title: "Google rating",
      type: "object",
      options: { collapsible: true, collapsed: true },
      description: undefined,
      fields: [
        defineField({
          name: "score",
          title: "Score",
          type: "string",
          description: 'As shown — e.g. "5.0". Keep it matching the firm\'s actual Google rating.',
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
          description:
            'The line beside the score — e.g. "Over 150 five-star Google reviews". A claim about a number that keeps growing, so it is worth revisiting rather than leaving to age.',
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});
